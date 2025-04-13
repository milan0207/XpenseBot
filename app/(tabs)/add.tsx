import { StyleSheet, View, Text } from "react-native";
import { useState,useEffect } from "react";
import CustomButtonWIcon from "@/components/CustomButtonWIcon";
import CameraView from "@/components/CustomCameraView";
import FormField from "@/components/FormField";
import DateTimePicker from "@react-native-community/datetimepicker";
import DatePickerField from "@/components/DatePickerField";
import { auth } from "@/firebase/firebaseConfig";
import { listenForResults } from "@/lib/firestore";

export default function AddScreen() {
  const [showCamera, setShowCamera] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [storeName, setStoreName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const userId = auth.currentUser?.uid;
  const [unsubscribe, setUnsubscribe] = useState<() => void>();


  useEffect(() => {
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [unsubscribe]);

  const handleSave = () => {
    console.log("Save pressed");
  };
  const handleScan = () => {
    console.log("Scan pressed");
    setShowCamera(true);

  };

   const handlePictureSubmitted = (storagePath: string) => {
     if (!userId) return;

     // Clear previous listener
     if (unsubscribe) {
       unsubscribe();
     }

     // Create new listener
     const newUnsubscribe = listenForResults(userId, (text) => {
       console.log("Extracted text:", text);
       handleTextExtracted(text);

       // Automatically unsubscribe after receiving result
       newUnsubscribe();
       setUnsubscribe(undefined);
     });

     setUnsubscribe(() => newUnsubscribe);
   };

  const handleTextExtracted = (text: string) => {
    setExtractedText(text);
    // You can add automatic parsing here if your text has a consistent format
    // Example simple parsing (adjust based on your OCR output format):
    const lines = text.split("\n");
    setStoreName(lines[0] || ""); // Assume first line is store name
    setTotalAmount(lines[1] || ""); // Assume second line is total amount
  };
  return (
    <View className="h-full bg-primary">
      {showCamera ? (
        <CameraView
          onClose={() => setShowCamera(false)}
          onTextExtracted={handleTextExtracted}
          onPictureSubmitted={handlePictureSubmitted}
        />
      ) : (
        <View className="flex flex-col">
          <View className="flex flex-col">
            <FormField
              title="Store name:"
              value={storeName}
              handleChangeText={(text: string) => setStoreName(text)}
              otherStyles="mt-5 mx-5"
            />
            <DatePickerField
              label="Date"
              value={selectedDate}
              onChange={(date: Date) => setSelectedDate(date)}
              otherStyles="mt-5 mx-5"
            />
            <FormField
              title="Total amount:"
              value={totalAmount}
              handleChangeText={(text: string) => setTotalAmount(text)}
              otherStyles="mt-3 mx-5"
            />
          </View>
          <Text className="text-lg text-gray-100 font-pmedium ml-7 mb-2 mt-3">
            The purchased items: {extractedText}
          </Text>

          <View className="flex flex-row items-center justify-between">
            <View className="flex w-1/2 flex-row items-center justify-start">
              <CustomButtonWIcon
                title="Save"
                handlePress={handleSave}
                containerStyles="mt-7 w-3/4 mx-2 ml-7"
                isLoading={false}
                iconName={"save"}
              />
            </View>
            <View className="flex w-1/2 flex-row items-center justify-start">
              <CustomButtonWIcon
                title="Scan"
                handlePress={handleScan}
                containerStyles="mt-7 w-3/4 mx-2 ml-7"
                isLoading={false}
                iconName={"document-scanner"}
              />
            </View>
          </View>
        </View>
      )}
    </View>
  );
}
