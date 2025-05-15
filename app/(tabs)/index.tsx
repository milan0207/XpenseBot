import { StyleSheet, Image, ScrollView, Text, View,TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import ItemModel from "@/models/ItemModel";
import images from "../../constants/images";
import { SafeAreaView } from "react-native-safe-area-context";
import { auth } from "@/firebase/firebaseConfig";
import "../global.css";
import tailwindConfig from "../../tailwind.config";
import Ionicons from "@expo/vector-icons/Ionicons";
import { getItems } from "@/lib/firestore";
import RNEChartsPro from "react-native-echarts-pro";
import { getMonthlyBudget } from "@/lib/firestore";
import { router } from "expo-router";
import {firestore} from "@/firebase/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export default function TabOneScreen() {
  const userId = auth.currentUser?.uid;
  const [items, setItems] = useState<ItemModel[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState(0);
  const [moneyAvailable, setMoneyAvailable] = useState(0);
  const [spentThisMonth, setSpentThisMonth] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [itemsProcessed, setItemsProcessed] = useState<
    Record<string, { total: number; category: string }>
    | null
  >(null);
  //start of the month
  const selectedFromDate = new Date(2023, 9, 1);
  //end of the month
  const selectedToDate = new Date(2026, 9, 31); 

  useEffect(() => {
    if (userId) {
      getItems(
        userId,
        selectedFromDate,
        selectedToDate,
        "",
        (fetchedItems: ItemModel[]) => {
          setItems(fetchedItems);
          setItemsProcessed(categoryTotals);
          setSpentThisMonth(totalSpent);
          setMoneyAvailable(monthlyBudget - totalSpent);
        }
      );
      console.log("Fetched items:", items);
      getMonthlyBudget(userId).then((budget) => {
        setMonthlyBudget(budget);
        console.log("Fetched monthly budget:", monthlyBudget);
      });
    } else {
      console.error("User ID is not available.");
    }
  }, [userId]);

  useEffect(() => {
    if(userId){
      setSpentThisMonth(parseFloat(totalSpent.toFixed(0)));
      setMoneyAvailable(parseFloat((monthlyBudget - totalSpent).toFixed(0)));
    }
  },[items, monthlyBudget]);
  
  const { categoryTotals, totalSpent } = items.reduce(
    (acc, item) => {
      // Update category total
      if (!acc.categoryTotals[item.category]) {
        acc.categoryTotals[item.category] = {
          total: 0,
          category: item.category,
        };
      }
      acc.categoryTotals[item.category].total += item.price;

      // Update overall total
      acc.totalSpent += item.price;
      return acc;
    },
    {
      categoryTotals: {} as Record<string, { total: number; category: string }>,
      totalSpent: 0,
    }
  );

  const processItems = Object.entries(categoryTotals).map(([category, data]) => ({
    category,
    total:  data.total,
  }));
  
  const colors = tailwindConfig?.theme?.extend?.colors as {
    [key: string]: any;
  };
  const secondaryColor = colors?.secondary?.DEFAULT || "#000";
    const pieOption = {
      series: [
        {
          name: "Source",
          type: "pie",
          legendHoverLink: true,
          hoverAnimation: true,
          avoidLabelOverlap: true,
          startAngle: 180,
          radius: "55%",
          center: ["50%", "35%"],
          data: processItems.map((item) => ({
            value: item.total,
            name: item.category,
          })),

          label: {
            normal: {
              show: true,
              textStyle: {
                fontSize: 15,
                color: { secondaryColor },
              },
            },
          },
        },
      ],
    };

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
          <TouchableOpacity
            onPress={() => {
              router.push("/Notifications");
            }}
          >
            <Ionicons
              name="notifications-outline"
              size={40}
              color={secondaryColor}
              className="mr-5 mt-5"
            />
            {notificationCount > 0 && (
            <View className="absolute top-4 right-6 bg-red-500 rounded-full w-5 h-5 justify-center items-center">
              <Text className="text-white text-xs">{notificationCount}</Text>
            </View>
)}
          </TouchableOpacity>
        </View>
        <View className="w-full flex-col items-left justify-center">
          <Text className="text-2xl text-txtSecondary mt-5 ml-5 font-iregular">
            Money available to spend:
          </Text>
          <Text className="text-6xl text-secondary mt-4 ml-5 font-iregular leading-none">
            {moneyAvailable} RON
          </Text>
          <View className="w-full flex-row items-center">
            <Text className="text-xl text-txtThird ml-5">Monthly income:</Text>
            <Text className="text-xl text-greenAccent ml-3">
              {monthlyBudget} RON
            </Text>
          </View>
          <View className="w-full flex-row items-center mt-1">
            <Text className="text-xl text-txtThird ml-5">
              Spent this month:
            </Text>
            <Text className="text-xl text-redAccent ml-1 ">
              {spentThisMonth} RON
            </Text>
          </View>
        </View>
        <View className="w-full flex-column items-center mt-10">
          <Text className="text-2xl text-txtSecondary font-iregular mb-10">
            Monthly expenses:
          </Text>
          <RNEChartsPro height={350} option={pieOption} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
