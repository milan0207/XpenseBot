import { firestore,auth } from "@/firebase/firebaseConfig";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  limit,
  deleteDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
  updateDoc,
  setDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import receiptModel from "@/models/ReceiptModel";
import ItemModel from "@/models/ItemModel";


export const listenForResults = (userId: string, callback: (text: string) => void) => {
  const q = query(
    collection(firestore, "documentResults"),
    where("userId", "==", userId),
    orderBy("processedAt", "desc"),
    limit(1)
  );
  console.log("running the ")
  return onSnapshot(q,async (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === "added") {
        callback(change.doc.data().parsedResponse as string);
        //delete the document after processing
        //We do not need it anymore
        await deleteDoc(change.doc.ref);
        console.log("Document deleted after processing: ", change.doc.id);
      }
    });
  });
};

export const saveReceipt = async (receipt: receiptModel, userId: string) => {
  const items = receipt.items.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    price: item.price,
  }));
  try {
    // Convert items to plain objects
    
    if (!(receipt.date instanceof Date)) {
      console.error("Invalid or missing date:", receipt.date);
      throw new Error("receipt.date must be a valid Date object");
    }
    const timestampDate=Timestamp.fromDate(receipt.date);
    console.log("receiptID: ", receipt.id);
  if (!receipt.id) {
    const docRef = await addDoc(
      collection(firestore, "users", userId, "receipts"),
      {
        store_name: receipt.store_name,
        date: timestampDate,
        total_amount: receipt.total_amount,
        currency: receipt.currency || "RON",
        items: items, // Use the converted plain objects
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        userId: userId,
      }
    );
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
  }
  } catch (error) {
    console.error("Error saving receipt:", error);
    throw error;
  }

  // If the receipt already exists, you can update it instead of creating a new one
  try {
    const docRef = doc(collection(firestore, "users", userId, "receipts"), receipt.id);
    if (receipt.store_name === "" && receipt.total_amount === 0) {
      deleteDoc(docRef);
      return receipt.id;      
    }
    await updateDoc(docRef, {
      store_name: receipt.store_name,
      date: Timestamp.fromDate(receipt.date),
      total_amount: receipt.total_amount,
      currency: receipt.currency || "RON",
      items: items, // Use the converted plain objects
      updatedAt: serverTimestamp(),
    });
  }
  catch (error) {
    console.error("Error updating receipt:", error);
    throw error;
  }
  return receipt.id;
};

export const getReceipts = async (userId: string,fromDate:Date,toDate:Date, callback: (receipts: receiptModel[]) => void) => {
  
  const fromTimestamp = Timestamp.fromDate(fromDate);
  const toTimestamp = Timestamp.fromDate(toDate);
  console.log("fromDate: from firestore", fromDate);
  console.log("toDate: from firestore", toDate);

  const q = query(
    collection(firestore, "users", userId, "receipts"),
    where("date", ">=", fromTimestamp),
    where("date", "<=", toTimestamp),
    orderBy("date", "desc")
  );
  console.log("running the get receipts")
  return onSnapshot(q, (snapshot) => {
    const receipts: receiptModel[] = snapshot.docs.map((doc) => {
      const data = doc.data();
      const date=new Date(data.date.seconds*1000);
      return {
        id: doc.id,
        store_name: data.store_name,
        date: date,
        total_amount: data.total_amount,
        currency: data.currency || "RON",
        items: data.items || [],
      } as receiptModel;
    });
    callback(receipts);
  });
}

export const getItems = (
  userId: string,
  fromDate: Date,
  toDate: Date,
  category: string,
  callback: (items: ItemModel[]) => void
) => {
  const fromTimestamp = Timestamp.fromDate(fromDate);
  const toTimestamp = Timestamp.fromDate(toDate);

  const q = query(
    collection(firestore, "users", userId, "receipts"),
    where("date", ">=", fromTimestamp),
    where("date", "<=", toTimestamp),
    orderBy("date", "desc")
  );
  console.log("running the get items")
  return onSnapshot(q, (snapshot) => {
    const items: ItemModel[] = [];
    let i = 100;
    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const receiptItems = data.items || [];
      
      receiptItems.forEach((it: any) => {
        if (!category || it.category === category) {
          items.push(new ItemModel( i+it.id, it.name, it.category, it.price));
        }
      });
       i=i+100;
    });

    callback(items);
  });
};

export const saveMonthlyBudget = async (userId: string, budget: number) => {
  const docRef = doc(firestore, "users", userId);
  await setDoc(docRef, { monthlyBudget: budget }, { merge: true });
};

export const getMonthlyBudget = async (userId: string) => {
  const docRef = doc(firestore, "users", userId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    // Document doesn't exist - consider initializing it here
    console.log("No document found, consider creating one");
    return 0; // or your default budget value
  }

  const data = docSnap.data();
  console.log("data from firestore: ", data);
  // Return 0 if monthlyBudget hasn't been set yet
  return data.monthlyBudget ?? 0;
};

// Shared Receipts Access
export const getSharedReceipts = async (
  userId: string,
  fromDate: Date,
  toDate: Date,
  callback: (receipts: receiptModel[]) => void
) => {
  const fromTimestamp = Timestamp.fromDate(fromDate);
  const toTimestamp = Timestamp.fromDate(toDate);
  console.log("fromDate: from firestore shared", fromDate);
  console.log("toDate: from firestore shared", toDate);
  const userRef = doc(firestore, "users", userId);
  const userSnap = await getDoc(userRef);
  const friends = userSnap.data()?.friends || [];

  const unsubscribers: (() => void)[] = [];
  console.log("friends from firestore shared: ", friends);
  console.log("running get shared receipts");
  friends.forEach((friend: { id: string }) => {
    const q = query(
      collection(firestore, "users", friend.id, "receipts"),
      where("date", ">=", fromTimestamp),
      where("date", "<=", toTimestamp),
      orderBy("date", "desc")
    );
    console.log("friendId: ", friend.id);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const friendReceipts: receiptModel[] = snapshot.docs.map((doc) => {
        const data = doc.data();
        const date = new Date(data.date.seconds * 1000);
        console.log("date from firestore: ", date);
        return {
          id: doc.id,
          store_name: data.store_name,
          date,
          total_amount: data.total_amount,
          currency: data.currency || "RON",
          items: data.items || [],
          createdAt: data.createdAt || null,
          owner: friend.id,
        };
      });

      callback(friendReceipts);
    });

    unsubscribers.push(unsubscribe);
  });

  // Return a function to unsubscribe all listeners
  return () => unsubscribers.forEach((unsub) => unsub());
};