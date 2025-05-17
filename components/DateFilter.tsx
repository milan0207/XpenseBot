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
                const now = new Date();
                const todayStart = new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  now.getDate(),
                  0,
                  0,
                  0,
                  0
                );
                const todayEnd = new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  now.getDate(),
                  23,
                  59,
                  59,
                  999
                );

                setFromDate(todayStart);
                setToDate(todayEnd);
                onFromSelect(todayStart);
                onToSelect(todayEnd);
              } else if (filter === "Week") {
                const now = new Date();
                const dayOfWeek = now.getDay() || 7; // Sunday = 0 => make it 7
                const monday = new Date(now);
                monday.setDate(now.getDate() - dayOfWeek + 1);
                monday.setHours(0, 0, 0, 0);

                const sunday = new Date(monday);
                sunday.setDate(monday.getDate() + 6);
                sunday.setHours(23, 59, 59, 999);

                setFromDate(monday);
                setToDate(sunday);
                onFromSelect(monday);
                onToSelect(sunday);
              } else if (filter === "Month") {
                const now = new Date();
                const firstDay = new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  1,
                  0,
                  0,
                  0,
                  0
                );
                const lastDay = new Date(
                  now.getFullYear(),
                  now.getMonth() + 1,
                  0,
                  23,
                  59,
                  59,
                  999
                );

                setFromDate(firstDay);
                setToDate(lastDay);
                onFromSelect(firstDay);
                onToSelect(lastDay);
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
