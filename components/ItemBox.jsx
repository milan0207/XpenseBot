import { Text, TouchableOpacity } from "react-native";
import React from "react";
import { View } from "react-native";
import CategoryIcons from "./CategoryIcons";
import PropTypes from "prop-types";

const ItemBox = ({ item, handlePress }) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className="bg-blackContrast rounded-full min-h-[53px] justify-center items-center mx-6 my-2"
    >
      <View className="flex-row items-center justify-center w-full">
        <CategoryIcons name={item.category} className="w-12 h-12 ml-5" />
        <View className="flex-1 ml-5 flex-col justify-center">
          <View className="flex-row">
            <Text className="text-txtSecondary font-semibold text-lg">Name: </Text>
            <Text
              className={`text-txtPrimary font-semibold ${
                item.name.length > 18 ? "text-sm mt-1.5" : "text-lg"
              }`}
            >
              {item.name}
            </Text>
          </View>
          <View className="flex-row">
            <Text className="text-txtSecondary font-semibold text-sm">Category: </Text>
            <Text className="text-txtPrimary font-semibold text-sm">{item.category}</Text>
          </View>
        </View>
        <View className="flex-col mx-5 justify-center items-center">
          <Text className="text-txtPrimary font-semibold text-2xl mr-2">{item.price}</Text>
          <Text className="text-txtPrimary font-semibold text-sm">RON</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

ItemBox.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
  handlePress: PropTypes.func.isRequired,
};

export default ItemBox;
