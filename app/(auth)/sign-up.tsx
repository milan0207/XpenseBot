import React, { useState } from "react";
import { Text, View, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FormField from "../../components/FormField";
import CustomButton from "../../components/CustomButton";
import { Link } from "expo-router";
import { useRouter } from "expo-router";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import images from "../../constants/images";

const validateEmail = (email: string) => {
  return /\S+@\S+\.\S+/.test(email);
};

const validatePassword = (password: string) => {
  const errors = [];

  if (password.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("At least one uppercase letter");
  if (!/[0-9]/.test(password)) errors.push("At least one number");
  if (!/[!@#$%^&*]/.test(password)) errors.push("At least one special character");

  return errors;
};

const SignUp = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
    password2: "",
    username: "",
  });

  const [errors, setErrors] = useState<{
    email: string;
    password: string[];
    password2: string;
  }>({
    email: "",
    password: [],
    password2: "",
  });

  const handleEmailChange = (email: string) => {
    setForm({ ...form, email });
    setErrors({
      ...errors,
      email: validateEmail(email) ? "" : "Invalid email format",
    });
  };

  const handlePasswordChange = (password: string) => {
    setForm({ ...form, password });
    setErrors({ ...errors, password: validatePassword(password) });
  };

  const handleConfirmPasswordChange = (password2: string) => {
    setForm({ ...form, password2 });
    setErrors({
      ...errors,
      password2: password2 === form.password ? "" : "Passwords do not match",
    });
  };

  const router = useRouter();
  const auth = getAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async () => {
    if (!errors.email && errors.password.length === 0 && !errors.password2) {
      setIsSubmitting(true);

      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          form.email,
          form.password,
        );
        const user = userCredential.user;
        await updateProfile(user, { displayName: form.username });

        console.log("User signed up:", user.email);
        console.log("Success", "Account created successfully!");
        router.push("/");

        // Navigate to another screen after success (optional)
        // navigation.navigate("Home");
      } catch (error) {
        if (error instanceof Error) {
          console.error("Sign-up error:", error.message);
        } else {
          console.error("Sign-up error:", error);
        }
      }

      setIsSubmitting(false);

      console.log("Form submitted:", form);
    } else {
      console.log("Fix validation errors before submitting.");
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[85vh] px-4 my-6">
          <Image source={images.logo} resizeMode="contain" className="w-[115px] h-[155px]" />
          <Text className="text-2xl text-white text-semibold mt-10 font-psemibold">
            Sign Up to XpenseBot
          </Text>

          <FormField
            title="Username"
            value={form.username}
            handleChangeText={(e: string) => setForm({ ...form, username: e })}
            otherStyles="mt-7"
            placeholder={undefined}
            error={undefined}
          />

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={handleEmailChange}
            otherStyles="mt-7"
            keyboardType="email-address"
            error={errors.email}
            placeholder={undefined}
          />

          <FormField
            title="Password"
            value={form.password}
            handleChangeText={handlePasswordChange}
            otherStyles="mt-7"
            error={errors.password.join(", ")}
            placeholder={undefined}
          />

          <FormField
            title="Confirm Password"
            value={form.password2}
            handleChangeText={handleConfirmPasswordChange}
            otherStyles="mt-7"
            error={errors.password2}
            placeholder={undefined}
          />

          <CustomButton
            title="Sign-up"
            handlePress={submit}
            containerStyles="mt-7 bg-secondary"
            isLoading={isSubmitting}
          />

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">Already have an account?</Text>
            <Link className="text-lg font-psemibold text-secondary" href="/sign-in">
              Sign In
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
