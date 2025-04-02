import React, { useState } from "react";
import { View, Text, Pressable } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

const DateFilter = () => {
  const [selectedFilter, setSelectedFilter] = useState("Today");
  const [showPicker, setShowPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const filters = ["Today", "Week", "Month", "6 Months"];

  return (
    <View className="flex-row">
      <View className="flex-row bg-secondary-lightblack p-0.5 rounded-2xl ">
        {filters.map((filter) => (
          <Pressable
            key={filter}
            onPress={() => setSelectedFilter(filter)}
            className={`px-3 py-2 rounded-2xl mr-2 ${
              selectedFilter === filter ? "bg-secondary" : "bg-transparent"
            }`}
          >
            <Text className="text-white font-iregular text-sm">{filter}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        onPress={() => setShowPicker(true)}
        className="px-3 py-2 rounded-2xl bg-secondary ml-2"
      >
        <Text className="text-white font-iregular text-sm">Select date</Text>
      </Pressable>
    </View>
  );
};

export default DateFilter;
