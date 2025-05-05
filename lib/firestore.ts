import { firestore,auth } from "@/firebase/firebaseConfig";
import { collection, query, where, onSnapshot,orderBy,limit,deleteDoc } from "firebase/firestore";
import { useEffect } from "react";

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

   return null;
 }