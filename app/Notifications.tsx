import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import Ionicons from "@expo/vector-icons/Ionicons";
import FormField from "@/components/FormField";
import { auth } from "@/firebase/firebaseConfig";
import { useEffect,useState } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import CustomButtonWIcon from "@/components/CustomButtonWIcon";
import { PersonBox } from "@/components/PersonBox";
import { sendFriendRequestByEmail,getFriendRequests,getFriends } from "@/lib/firestore";

type Friend = {
  friendEmail: string;
};

type FriendRequest = {
  senderEmail: string;
  id: string;
};


export default function Requests() {
  const [email, setEmail] = useState("");
  const [requestIsLoading, setRequestIsLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [feedback, setFeedback] = useState("");

  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);


  const refreshData = async () => {
    const userId = auth.currentUser?.uid;
    if (!userId) {
      console.error("User not authenticated.");
      return;
    }

    try {
      setRequestIsLoading(true);

      const friendsData = await getFriends(userId);
      const parsedFriends = friendsData.map((f: any) => ({
        friendEmail: f.email ?? "",
      }));
      setFriends(parsedFriends);

      const requestData = await getFriendRequests(userId);
      const parsedRequests = requestData.map((r: any) => ({
        senderEmail: r.senderEmail ?? "",
        id: r.id ?? "",
      }));
      setFriendRequests(parsedRequests);
    } catch (error) {
      console.error("Error loading friend data:", error);
      setFormError("Failed to load friend data.");
    } finally {
      setRequestIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

    const validateEmail = (email: string) => {
      return /\S+@\S+\.\S+/.test(email);
    };

    const handleSendRequest = async () => {
      setRequestIsLoading(true);
        setFormError("");
        setFeedback("");
      try {
        // Simulate sending a friend request
        if (auth.currentUser?.uid) {
          sendFriendRequestByEmail(auth.currentUser.uid, email);
          console.log("Friend request sent to:", email);
        } else {
          console.error("User ID is undefined. Cannot send friend request.");
        }
        
      } catch (error) {
        console.error("Error sending friend request:", error);
      } finally {
        setRequestIsLoading(false);
        setFeedback("Friend request sent successfully!");
      }
    };
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView className="bg-primary h-full">
        <ScrollView>
          <View className="flex-column justify-between space-x-4">
            <FormField
              label="Friend request"
              placeholder="Enter your friend's email adress"
              title="Friend request"
              value={email}
              handleChangeText={setEmail}
              otherStyles={"mx-5 flex-1"}
              error={formError}
              keyboardType="email-address"
            ></FormField>
            <Text className="text-greenAccent text-sm font-semibold mx-7 mt-1">
              {feedback}
            </Text>
            <CustomButtonWIcon
              title="Send request"
              handlePress={() => {
                if (validateEmail(email)) {
                  console.log("Valid email:", email);
                  handleSendRequest();
                } else {
                  console.log("Invalid email:", email);
                  setFormError("Please enter a valid email address");
                }
              }}
              containerStyles="mx-5 mt-1 bg-secondary"
              iconName={"person-add"}
              isLoading={requestIsLoading}
            />
          </View>
          <View>
            <Text className="text-white text-2xl font-semibold mt-5 mx-5">
              Pending Friend requests
            </Text>

            {friendRequests.length > 0 ? (
              friendRequests.map((request) => (
                <PersonBox
                  key={request.id}
                  email={request.senderEmail}
                  requestId={request.id}
                  onActionComplete={refreshData}
                />
              ))
            ) : (
              <Text className="text-white text-sm font-semibold mx-5 mt-1">
                No pending friend requests
              </Text>
            )}
          </View>
          <View>
            <Text className="text-white text-2xl font-semibold mt-5 mx-5">
              Friends:
            </Text>
            {friends.length > 0 ? (
              friends.map((friend) => (
                <PersonBox
                  key={friend.friendEmail}
                  email={friend.friendEmail}
                  requestId={undefined}
                  onActionComplete={refreshData}
                />
              ))
            ) : (
              <Text className="text-white text-sm font-semibold mx-5 mt-1">
                No friends added yet
              </Text>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
