import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "expo-router";
import { ActivityIndicator, View } from "react-native";

const AuthGuard = ({ children }) => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user === undefined) return; // Firebase még tölt

    if (!user) {
      router.replace("/sign-in"); // Ha nincs bejelentkezve, irány a bejelentkezés
    }
  }, [user]);

  if (user === undefined) {
    return (
      <View className="flex-1 justify-center items-center bg-primary">
        <ActivityIndicator size="large" color="#FFF" />
      </View>
    );
  }

  return children;
};

export default AuthGuard;
