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
  doc,
} from "firebase/firestore";
import { useEffect } from "react";
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

  // Lekérdezzük az adott időszakban létrehozott bizonylatokat
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
      
      // Végigmegyünk a tételeken, és ha stimmel a kategória, példányosítjuk az ItemModelt
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