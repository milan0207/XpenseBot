import React, { useState } from "react";
import { Text, View, ScrollView, Image, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import images from "../../constants/images";
import FormField from "../../components/FormField";
import CustomButton from "@/components/CustomButton";
import { Link } from "expo-router";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "expo-router";

const SignIn = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    // Clear previous errors
    setError("");

    // Basic validation
    if (!form.email || !form.password) {
      setError("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        form.email,
        form.password
      );

      // Handle successful login
      console.log("User logged in:", userCredential.user);
      router.replace("/"); // Navigate to home screen
    } catch (error) {
      console.error("Login error:", error);
      // Handle specific errors
      let errorMessage = "Login failed. Please try again.";
      const firebaseError = error as { code?: string }; 
      switch (firebaseError.code) {
        case "auth/invalid-email":
          errorMessage = "Invalid email address";
          break;
        case "auth/user-disabled":
          errorMessage = "This account has been disabled";
          break;
        case "auth/user-not-found":
        case "auth/wrong-password":
          errorMessage = "Invalid email or password";
          break;
      }
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[85vh] px-4 my-6">
          <Image
            source={images.logo}
            resizeMode="contain"
            className="w-[366px] h-[200px]"
          />
          <Text className="text-2xl text-white text-semibold mt-10 font-psemibold">
            Log into XpenseBot
          </Text>

          {error && (
            <Text className="text-red-500 mt-4 text-center">{error}</Text>
          )}

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7 "
          ></FormField>

          <CustomButton
            title="Sign In"
            handlePress={submit}
            containerStyles="mt-7 bg-secondary"
            isLoading={isSubmitting}
          />

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Don't have an account?
            </Text>
            <Link
              className="text-lg font-psemibold text-secondary"
              href="/sign-up"
            >
              Sign Up
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
