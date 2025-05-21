import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { View, Text, SafeAreaView } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import FormField from "@/components/FormField";
import { auth } from "@/firebase/firebaseConfig";
import { useEffect, useState } from "react";
import CustomButtonWIcon from "@/components/CustomButtonWIcon";
import { PersonBox } from "@/components/PersonBox";
import { sendFriendRequestByEmail, getFriendRequests, getFriends } from "@/lib/friendRequests";

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
  const userId = auth.currentUser?.uid;
  const refreshData = async () => {
    if (!userId) {
      console.error("User not authenticated.");
      return;
    }

    try {
      setRequestIsLoading(true);

      const friendsData = await getFriends(userId);
      const parsedFriends = friendsData.map((f: { email?: string }) => ({
        friendEmail: f.email ?? "",
      }));
      setFriends(parsedFriends);

      const requestData = await getFriendRequests(userId);
      const parsedRequests = requestData.map((r: { senderEmail?: string; id?: string }) => ({
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
      if (auth.currentUser?.uid) {
        await sendFriendRequestByEmail(auth.currentUser.uid, email);
        console.log("Friend request sent to:", email);
        setFeedback("Friend request sent successfully!!!!");
      } else {
        console.error("User ID is undefined. Cannot send friend request.");
        setFeedback("User not logged in.");
      }
    } catch (error) {
      console.log("Error sending friend request::::", error);
      setFeedback(
        "Error: " +
          (typeof error === "string"
            ? error
            : error instanceof Error
              ? error.message
              : "An unknown error occurred."),
      );
    } finally {
      setRequestIsLoading(false);
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
              <Text
                className={`text-sm font-semibold mx-7 mt-1 ${
                  feedback.startsWith("Error: ") ? "text-redAccent" : "text-greenAccent"
                }`}
              >
                {feedback}
              </Text>
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
            <Text className="text-white text-2xl font-semibold mt-5 mx-5">Friends:</Text>
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
