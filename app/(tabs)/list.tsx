import { StyleSheet, View, Text, TouchableOpacity } from "react-native";

import EditScreenInfo from "@/components/EditScreenInfo";
import { SafeAreaView } from "react-native-safe-area-context";
import SwitchableButton from "@/components/SwitchableButton";
import CategoryModal from "@/components/CategoryModal";
import { useState } from "react";
import DateFilter from "@/components/DateFilter";
import ReceitpModel from "@/models/ReceiptModel";
import ItemModel from "@/models/ItemModel";

export default function Expenses() {
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState("");

  const onDateSelect = (selectedDate: string) => {
    console.log("Selected date:", selectedDate);
    setSelectedDate(selectedDate);
  }

  const onTypeSelect = (selected: string) => {
    console.log("Selected type:", selected);
    setSelectedItemType(selected);
  }


  return (
    <SafeAreaView>
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
            onSelect={onDateSelect}
            />
          </View>
          {selectedItemType === "Items" && (
            <TouchableOpacity
              onPress={() => setShowCategoryModal(true)}
              className="bg-blackContrast p-3 rounded-xl mb-3 mx-5 my-3"
            >
              <Text className="text-white">
                {selectedCategory || "Select category"}
              </Text>
            </TouchableOpacity>
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
      </View>
    </SafeAreaView>
  );
}
