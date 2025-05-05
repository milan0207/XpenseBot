import { Text, TouchableOpacity } from "react-native";
import React from "react";
import { View } from "react-native";
import tailwindConfig from "../tailwind.config.js";
import CategoryIcons from "./CategoryIcons";

const ItemBox = ({ name, category, quantity, price, handlePress }) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className="bg-blackContrast rounded-full min-h-[80px] justify-center items-center mx-6 my-2"
    >
      <View className="flex-row items-center justify-center w-full">
        <CategoryIcons
          name={category}
          className="w-12 h-12 ml-5" // NativeWind classes
        />
        <View className="flex-1 ml-5 flex-col justify-center">
          <View className="flex-row">
          <Text className="text-txtSecondary font-semibold text-lg">Name: </Text>
          <Text className="text-txtPrimary font-semibold text-lg">{name}</Text>
          </View>
          <View className="flex-row">
          <Text className="text-txtSecondary font-semibold text-sm">Category: </Text>
          <Text className="text-txtPrimary font-semibold text-sm">{category}</Text>
          </View>
          <View className="flex-row">
          <Text className="text-txtSecondary font-semibold text-sm">Quantity: </Text>
          <Text className="text-txtPrimary font-semibold text-sm">{quantity}</Text>
          </View>
        </View>
        <View className="flex-col mx-5 justify-center items-center">
        <Text className="text-txtPrimary font-semibold text-2xl mr-2">{price}</Text>
        <Text className="text-txtPrimary font-semibold text-sm">RON</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ItemBox;
