import React from "react";
import { View, Image } from "react-native";
import categoryIcons from "../assets/images/categoryIcons"; // Új import

const CategoryIcons = ({ name, className = "w-6 h-6", style, ...props }) => {
  // Dinamikus ikon választás
  const iconKey = name.toLowerCase().replace(/ /g, "_");
  const source = categoryIcons[iconKey];

  if (!source) {
    console.warn(`Icon "${name}" not found for key: ${iconKey}`);
    return null;
  }

  return (
    <View className={className} style={style}>
      <Image
        source={source}
        className="w-full h-full"
        resizeMode="contain"
        {...props}
      />
    </View>
  );
};

export default CategoryIcons;
