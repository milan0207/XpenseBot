import { StyleSheet, View, Text } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import EditScreenInfo from "@/components/EditScreenInfo";
import { useState } from "react";
import CustomButtonWIcon from "@/components/CustomButtonWIcon";
import CameraView from "@/components/CustomCameraView";

export default function AddScreen() {
  const [showCamera, setShowCamera] = useState(false);
  const handleSave = () => {
    console.log("Save pressed");
  };
  const handleScan = () => {
    console.log("Scan pressed");
    setShowCamera(true);
  };
  return (
    <View className="h-full bg-primary">
      {showCamera ? (
        <CameraView onClose={() => setShowCamera(false)} />
      ) : (
        <View className="flex flex-row items-center justify-between">
          <View className="flex w-1/2 flex-row items-center justify-start">
            <CustomButtonWIcon
              title="Save"
              handlePress={handleSave}
              containerStyles="mt-7 w-3/4 mx-2 ml-7"
              isLoading={false}
            />
          </View>
          <View className="flex w-1/2 flex-row items-center justify-start">
            <CustomButtonWIcon
              title="scan"
              handlePress={handleScan}
              containerStyles="mt-7 w-3/4 mx-2 ml-7"
              isLoading={false}
            />
          </View>
        </View>
      )}
    </View>
  );
}
