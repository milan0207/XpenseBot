import React, { useState } from "react";
import { View, Text, Pressable, Touchable, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

interface DateFilterProps {
  onSelect: (selectedDate: string) => void;
}

export default function DateFilter({ onSelect }: DateFilterProps) {
  const [selectedFilter, setSelectedFilter] = useState("Week");
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const filters = ["Today", "Week", "Month", "6 Months"];

  const onDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowPicker(Platform.OS === "ios");
    if (selectedDate) {
      //YYYY-MM-DD format
      const formattedDate = selectedDate.toISOString().split("T")[0];
      onSelect(formattedDate);
    }
  };

  return (
    <View className="flex-row">
      <View className="flex-row bg-secondary-lightblack p-0.5 rounded-2xl ">
        {filters.map((filter) => (
          <Pressable
            key={filter}
            onPress={() => {
              setSelectedFilter(filter);
              onSelect(filter);
            }}
            className={`px-3 py-2 rounded-2xl mr-2 ${
              selectedFilter === filter ? "bg-secondary" : "bg-transparent"
            }`}
          >
            <Text className="text-white font-iregular text-sm">{filter}</Text>
          </Pressable>
        ))}
      </View>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        className="px-3 py-2 rounded-2xl bg-secondary ml-2"
      >
        <Text className="text-white font-iregular text-sm">Select date</Text>
      </TouchableOpacity>
      {showPicker && (
        <DateTimePicker
          value={selectedDate || new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
        />
      )}
    </View>
  );
};
