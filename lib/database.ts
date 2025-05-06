import { ref, push, set } from "firebase/database";
import receiptModel from "@/models/ReceiptModel";
import { getDb } from "@/firebase/firebaseConfig";


const saveReceipt = async (receipt: receiptModel, userId: string) => {
  try {
    const db = getDb();
    // 2. Hivatkozás a megfelelő útvonalra
    const userReceiptsRef = ref(db, `users/${userId}/receipts`);
    console.log("userReceiptsRef", userReceiptsRef);

    // 3. Új egyedi referencia létrehozása
    const newReceiptRef = push(userReceiptsRef);
    console.log("newReceiptRef", newReceiptRef);

    // 4. Alakítsd át az adatokat
    const receiptData = {
      ...receipt,
      id: newReceiptRef.key, // Az automatikusan generált ID
      createdAt: Date.now(),
      updatedAt: Date.now(),
      userId: userId,
    };
    console.log("receiptData", JSON.stringify(receiptData, null, 2));
    // 5. Adatok mentése
    const timeout = (ms: number) =>
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Timeout")), ms)
      );
    
    await Promise.race([set(newReceiptRef, receiptData), timeout(5000)]);

    console.log("Receipt saved with ID:", newReceiptRef.key);
    return newReceiptRef.key;
  } catch (error) {
    console.error("Error saving receipt:", error);
    throw error;
  }
};

export default saveReceipt;