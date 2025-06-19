import React, { useState } from "react";
import { View, Platform, Text, Pressable } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

interface DatePickerFieldProps {
  label: string;
  value: Date | null;
  onChange: (date: Date) => void;
  otherStyles?: string;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({
  label,
  value,
  onChange,
  otherStyles,
}) => {
  const [showPicker, setShowPicker] = useState(false);

  const showDatepicker = () => {
    setShowPicker(true);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) {
      onChange(selectedDate);
    }
  };

  return (
    <View className={`space-y-2 ${otherStyles}`}>
      <Text className="text-lg text-gray-100 font-pmedium ml-2 mb-2">{label}</Text>
      <Pressable onPress={showDatepicker}>
        <View
          className={`w-full h-16 px-4 rounded-2xl border-2 flex flex-row items-center border-black-200 bg-black-100`}
        >
          <Text className="flex-1 text-white font-psemibold text-base">
            {value ? value.toLocaleDateString("ro-RO") : ""}
          </Text>
        </View>
      </Pressable>
      {showPicker && (
        <DateTimePicker
          value={value || new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
    </View>
  );
};

export default DatePickerField;
