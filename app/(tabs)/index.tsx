import {
  StyleSheet,
  Image,
  ScrollView,
  Text,
  View,
  YellowBox,
} from "react-native";
import { Pie, PolarChart } from "victory-native";
import images from "../../constants/images";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";
import tailwindConfig from "../../tailwind.config";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateFilter from "@/components/DateFilter";
export default function TabOneScreen() {
  function randomNumber() {
    return Math.floor(Math.random() * 26) + 125;
  }
  function generateRandomColor(): string {
    // Generating a random number between 0 and 0xFFFFFF
    const randomColor = Math.floor(Math.random() * 0xffffff);
    // Converting the number to a hexadecimal string and padding with zeros
    return `#${randomColor.toString(16).padStart(6, "0")}`;
  }
  const DATA = (numberPoints = 5) =>
    Array.from({ length: numberPoints }, (_, index) => ({
      value: randomNumber(),
      color: generateRandomColor(),
      label: `Label ${index + 1}`,
    }));
  const colors = tailwindConfig?.theme?.extend?.colors as {
    [key: string]: any;
  };
  const secondaryColor = colors?.secondary?.DEFAULT || "#000";
  return (
    <SafeAreaView className="h-full bg-primary">
      <ScrollView>
        <View className="w-full flex-row items-center justify-between">
          <View className="flex-row items-center">
            <Image
              source={images.logo}
              resizeMode="contain"
              className="w-[50px] h-[50px] mt-5 ml-5"
            />
            <Text className="text-xl text-secondary text-semibold font-iregular m1-2 mt-5">
              XpenseBot
            </Text>
          </View>
          <Ionicons
            name="notifications-outline"
            size={40}
            color={secondaryColor}
            className="mr-5 mt-5"
          />
        </View>
        <View className="w-full flex-col items-left justify-center">
          <Text className="text-2xl text-txtSecondary mt-5 ml-5 font-iregular">
            Money available to spend:
          </Text>
          <Text className="text-6xl text-secondary mt-4 ml-5 font-iregular leading-none">
            1500 RON
          </Text>
          <View className="w-full flex-row items-center">
            <Text className="text-xl text-txtThird ml-5">Monthly income:</Text>
            <Text className="text-xl text-greenAccent ml-3">2500 RON</Text>
          </View>
          <View className="w-full flex-row items-center mt-1">
            <Text className="text-xl text-txtThird ml-5">
              Spent this month:
            </Text>
            <Text className="text-xl text-redAccent ml-1 ">1000 RON</Text>
          </View>
        </View>
        <View style={{ height: 250 }} className="mt-10 w-full mr-10">
          <PolarChart
            data={DATA()} 
            labelKey={"label"} 
            valueKey={"value"} 
            colorKey={"color"}
          >
            <Pie.Chart />
          </PolarChart>
        </View>
        <View className="mx-5 mt-10 ">
          <DateFilter />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
