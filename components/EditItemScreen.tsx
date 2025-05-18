import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import CustomButton from "./CustomButton";
import CategoryModal from "./CategoryModal"; // Import the new component

interface Item {
  id: number;
  name: string;
  category: string;
  price: number;
}

export default function EditItemScreen({
  item,
  onClose,
  onSave,
}: {
  item: Item;
  onClose: () => void;
  onSave: (updatedItem: Item) => void;
}) {
  const [name, setName] = useState(item.name || "");
  const [category, setCategory] = useState(item.category || "");
  const [price, setPrice] = useState(item.price.toString() || "");
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const handleSave = () => {
    const updatedItem = {
      ...item,
      name,
      category,
      price: parseFloat(price),
    };
    onSave(updatedItem);
  };

  return (
    <View className="w-full">
      <View>
        <Text className="text-white text-2xl font-bold mb-4 text-center">
          Edit Item
        </Text>
      </View>

      {/* Name field */}
      <Text className="text-lg text-gray-100 font-pmedium mt-2 mb-1 ml-1">
        Name
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Enter name"
        placeholderTextColor="#888"
        className="bg-blackContrast text-white p-3 rounded-xl mb-3"
      />

      {/* Category field */}
      <Text className="text-lg text-gray-100 font-pmedium mt-2 mb-1 ml-1">
        Category
      </Text>
      <TouchableOpacity
        onPress={() => setShowCategoryModal(true)}
        className="bg-blackContrast p-3 rounded-xl mb-3"
      >
        <Text className="text-white">{category || "Select category"}</Text>
      </TouchableOpacity>

      {/* Reusable Category Modal */}
      <CategoryModal
        visible={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onSelect={setCategory}
        selectedCategory={category}
      />

      {/* Price field */}
      <Text className="text-lg text-gray-100 font-pmedium mt-2 mb-1 ml-1">
        Price (RON)
      </Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        keyboardType="decimal-pad"
        placeholder="Enter price"
        placeholderTextColor="#888"
        className="bg-blackContrast text-white p-3 rounded-xl mb-6"
      />

      <View className="flex-row justify-between space-x-4">
        <View className="flex-1">
          <CustomButton
            title="Cancel"
            handlePress={onClose}
            containerStyles="bg-redAccent rounded-xl p-3 mx-4"
            textStyles="text-white font-semibold text-lg"
          />
        </View>
        <View className="flex-1">
          <CustomButton
            title="Save"
            handlePress={handleSave}
            containerStyles="bg-greenAccent rounded-xl p-3 mx-4"
            textStyles="text-white font-semibold text-lg"
          />
        </View>
      </View>
    </View>
  );
}
