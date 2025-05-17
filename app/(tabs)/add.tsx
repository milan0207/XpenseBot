import { StyleSheet, View, Text,ScrollView,Modal } from "react-native";
import { useState,useEffect, SetStateAction } from "react";
import CustomButtonWIcon from "@/components/CustomButtonWIcon";
import CameraView from "@/components/CustomCameraView";
import FormField from "@/components/FormField";
import DatePickerField from "@/components/DatePickerField";
import { auth } from "@/firebase/firebaseConfig";
import { listenForResults } from "@/lib/receiptDb";
import { SafeAreaView } from "react-native-safe-area-context";
import ItemBox from "@/components/ItemBox";
import receiptModel from "@/models/ReceiptModel"
import itemModel from "@/models/ItemModel";
import EditItemScreen from "@/components/EditItemScreen"; // adjust path as needed
import { saveReceipt } from "@/lib/receiptDb";
import { useLocalSearchParams } from "expo-router";
import { v4 as uuidv4 } from "uuid";


export default function AddScreen() {
  const [showCamera, setShowCamera] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [storeName, setStoreName] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);
  const [products, setProducts] = useState<itemModel[]>([]);
  const [date, setDate] = useState("");
  const userId = auth.currentUser?.uid;
  const [unsubscribe, setUnsubscribe] = useState<() => void>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedItem, setSelectedItem] = useState<itemModel | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currency, setCurrency] = useState("");
  const [receiptID, setReceiptID] = useState("");
  const [message, setMessage] = useState("");

  const params = useLocalSearchParams();
  let receipt: receiptModel | null = null;
  useEffect(() => {

    return () => {
      // Ha van unsubscribe, azt is töröljük
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [ unsubscribe]);

  useEffect(() => {
     // Ha még nem töltöttük be a receipt-et, töltsük be egyszer
    if (!receipt && params.receipt) {
      receipt = JSON.parse(params.receipt as string);
      (params.receipt as any) = null; // Eltávolítjuk a receipt paramétert

      // Most beállítjuk az állapotokat
      if (receipt) {
        receipt.date = new Date(receipt.date);
        setStoreName(receipt.store_name);
        setTotalAmount(receipt.total_amount);
        setProducts(receipt.items);
        setDate(new Date(receipt.date).toISOString());
        setSelectedDate(new Date(receipt.date));
        console.log("receiptID from add.tsx " + receipt?.id);
        setReceiptID(receipt?.id);
        receipt = null; 
      }
    }
  }, [params.receipt]); 


  const handleSave = async () => {
    const receiptToSave = {
      id: receiptID,
      store_name: storeName,
      date: selectedDate || new Date(),
      total_amount: totalAmount,
      currency,
      items: products,
      createdAt: new Date(),
    };

    if (!userId) return;

    setIsProcessing(true);
    try {
      const receiptId = await saveReceipt(receiptToSave, userId);
      console.log("Receipt saved with ID:", receiptId);
      // Reset form
      setStoreName("");
      setTotalAmount(0);
      setProducts([]);
      setSelectedDate(null);
    } catch (error) {
      console.error("Error saving receipt:", error);
      setMessage("Error: saving receipt. Please try again.");
    } finally {

      setIsProcessing(false);
      if(storeName === "" && totalAmount === 0) {
        setMessage("Receipt deleted successfully!");
      }
      else
      {
        setMessage("Receipt saved successfully!");
      }
      receipt = null;
    }
  };
  const handleScan = () => {
    console.log("Scan pressed");
    setShowCamera(true);
    setReceiptID("");
  };

  const itemPressed = (item: itemModel) => {
    setSelectedItem(item);
    setModalVisible(true);
    setIsEditing(true);
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
    setTotalAmount(0);
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
          (item: {
            id: number;
            name: string;
            category: string;
            price: number;
          }) =>
            new itemModel(
              receiptData.id + item.id,
              item.name,
              item.category,
              item.price
            )
        )
      );

      // Update products state
      setProducts(receipt.items);
      setStoreName(receipt.store_name);
      setTotalAmount(receipt.total_amount);
      setDate(new Date(receipt.date).toISOString());
      setSelectedDate(new Date(receipt.date));
      console.log("New Date: ", selectedDate)
    } catch (error) {
      console.error("Error parsing receipt data:", error);
      setStoreName("Error parsing receipt");
      setTotalAmount(0);
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
                value={totalAmount.toString()}
                handleChangeText={(text: number) => setTotalAmount(text)}
                otherStyles="mt-3 mx-5"
                placeholder={undefined}
                error={undefined}
              />
            </View>
            <Text className="text-lg text-gray-100 font-pmedium mx-7 my-3">
              The purchased items:
            </Text>
            <View className="flex flex-row items-center justify-between mx-5">
              <CustomButtonWIcon
                title="Add item"
                handlePress={() => {
                  setSelectedItem(itemModel.emptyItem());
                  setModalVisible(true);
                  setIsEditing(false);
                }}
                containerStyles="w-2/4 mr-1"
                iconName={"add-circle-outline"}
              />
              <CustomButtonWIcon
                title="Clear all"
                handlePress={() => {
                  setProducts([]);
                  setStoreName("");
                  setTotalAmount(0);
                  setSelectedDate(null);
                  setDate("");
                  setCurrency("");
                  (params.receipt as any) = null;
                  receipt = null;
                }}
                iconName={"clear"}
                containerStyles="w-2/4 ml-1"
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
                          // Update the existing item with the same ID
                          setProducts((prev) =>
                            prev.map((p) =>
                              p.id === updatedItem.id
                                ? { ...p, ...updatedItem } // Update the item with the same ID
                                : p
                            )
                          );
                        } else {
                          // If not editing, add the new item with a unique ID
                          setProducts((prev) => [
                            ...prev,
                            {
                              ...updatedItem,
                              id:
                                typeof updatedItem.id === "number"
                                  ? updatedItem.id
                                  : parseInt(uuidv4(), 10), // Ensure id is a number
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
            {message && (
              <Text
                className={`text-lg font-pmedium mx-7 my-3 ${
                  message.startsWith("Error")
                    ? "text-redAccent"
                    : "text-greenAccent"
                }`}
              >
                {message}
              </Text>
            )}
            <View className="flex flex-row items-center justify-between">
              <View className="flex w-1/2 flex-row items-center justify-start">
                <CustomButtonWIcon
                  title="Save"
                  handlePress={handleSave}
                  containerStyles="my-1 w-3/4 mx-2 ml-7"
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