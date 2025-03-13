import { StyleSheet, ScrollView } from "react-native";
import React, { useState } from "react";
import EditScreenInfo from "@/components/EditScreenInfo";
import { Text, View } from "@/components/Themed";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@/components/CustomButton";
import { getAuth, signOut } from "firebase/auth";

export default function SettingsScreen() {
  const [isSigningOut, setisSigningOut] = useState(false);
  const signout = () => {
    const auth = getAuth();
    signOut(auth)
      .then(() => {
        // Sign-out successful.
      })
      .catch((error) => {
        console.log("error happened when signing out:" + error);
      });
  };
  return (
    <SafeAreaView>
      <ScrollView>
        <CustomButton
          title="Sign Out"
          handlePress={signout}
          containerStyles="mt-6"
          isLoading={isSigningOut}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
