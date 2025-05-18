import React, { useState } from "react";
import PropTypes from "prop-types";
import { View, Text, TouchableOpacity } from "react-native";

const SwitchableButton = ({
  title1 = "Option 1",
  title2 = "Option 2",
  onSelect,
  containerStyles = "",
  textStyles = "",
  selectedTextStyles = "",
  selectedBgStyle = "bg-white",
}) => {
  const [selected, setSelected] = useState(title1);

  const handleSelect = (option) => {
    setSelected(option);
    if (onSelect) onSelect(option);
  };

  return (
    <View className={`flex-row rounded-full p-1 ${containerStyles}`}>
      {/* First Option */}
      <TouchableOpacity
        className={`flex-1 items-center py-3 rounded-full ${
          selected === title1 ? selectedBgStyle : ""
        }`}
        onPress={() => handleSelect(title1)}
      >
        <Text
          className={`text-base font-semibold ${
            selected === title1 ? selectedTextStyles : `text-white ${textStyles}`
          }`}
        >
          {title1}
        </Text>
      </TouchableOpacity>

      {/* Second Option */}
      <TouchableOpacity
        className={`flex-1 items-center py-3 rounded-full ${
          selected === title2 ? selectedBgStyle : ""
        }`}
        onPress={() => handleSelect(title2)}
      >
        <Text
          className={`text-base font-semibold ${
            selected === title2 ? selectedTextStyles : `text-white ${textStyles}`
          }`}
        >
          {title2}
        </Text>
      </TouchableOpacity>
    </View>
  );
};
SwitchableButton.propTypes = {
  title1: PropTypes.string,
  title2: PropTypes.string,
  onSelect: PropTypes.func,
  containerStyles: PropTypes.string,
  textStyles: PropTypes.string,
  selectedTextStyles: PropTypes.string,
  selectedBgStyle: PropTypes.string,
};

export default SwitchableButton;
