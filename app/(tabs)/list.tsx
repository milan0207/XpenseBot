import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";

import EditScreenInfo from "@/components/EditScreenInfo";
import { SafeAreaView } from "react-native-safe-area-context";
import SwitchableButton from "@/components/SwitchableButton";
import CategoryModal from "@/components/CategoryModal";
import { useEffect, useState } from "react";
import DateFilter from "@/components/DateFilter";
import ReceitpModel from "@/models/ReceiptModel";
import ItemModel from "@/models/ItemModel";
import ReceiptBox from "@/components/ReceiptBox";
import { getItems, getReceipts, getSharedReceipts } from "@/lib/firestore";
import { auth } from "@/firebase/firebaseConfig";
import { router } from "expo-router";
import ReceiptModel from "@/models/ReceiptModel";
import { get, set } from "firebase/database";
import ItemBox from "@/components/ItemBox";
import AntDesign from '@expo/vector-icons/AntDesign';

export default function Expenses() {
  const userId = auth.currentUser?.uid;
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>("");
  const [selectedItemType, setSelectedItemType] = useState<string>("Receipts");
  const [selectedFromDate, setSelectedFromDate] = useState<Date | Date>(new Date());
  const [selectedToDate, setSelectedToDate] = useState<Date | Date>(new Date());
  const [receipts, setReceipts] = useState<ReceitpModel[]>([]);
  const [items, setItems] = useState<ItemModel[]>([]);
  const [sharedReceipts, setSharedReceipts] = useState<ReceitpModel[]>([]);

  useEffect(() => {
    if (userId) {
      if (selectedItemType === "Receipts") {
        getReceipts(
          userId,
          selectedFromDate,
          selectedToDate,
          (fetchedReceipts: ReceitpModel[]) => {
            setItems([]);
            setReceipts(fetchedReceipts);
          }
        );
        getSharedReceipts(
          userId,
          selectedFromDate,
          selectedToDate,
          (fetchedSharedReceipts: ReceitpModel[]) => {
            setSharedReceipts(fetchedSharedReceipts);
          }
        );
      } else if (selectedItemType === "Items") {
        getItems(
          userId,
          selectedFromDate,
          selectedToDate,
          selectedCategory || "",
          (fetchedItems: ItemModel[]) => {
            setReceipts([]);
            setItems(fetchedItems);
          }
        );
      }
    } else {
      console.error("User ID is not available.");
    }
  }, [
    userId,
    selectedFromDate,
    selectedToDate,
    selectedItemType,
    selectedCategory,
  ]);

  const onFromDateSelect = (selectedFromDate: Date) => {
    console.log("Selected date from list.tsx:", selectedFromDate);
    setSelectedFromDate(selectedFromDate);
  }
  const onToDateSelect = (selectedToDate: Date) => {
    console.log("Selected date:", selectedToDate);
    setSelectedToDate(selectedToDate);
  }

  const onTypeSelect = (selected: string) => {
    console.log("Selected type:", selected);
    setSelectedItemType(selected);
  }


  return (
    <SafeAreaView className="h-full bg-primary">
      <ScrollView>
        <View className="bg-primary h-full">
          <View className=" mx-5 my-5">
            <Text className="text-secondary text-3xl">Expenses:</Text>
          </View>
          <View>
            <SwitchableButton
              title1="Receipts"
              title2="Items"
              onSelect={(selected: any) => {
                onTypeSelect(selected);
              }}
              containerStyles="mx-5 my-3 bg-secondary"
              textStyles="text-primary"
              selectedTextStyles="text-secondary"
            ></SwitchableButton>
            <View className="mx-5 my-3">
              <DateFilter
                onFromSelect={onFromDateSelect}
                onToSelect={onToDateSelect}
              />
            </View>

            {selectedItemType === "Items" && (
              <View className="flex flex-row ">
                <TouchableOpacity
                  onPress={() => setShowCategoryModal(true)}
                  className="bg-blackContrast p-3 rounded-xl mb-3 ml-4 my-3 w-3/4"
                >
                  <Text className="text-white">
                    {selectedCategory || "Select category"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCategory(null);
                    setShowCategoryModal(false);
                  }}
                >
                  <AntDesign
                    name="closecircle"
                    size={24}
                    color="grey"
                    className="my-5 mx-5"
                  />
                </TouchableOpacity>
              </View>
            )}
            <CategoryModal
              visible={showCategoryModal}
              onClose={() => setShowCategoryModal(false)}
              onSelect={(category: any) => {
                console.log("Selected category:", category);
                setShowCategoryModal(false);
                setSelectedCategory(category);
              }}
            />
          </View>

          <View>
            {receipts.map((receipt: ReceiptModel) => (
              <ReceiptBox
                key={receipt.id}
                receipt={receipt}
                isShared={false}
                handlePress={() => {
                  const serializedReceipt = {
                    ...receipt,
                    date: receipt.date.toISOString(),
                  };
                  router.push({
                    pathname: "/add",
                    params: { receipt: JSON.stringify(serializedReceipt) },
                  });
                }}
              />
            ))}
            {items.map((item: ItemModel) => (
              <ItemBox
                key={item.id}
                item={item}
                handlePress={() => {
                  console.log("Item pressed:", item);
                }}
              />
            ))}
            {sharedReceipts.map((receipt: ReceiptModel) => (
              <ReceiptBox
                key={receipt.id}
                receipt={receipt}
                isShared={true}
                handlePress={() => {
                  console.log("Shared receipt pressed:", receipt);
                }}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
