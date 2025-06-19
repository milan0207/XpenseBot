import { Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React from "react";
import PropTypes from "prop-types";

const CustomButton = ({
  title,
  handlePress,
  containerStyles = "",
  textStyles = "",
  isLoading = false,
}) => {
  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      className={`rounded-xl min-h-[62px] justify-center items-center ${containerStyles} ${
        isLoading ? "opacity-50" : ""
      }`}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#FFFFFF" />
      ) : (
        <Text className={`text-primary font-semibold text-lg ${textStyles}`}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
CustomButton.propTypes = {
  title: PropTypes.string.isRequired,
  handlePress: PropTypes.func.isRequired,
  containerStyles: PropTypes.string,
  textStyles: PropTypes.string,
  isLoading: PropTypes.bool,
};

export default CustomButton;
