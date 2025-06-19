import {
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
  addDoc,
} from "firebase/firestore";
import { firestore, auth } from "@/firebase/firebaseConfig";
import { functions } from "@/firebase/firebaseConfig";
import { httpsCallable } from "firebase/functions";

export const sendFriendRequestByEmail = async (senderId: string, receiverEmail: string) => {
  try {
    console.log("senderId: ", senderId);
    const findUser = httpsCallable(functions, "findUserByEmail");
    const response = await findUser({ email: receiverEmail });
    console.log("findUser response: ", response);
    const receiver = response.data as { uid: string; email: string };

    if (receiver.uid === senderId) {
      throw new Error("You cannot send a friend request to yourself");
    }
    const requestsRef = collection(firestore, "friendRequests");
    const existingQuery = query(
      requestsRef,
      where("from", "==", senderId),
      where("to", "==", receiver.uid),
      where("status", "in", ["pending", "accepted"]),
    );

    const existingSnapshot = await getDocs(existingQuery);
    if (!existingSnapshot.empty) {
      throw new Error("There is already a pending or accepted request");
    }

    await addDoc(requestsRef, {
      from: senderId,
      to: receiver.uid,
      status: "pending",
      createdAt: serverTimestamp(),
      receiverEmail: receiver.email,
      senderEmail: (await auth.currentUser?.email) || "ismeretlen",
    });

    const sendNotification = httpsCallable(functions, "sendPushNotification");
    await sendNotification({
      receiverID: receiver.uid, // needs to be tested
      title: "New friend request",
      body: `${(await auth.currentUser?.email) || "Unknown"} sent you a friend request`,
    });
    console.log("Friend request sent to:", receiver.uid);

    return { success: true, receiverId: receiver.uid };
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error sending friend request:", error);
      throw new Error(error.message || "Error sending friend request");
    } else {
      throw new Error("An unknown error occurred");
    }
  }
};

export const getFriendRequests = async (userId: string) => {
  const q = query(
    collection(firestore, "friendRequests"),
    where("to", "==", userId),
    where("status", "==", "pending"),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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

  const toEmail = requestSnap.data()?.receiverEmail;
  const fromEmail = requestSnap.data()?.senderEmail;

  // 3. Use setDoc with merge instead of update
  batch.set(
    doc(firestore, "users", from),
    {
      friends: arrayUnion({
        id: to,
        email: toEmail,
      }),
    },
    { merge: true },
  );

  batch.set(
    doc(firestore, "users", to),
    {
      friends: arrayUnion({
        id: from,
        email: fromEmail,
      }),
    },
    { merge: true },
  );

  // 4. Update request status
  batch.update(requestRef, { status: "accepted" });

  await batch.commit();
};

export const rejectFriendRequest = async (requestId: string) => {
  await deleteDoc(doc(firestore, "friendRequests", requestId));
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
    where("status", "==", "pending"),
  );

  const snapshot = await getDocs(q);
  console.log("unread notifications count: ", snapshot.size);
  return snapshot.size;
};
