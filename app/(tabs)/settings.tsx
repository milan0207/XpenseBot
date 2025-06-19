import { ScrollView, Text, View } from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import CustomButton from "@/components/CustomButton";
import { getAuth, signOut } from "firebase/auth";
import FormField from "@/components/FormField";
import { getMonthlyBudget, saveMonthlyBudget } from "@/lib/receiptDb";

export default function SettingsScreen() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isSigningOut, setisSigningOut] = useState(false);
  const [showFormfield, setShowFormfield] = useState(false);
  const auth = getAuth();
  const [monthlyBudget, setMonthlyBudget] = useState(0);

  useEffect(() => {
    const fetchMonthlyBudget = async () => {
      if (auth.currentUser) {
        const budget = await getMonthlyBudget(auth.currentUser.uid);
        setMonthlyBudget(budget);
      }
    };

    fetchMonthlyBudget();
  }, []);
  const signout = () => {
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
      <ScrollView className="h-full bg-primary">
        <Text className="text-white text-2xl font-bold ml-5 mt-10">
          Username: {auth.currentUser?.displayName}
        </Text>
        <Text className="text-white text-lg font-bold ml-5 mt-2">
          Monthly Budget: {monthlyBudget}
        </Text>
        <View className="flex-1 mx-5 mt-10">
          <Text className="text-white text-lg font-bold">Settings</Text>

          {showFormfield && (
            <View>
              <FormField
                label="Monthly Budget"
                placeholder="Enter your monthly budget"
                value={monthlyBudget}
                setValue={setMonthlyBudget}
                isPassword={false}
                isMultiline={false}
                containerStyles="mt-2"
                title={undefined}
                handleChangeText={(text: number) => setMonthlyBudget(text)}
                otherStyles={undefined}
                error={undefined}
                keyboardType="numeric"
              />
              <View className="flex-row justify-between space-x-4">
                <CustomButton
                  title="Save"
                  handlePress={async () => {
                    console.log("saving monthly budget");
                    saveMonthlyBudget(auth.currentUser?.uid || "", await monthlyBudget);

                    setShowFormfield(false);
                  }}
                  containerStyles="flex-1 mt-6 bg-greenAccent mx-2"
                />
                <CustomButton
                  title="Cancel"
                  handlePress={() => {
                    setShowFormfield(false);
                  }}
                  containerStyles="flex-1 mt-6 bg-redAccent mx-2"
                />
              </View>
            </View>
          )}

          {!showFormfield && (
            <CustomButton
              title="Set monthly budget"
              handlePress={() => {
                setShowFormfield(true);
              }}
              containerStyles="mt-6 bg-secondary"
            />
          )}
          <CustomButton
            title="Sign Out"
            handlePress={signout}
            containerStyles="mt-6 bg-redAccent"
            isLoading={isSigningOut}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
