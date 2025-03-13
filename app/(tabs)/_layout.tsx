import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { Tabs, router, usePathname } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../components/firebase/firebaseConfig";
import { Href, useRouter } from "expo-router";
import { useSegments } from "expo-router";
interface TabIconProps {
  color: string;
  name: string;
  focused: boolean;
  iconName: React.ComponentProps<typeof AntDesign>["name"];
}
const unprotectedRoutes = ["/sign-in", "/sign-up"]; // routes that don't require authentication
const TabIcon = ({ color, name, focused, iconName }: TabIconProps) => {
  return (
    <View className="items-center justify-center" style={{ minWidth: 80 }}>
      <AntDesign
        name={iconName}
        size={24}
        color={color}
        style={{ marginBottom: 2 }}
      />
      <Text
        className={`${focused ? "font-psemibold" : "font-pregular"} text-xs`}
        style={{ color: color }}
      >
        {name}
      </Text>
    </View>
  );
};

const TabsLayout = () => {
  const currentPath = usePathname();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("user:" + user?.email);
      // if the user is not logged in it it redirects it to the sign in page
      if (!user && !unprotectedRoutes.includes(currentPath)) {
        router.replace("/sign-in");
      }
    });

    return () => unsubscribe(); // cleaning up the event listener
  }, []); //[] means it will only run once when the component mountsss
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: "orange",
        tabBarInactiveTintColor: "#888",
        tabBarStyle: {
          backgroundColor: "#1E1E1E",
          borderTopWidth: 0,
          paddingTop: 12,
          height: 60,
        },
        lazy: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={color}
              name="Home"
              focused={focused}
              iconName="home"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={color}
              name="Add"
              focused={focused}
              iconName="pluscircleo"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="list"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={color}
              name="Receipts"
              focused={focused}
              iconName="filetext1"
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              color={color}
              name="Settings"
              focused={focused}
              iconName="setting"
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
