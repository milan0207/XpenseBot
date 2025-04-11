import { firestore,auth } from "@/firebase/firebaseConfig";
import { collection, query, where, onSnapshot,orderBy,limit } from "firebase/firestore";
import { useEffect } from "react";

export const listenForResults = (userId: string, callback: (text: string) => void) => {
  const q = query(
    collection(firestore, "documentResults"),
    where("userId", "==", userId),
    orderBy("processedAt", "desc"),
    limit(1)
  );
  
  return onSnapshot(q, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        callback(change.doc.data().extractedText);
      }
    });
  });
};
// Usage:
export default function ResultListenerComponent() {
  useEffect(() => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    const unsubscribe = listenForResults(userId, (text) => {
      console.log("Extracted text:", text);
    });

    return () => unsubscribe();
  }, []);

  return null; // vagy UI, ha kell
}