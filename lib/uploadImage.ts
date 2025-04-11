import { storage,auth } from "@/firebase/firebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

import uuid from "react-native-uuid";

export const uploadImage = async (localUri: string, userId: string) => {
  try {
    // 1. Convert local URI to blob
    const response = await fetch(localUri);
    const blob = await response.blob();

    // 2. Create storage reference
    const fileExt = localUri.split(".").pop();
    const storageRef = ref(storage, `uploads/${userId}/${uuid.v4()}.${fileExt}`);

    // 3. Upload file
    const uploadTask = await uploadBytes(storageRef, blob);

    console.log("Upload successful:", uploadTask.ref.fullPath);
    return uploadTask.ref.fullPath;
  } catch (error) {
    console.error("Upload failed:", error);
    throw error;
  }
};

