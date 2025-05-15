
import { Text, TouchableOpacity } from "react-native";
import { View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { acceptFriendRequest,rejectFriendRequest } from "@/lib/firestore";
import { auth } from "@/firebase/firebaseConfig";
export const PersonBox = ({email,requestId,onActionComplete}) => {


  return (
    <View className={`flex-row justify-between items-center ${requestId ? 'bg-secondary' : 'bg-black-100'} rounded-lg p-4 mx-5 mt-5`}>
      <View className="flex-row items-center">
        <MaterialIcons name="person" size={24} color="black" />
        <Text className="text-white text-lg ml-3">{email}</Text>
      </View>

      {requestId && (
        <View className="flex-row items-center">
          <TouchableOpacity
            className="mr-3"
            onPress={async () => {
              rejectFriendRequest(requestId)
                .then(() => {
                  console.log("Friend request rejected");
                })
                .catch((error) => {
                  console.error("Error rejecting friend request: ", error);
                });
              onActionComplete();
            }}
          >
            <MaterialIcons name="remove-circle" size={30} color="red" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={async () => {
              acceptFriendRequest(requestId, email)
                .then(() => {
                  console.log("Friend request accepted");
                })
                .catch((error) => {
                  console.error("Error accepting friend request: ", error);
                });
              onActionComplete();
            }}
          >
            <MaterialIcons name="check-circle" size={30} color="green" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};