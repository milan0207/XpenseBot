import { Text, TouchableOpacity } from "react-native";
import React from "react";
import { View } from "react-native";
import PropTypes from "prop-types";

const ItemBox = ({ receipt, handlePress, isShared }) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`${isShared ? "bg-secondary/30" : "bg-blackContrast/50"} rounded-full min-h-[60px] justify-center items-center mx-6 my-2`}
    >
      <View className="flex-row items-center justify-center w-full">
        <View className="flex-1 ml-5 flex-col justify-center">
          <View className="flex-row">
            <Text className="text-txtSecondary font-semibold text-lg">Store Name: </Text>
            <Text className="text-txtPrimary font-semibold text-sm mt-1.5">
              {receipt.store_name}
            </Text>
          </View>
          <View className="flex-row">
            <Text className="text-txtSecondary font-semibold text-sm">Date: </Text>
            <Text className="text-txtPrimary font-semibold text-sm">
              {receipt.date.toISOString().split("T")[0]}
            </Text>
          </View>
        </View>
        <View className="flex-col mx-5 justify-center items-center">
          <Text className="text-txtPrimary font-semibold text-2xl mr-2">
            {receipt.total_amount}
          </Text>
          <Text className="text-txtPrimary font-semibold text-sm">{receipt.currency}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};
ItemBox.propTypes = {
  receipt: PropTypes.shape({
    store_name: PropTypes.string.isRequired,
    date: PropTypes.instanceOf(Date).isRequired,
    total_amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    currency: PropTypes.string.isRequired,
  }).isRequired,
  handlePress: PropTypes.func.isRequired,
  isShared: PropTypes.bool.isRequired,
};

export default ItemBox;
