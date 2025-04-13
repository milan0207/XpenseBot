import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import Entypo from "@expo/vector-icons/Entypo";
const FormField = ({
  title,
  value,
  placeholder,
  handleChangeText,
  otherStyles,
  error, // Accept error messages
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-lg text-gray-100 font-pmedium ml-2 mb-2">{title}</Text>

      <View
        className={`w-full h-16 px-4 rounded-2xl border-2 flex flex-row items-center ${
          isFocused ? "border-secondary" : "border-black-200"
        } bg-black-100`}
      >
        <TextInput
          className="flex-1 text-white font-psemibold text-base"
          value={value}
          placeholder={placeholder}
          placeholderTextColor="#7B7B8B"
          onChangeText={handleChangeText}
          secureTextEntry={
            (title === "Password" && !showPassword) ||
            (title === "Confirm Password" && !showPassword2)
          }
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {title === "Password" && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Entypo
              name={showPassword ? "eye-with-line" : "eye"}
              size={24}
              color="black"
            />
          </TouchableOpacity>
        )}
        {title === "Confirm Password" && (
          <TouchableOpacity onPress={() => setShowPassword2(!showPassword2)}>
            <Entypo
              name={showPassword2 ? "eye-with-line" : "eye"}
              size={24}
              color="black"
            />
          </TouchableOpacity>
        )}
      </View>

      {error ? (
        <Text className="text-red-500 text-sm ml-2 mt-1">{error}</Text>
      ) : null}
    </View>
  );
};

export default FormField;
