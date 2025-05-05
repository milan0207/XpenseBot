import { StyleSheet, View, Text,ScrollView } from "react-native";
import { useState,useEffect } from "react";
import CustomButtonWIcon from "@/components/CustomButtonWIcon";
import CameraView from "@/components/CustomCameraView";
import FormField from "@/components/FormField";
import DatePickerField from "@/components/DatePickerField";
import { auth } from "@/firebase/firebaseConfig";
import { listenForResults } from "@/lib/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import ItemBox from "@/components/ItemBox";

export default function AddScreen() {
  const [showCamera, setShowCamera] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [storeName, setStoreName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [products, setProducts] = useState<{
    category: string;
    name: string;
    quantity: string;
    price: string;
  }[]>([]);
  const [date, setDate] = useState("");
  const userId = auth.currentUser?.uid;
  const [unsubscribe, setUnsubscribe] = useState<() => void>();
  const [isProcessing, setIsProcessing] = useState(false);


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
      setIsProcessing(true);
      setSelectedDate(null);
      setStoreName("");
      setTotalAmount("");
      setProducts([]);
      
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
  try {
    // Parse the JSON response from Gemini
    console.log("Received text:", text);
    const parsedData = JSON.parse(text);
    
    // Extract store information
    setStoreName(parsedData.store_name || "Unknown Store");
    
    // Format and set total amount
    setTotalAmount(parsedData.total_amount ? `RON ${parsedData.total_amount}` : "N/A");

    // Set transaction date
    setDate(parsedData.date || new Date().toISOString().split('T')[0]);

    // Process and flatten items
    const allProducts = Object.entries(parsedData.items).flatMap(
      ([category, items]) => {
        return (items as string[]).map((item) => {
          // Split into three parts: name-quantity-price
          const [name, priceStr, quantityStr] = item.split("-");

          // Clean up quantity format (remove .000 decimals and extra spaces)
          const formattedQuantity = quantityStr
            .replace(/\.000/g, "") // Remove .000 decimals
            .replace(/\s+/g, " ") // Normalize whitespace
            .trim();

          return {
            category,
            name: name.trim(),
            quantity: formattedQuantity || "1 buc", // Fallback to 1 buc
            price: priceStr ? priceStr.trim() : "0.00", // Fallback to 0.00 if price is missing
          };
        });
      }
    );

    // Update products state
    setProducts(allProducts);
    
    // If you need to keep the raw items structure
    // setProductCategories(parsedData.items);

  } catch (error) {
    console.error("Error parsing receipt data:", error);
    setStoreName("Error parsing receipt");
    setTotalAmount("N/A");
    setProducts([]);
  } finally {
    setIsProcessing(false);
  }
};
  return (
    <SafeAreaView>
      <View className="h-full bg-primary">
        {showCamera ? (
          <CameraView
            onClose={() => setShowCamera(false)}
            onTextExtracted={handleTextExtracted}
            onPictureSubmitted={handlePictureSubmitted}
          />
        ) : (
          <ScrollView className="flex flex-col">
            <View className="flex flex-col">
              <FormField
                title="Store name:"
                value={storeName}
                handleChangeText={(text: string) => setStoreName(text)}
                otherStyles="mt-5 mx-5"
                placeholder={"ex.: Kaufland"}
                error={undefined}
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
                placeholder={undefined}
                error={undefined}
              />
            </View>
            <Text className="text-lg text-gray-100 font-pmedium mx-7 my-3">
              The purchased items:
            </Text>
            <View>
              {products.map((product, index) => (
                <ItemBox
                  key={`${product.name}-${index}`}
                  name={product.name}
                  category={product.category}
                  quantity={product.quantity}
                  price={`${product.price} RON`}
                  handlePress={undefined}
                />
              ))}
            </View>

            <View className="flex flex-row items-center justify-between">
              <View className="flex w-1/2 flex-row items-center justify-start">
                <CustomButtonWIcon
                  title="Save"
                  handlePress={handleSave}
                  containerStyles="my-7 w-3/4 mx-2 ml-7"
                  isLoading={false}
                  iconName={"save"}
                />
              </View>
              <View className="flex w-1/2 flex-row items-center justify-start">
                <CustomButtonWIcon
                  title="Scan"
                  handlePress={handleScan}
                  containerStyles="my-7 w-3/4 mx-2 ml-7"
                  isLoading={isProcessing}
                  iconName={"document-scanner"}
                />
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

//known bugs, itembox not working, MockGemini is working but real gemini is not.