import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Touchable, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

interface DateFilterProps {
  onFromSelect: (selectedDate: Date) => void;
  onToSelect: (selectedDate: Date) => void;
}

export default function DateFilter({ onFromSelect, onToSelect }: DateFilterProps) {
  const [selectedFilter, setSelectedFilter] = useState("Today");
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);

  const filters = ["Today", "Week", "Month"];

  const onFromDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowFromPicker(Platform.OS === "ios");
    if (selectedDate) {
      onFromSelect(selectedDate);
    }
  };

  const onToDateChange = (event: any, selectedDate: Date | undefined) => {
    setShowToPicker(Platform.OS === "ios");
    if (selectedDate) {
      onToSelect(selectedDate);
    }
  };

  useEffect(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    setFromDate(todayStart);
    setToDate(todayEnd);
    onFromSelect(todayStart);
    onToSelect(todayEnd);
  }, []);



  return (
    <View className="flex-row">
      <View className="flex-row bg-secondary-lightblack p-0.5 rounded-2xl ">
        {filters.map((filter) => (
          <Pressable
            key={filter}
            onPress={() => {
              setSelectedFilter(filter);
              if (filter === "Today") {
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);
                const todayEnd = new Date();
                todayEnd.setHours(23, 59, 59, 999);
                setFromDate(todayStart);
                setToDate(todayEnd);
                onFromSelect(todayStart);
                onToSelect(todayEnd);
              } else if (filter === "Week") {
                const today = new Date();
                const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
                const weekEnd = new Date(today.setDate(today.getDate() + 6 - today.getDay()));
                setFromDate(weekStart);
                setToDate(weekEnd);
                onFromSelect(weekStart);
                onToSelect(weekEnd);
              } else if (filter === "Month") {
                const today = new Date();
                const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                setFromDate(monthStart);
                setToDate(monthEnd);
                onFromSelect(monthStart);
                onToSelect(monthEnd);
              }
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
        onPress={() => setShowFromPicker(true)}
        className="px-3 py-2 rounded-2xl bg-secondary ml-5"
      >
        <Text className="text-white font-iregular text-sm">From Date</Text>
      </TouchableOpacity>
      {showFromPicker && (
        <DateTimePicker
          value={fromDate || new Date()}
          mode="date"
          display="default"
          onChange={onFromDateChange}
        />
      )}
      <TouchableOpacity
        onPress={() => setShowToPicker(true)}
        className="px-3 py-2 rounded-2xl bg-secondary ml-3"
      >
        <Text className="text-white font-iregular text-sm">To Date</Text>
        {showToPicker && (
          <DateTimePicker
            value={toDate || new Date()}
            mode="date"
            display="default"
            onChange={onToDateChange}
          />
        )}
      </TouchableOpacity>
    </View>
  );
};
