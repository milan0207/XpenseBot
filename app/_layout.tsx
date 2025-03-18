import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, usePathname, router, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/components/useColorScheme";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
    "Inter_18pt-Black": require("../assets/fonts/Inter/Inter_18pt-Black.ttf"),
    "Inter_18pt-Bold": require("../assets/fonts/Inter/Inter_18pt-Bold.ttf"),
    "Inter_18pt-BoldItalic": require("../assets/fonts/Inter/Inter_18pt-BoldItalic.ttf"),
    "Inter_18pt-ExtraBold": require("../assets/fonts/Inter/Inter_18pt-ExtraBold.ttf"),
    "Inter_18pt-ExtraBoldItalic": require("../assets/fonts/Inter/Inter_18pt-ExtraBoldItalic.ttf"),
    "Inter_18pt-ExtraLight": require("../assets/fonts/Inter/Inter_18pt-ExtraLight.ttf"),
    "Inter_18pt-ExtraLightItalic": require("../assets/fonts/Inter/Inter_18pt-ExtraLightItalic.ttf"),
    "Inter_18pt-Italic": require("../assets/fonts/Inter/Inter_18pt-Italic.ttf"),
    "Inter_18pt-Light": require("../assets/fonts/Inter/Inter_18pt-Light.ttf"),
    "Inter_18pt-LightItalic": require("../assets/fonts/Inter/Inter_18pt-LightItalic.ttf"),
    "Inter_18pt-Medium": require("../assets/fonts/Inter/Inter_18pt-Medium.ttf"),
    "Inter_18pt-MediumItalic": require("../assets/fonts/Inter/Inter_18pt-MediumItalic.ttf"),
    "Inter_18pt-Regular": require("../assets/fonts/Inter/Inter_18pt-Regular.ttf"),
    "Inter_18pt-SemiBold": require("../assets/fonts/Inter/Inter_18pt-SemiBold.ttf"),
    "Inter_18pt-SemiBoldItalic": require("../assets/fonts/Inter/Inter_18pt-SemiBoldItalic.ttf"),
    "Inter_18pt-Thin": require("../assets/fonts/Inter/Inter_18pt-Thin.ttf"),
    "Inter_18pt-ThinItalic": require("../assets/fonts/Inter/Inter_18pt-ThinItalic.ttf"),

    ...FontAwesome.font,
  });
  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
