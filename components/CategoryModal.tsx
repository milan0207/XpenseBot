import { View, Text, Modal, TouchableOpacity } from "react-native";
import CategoryIcons from "./CategoryIcons";
import { categories } from "@/assets/images/categoryIcons";

interface CategoryModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (category: string) => void;
  selectedCategory?: string;
}

export default function CategoryModal({
  visible,
  onClose,
  onSelect,
  selectedCategory = "",
}: CategoryModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-primary p-4 rounded-t-xl">
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              onPress={() => {
                onSelect(cat);
                onClose();
              }}
              className={`p-3 border-b border-gray-700 ${
                selectedCategory === cat ? "bg-gray-800" : ""
              }`}
            >
              <View className="flex-row items-center space-x-2">
                <CategoryIcons name={cat} className="w-6 h-6 mr-1" />
                <Text className="text-white text-lg">{cat}</Text>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            onPress={onClose}
            className="p-3 mt-2 bg-txtThird rounded-lg"
          >
            <Text className="text-white text-center">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}