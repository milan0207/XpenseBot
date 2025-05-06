import { StyleSheet, View, Text,ScrollView,Modal } from "react-native";
import { useState,useEffect } from "react";
import CustomButtonWIcon from "@/components/CustomButtonWIcon";
import CameraView from "@/components/CustomCameraView";
import FormField from "@/components/FormField";
import DatePickerField from "@/components/DatePickerField";
import { auth } from "@/firebase/firebaseConfig";
import { listenForResults } from "@/lib/firestore";
import { SafeAreaView } from "react-native-safe-area-context";
import ItemBox from "@/components/ItemBox";
import receiptModel from "@/models/ReceiptModel"
import itemModel from "@/models/ItemModel";
import EditItemScreen from "@/components/EditItemScreen"; // adjust path as needed
import saveReceipt from "@/lib/database";


export default function AddScreen() {
  const [showCamera, setShowCamera] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [storeName, setStoreName] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [products, setProducts] = useState<itemModel[]>([]);
  const [date, setDate] = useState("");
  const userId = auth.currentUser?.uid;
  const [unsubscribe, setUnsubscribe] = useState<() => void>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<itemModel | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currency, setCurrency] = useState("");

  useEffect(() => {
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [unsubscribe]);

  const handleSave = () => {
    const receipt = new receiptModel(
      0, 
      storeName,
      date,
      parseFloat(totalAmount),
      currency,
      products
    );
    if (!userId) return;
    setIsProcessing(true);
    saveReceipt(receipt, userId)
      .then((receiptId) => {
        console.log("Receipt saved with ID:", receiptId);
        setIsProcessing(false);
        setStoreName("");
        setTotalAmount("");
        setProducts([]);
        setSelectedDate(null);
      })
      .catch((error) => {
        console.error("Error saving receipt:", error);
        setIsProcessing(false);
      });
  };
  const handleScan = () => {
    console.log("Scan pressed");
    setShowCamera(true);

  };

  const itemPressed = (item: itemModel) => {
    setSelectedItem(item);
    setModalVisible(true);
  };
  const closeModal = () => {
      setModalVisible(false);
      setSelectedItem(null);
    };

   const handlePictureSubmitted = (storagePath: string) => {
     if (!userId) return;
      setIsProcessing(true);
      setSelectedDate(null);
      setStoreName("");
      setTotalAmount("");
      setProducts([]);
      setCurrency("");
      
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
    const receiptData = JSON.parse(text);

    // Create receipt instance
    const receipt = new receiptModel(
      receiptData.id,
      receiptData.store_name,
      receiptData.date,
      receiptData.total_amount,
      receiptData.currency,
      receiptData.items.map(
        (item: { id: number; name: string; category: string; price: number; }) =>
          new itemModel(
            item.id,
            item.name,
            item.category,
            item.price,
          )
      )
    );

    // Update products state
    setProducts(receipt.items);
    setStoreName(receipt.store_name);
    setTotalAmount(receipt.total_amount.toString());
    setDate(receipt.date);
    setSelectedDate(new Date(receipt.date));

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
                value={totalAmount + " " + currency}
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
              <CustomButtonWIcon
                title="Add item"
                handlePress={() => {
                  setSelectedItem(itemModel.emptyItem());
                  setModalVisible(true);
                  setIsEditing(false);
                }}
                containerStyles="w-2/4 mx-2 ml-7"
                iconName={"add-circle-outline"}
              />
            </View>

            <View>
              {products.map((product: itemModel) => (
                <ItemBox
                  key={product.id}
                  item={product}
                  handlePress={() => itemPressed(product)}
                />
              ))}
            </View>

            <Modal
              visible={isModalVisible}
              animationType="slide"
              transparent
              onRequestClose={closeModal}
            >
              <View className="flex-1 bg-black/80 justify-center items-center px-6">
                <View className="w-full rounded-3xl bg-primary p-4 max-h-[90%]">
                  {selectedItem && (
                    <EditItemScreen
                      item={selectedItem}
                      onClose={() => {
                        setSelectedItem(null);
                        setModalVisible(false);
                        setIsEditing(false);
                      }}
                      onSave={(updatedItem) => {
                        if (isEditing) {
                          // Update existing item
                          setProducts((prev) =>
                            prev.map((p) =>
                              p.id === updatedItem.id ? updatedItem : p
                            )
                          );
                        } else {
                          // Add new item (with proper ID generation)
                          setProducts((prev) => [
                            ...prev,
                            {
                              ...updatedItem,
                              id: Date.now(), // Temporary ID for local state
                            },
                          ]);
                        }
                        setSelectedItem(null);
                        setIsEditing(false);
                        setModalVisible(false);
                      }}
                    />
                  )}
                </View>
              </View>
            </Modal>

            <View className="flex flex-row items-center justify-between">
              <View className="flex w-1/2 flex-row items-center justify-start">
                <CustomButtonWIcon
                  title="Save"
                  handlePress={handleSave}
                  containerStyles="my-7 w-3/4 mx-2 ml-7"
                  isLoading={isProcessing}
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