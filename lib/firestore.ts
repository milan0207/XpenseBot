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
  CollectionReference,
  DocumentData,
  setDoc,
  doc,
  getDoc,
  writeBatch,
  arrayUnion,
  getDocs,
  Query,
} from "firebase/firestore";
import { useEffect } from "react";
import receiptModel from "@/models/ReceiptModel";
import ItemModel from "@/models/ItemModel";
import { functions } from "@/firebase/firebaseConfig";
import { httpsCallable } from "firebase/functions";

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
  // Return 0 if monthlyBudget hasn't been set yet
  return data.monthlyBudget ?? 0;
};

export const sendFriendRequestByEmail = async (
  senderId: string,
  receiverEmail: string
) => {
  try {
    console.log("senderId: ", senderId);
    // 1. Email alapján UID lekérése Cloud Function-nel
    const findUser = httpsCallable(functions, "findUserByEmail");
    const response = await findUser({ email: receiverEmail });
    console.log("findUser response: ", response);
    const receiver = response.data as { uid: string; email: string };

    // 2. Ellenőrzések
    if (receiver.uid === senderId) {
      throw new Error("Nem küldhetsz kérést saját magadnak");
    }
    console.log("receiver: ", receiver.uid);
    console.log("sender: ", senderId);
    // 3. Duplikált kérések ellenőrzése
    const requestsRef = collection(firestore, "friendRequests");
    const existingQuery = query(
      requestsRef,
      where("from", "==", senderId),
      where("to", "==", receiver.uid),
      where("status", "in", ["pending", "accepted"])
    );

    const existingSnapshot = await getDocs(existingQuery);
    if (!existingSnapshot.empty) {
      throw new Error("Már létezik aktív kérelem");
    }

    // 4. Kérés létrehozása
    await addDoc(requestsRef, {
      from: senderId,
      to: receiver.uid,
      status: "pending",
      createdAt: serverTimestamp(),
      receiverEmail: receiver.email,
      senderEmail: (await auth.currentUser?.email) || "ismeretlen",
    });

    return { success: true, receiverId: receiver.uid };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error sending friend request:", error);
      throw new Error(error.message || "Hiba a kérés küldésekor");
     
    } else {
      throw new Error("Hiba a kérés küldésekor");
    }
  }
};

export const getFriendRequests = async (userId: string) => {
  const q = query(
    collection(firestore, "friendRequests"),
    where("to", "==", userId),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const acceptFriendRequest = async (requestId: string) => {
  const requestRef = doc(firestore, "friendRequests", requestId);
  const batch = writeBatch(firestore);

  // 1. Get request data with error handling
  const requestSnap = await getDoc(requestRef);
  if (!requestSnap.exists()) {
    throw new Error("Friend request not found");
  }

  const { from, to } = requestSnap.data()!;
  console.log("Updating friends for users:", { from, to });

  //sets also the email of the sender

  const toEmail= requestSnap.data()?.receiverEmail;
  const fromEmail= requestSnap.data()?.senderEmail;

  // 3. Use setDoc with merge instead of update
  batch.set(
    doc(firestore, "users", from),
    {
      friends: arrayUnion({
        id: to,
        email: toEmail,
      }),
    },
    { merge: true }
  );

  batch.set(
    doc(firestore, "users", to),
    {
      friends: arrayUnion({
        id: from,
        email: fromEmail,
      }),
    },
    { merge: true }
  );

  // 4. Update request status
  batch.update(requestRef, { status: "accepted" });

  await batch.commit();
};

export const rejectFriendRequest = async (requestId: string) => {
  await deleteDoc(doc(firestore, "friendRequests", requestId));
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
  const friends  = userSnap.data()?.friends || [];

  const unsubscribers: (() => void)[] = [];
  console.log("friends from firestore shared: ", friends);
  console.log("running get shared receipts");
  friends.forEach((friend: { id: string; }) => {
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

  // Optional: Return a function to unsubscribe all listeners
  return () => unsubscribers.forEach((unsub) => unsub());
};

export const getFriends = async (userId: string) => {
  const docRef = doc(firestore, "users", userId);
  const snapshot = await getDoc(docRef);

  if (snapshot.exists()) {
    const data = snapshot.data();
    const friends = data.friends || [];
    console.log("friends from firestore:", friends);
    return friends;
  } else {
    console.log("User not found");
    return [];
  }
};

export const getUnreadNotificationsCount = async (userId: string) => {
  const q = query(
    collection(firestore, "friendRequests"),
    where("to", "==", userId),
    where("status", "==", "pending")
  );

  const snapshot = await getDocs(q);
  console.log("unread notifications count: ", snapshot.size);
  return snapshot.size;
}