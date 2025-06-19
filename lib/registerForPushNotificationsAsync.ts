import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";
import { auth, firestore } from "@/firebase/firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

function handleRegistrationError(errorMessage: string) {
  alert(errorMessage);
  throw new Error(errorMessage);
}

export const getPushToken = async (userId: string) => {
  const docRef = doc(firestore, "users", userId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    console.log("Push token from Firestore:", data.pushToken);
    return data.pushToken;
  } else {
    console.log("No such document!");
    return null;
  }
};

export const savePushToken = async (userId: string, pushToken: string) => {
  const docRef = doc(firestore, "users", userId);
  try {
    await setDoc(docRef, { pushToken }, { merge: true });
    console.log("Push token saved.");
  } catch (error) {
    console.error("Error saving push token:", error);
  }
};

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      handleRegistrationError("Permission not granted to get push token for push notification!");
      return;
    }
    const projectId =
      Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
    if (!projectId) {
      handleRegistrationError("Project ID not found");
    }
    try {
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;
      const userId = auth.currentUser?.uid;
      if (!userId) {
        handleRegistrationError("User not found");
        return;
      }
      if ((await getPushToken(userId)) != pushTokenString) {
        savePushToken(userId, pushTokenString);
      }
      console.log("pushtoken: " + pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    handleRegistrationError("Must use physical device for push notifications");
  }
}
