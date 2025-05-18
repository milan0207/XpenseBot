import { Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { View } from "react-native";
import PropTypes from "prop-types";
import tailwindConfig from "../tailwind.config.js";
const CustomButtonWIcon = ({
  title,
  handlePress,
  containerStyles = "",
  textStyles = "",
  isLoading = false,
  iconName,
}) => {
  const colors = tailwindConfig?.theme?.extend?.colors || {};
  const secondaryColor = colors?.secondary?.DEFAULT || "#000";
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`bg-secondary-lightblack rounded-xl min-h-[62px] justify-center items-center ${containerStyles} ${
        isLoading ? "opacity-50" : ""
      }`}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <View className="flex-row items-center justify-center w-full ">
          <Text className={`text-txtPrimary font-semibold text-lg ${textStyles}`}>{title}</Text>
          <MaterialIcons name={iconName} size={24} color={secondaryColor} className="pl-1" />
        </View>
      )}
    </TouchableOpacity>
  );
};
CustomButtonWIcon.propTypes = {
  title: PropTypes.string.isRequired,
  handlePress: PropTypes.func.isRequired,
  containerStyles: PropTypes.string,
  textStyles: PropTypes.string,
  isLoading: PropTypes.bool,
  iconName: PropTypes.string.isRequired,
};

export default CustomButtonWIcon;
