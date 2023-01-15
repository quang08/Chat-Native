import React, {
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
  useContext
} from "react";
import { TouchableOpacity, Text, SafeAreaView, StyleSheet, View } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import {
  collection,
  addDoc,
  orderBy,
  query,
  onSnapshot,
  QuerySnapshot,
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { auth, database } from "../config/firebase";
import { useNavigation } from "@react-navigation/native";
import { AntDesign } from "@expo/vector-icons";
import colors from "../colors";

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const navigation = useNavigation();

  //console.log(auth.currentUser);

  const onSignOut = () => {
    signOut(auth).catch((e) => console.log(e));
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{
            marginRight: 10,
          }}
          onPress={onSignOut}
        >
          <AntDesign
            name="logout"
            size={24}
            color={colors.gray}
            style={{ marginRight: 10 }}
          />
        </TouchableOpacity>
      ),
    });
  }, []);

  useLayoutEffect(() => {
    const collectionRef = collection(database, "chats");
    const q = query(collectionRef, orderBy("createdAt", "desc")); //newest msg will be the top of the arr

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      //console.log("unsub");
      setMessages(
        querySnapshot.docs.map((doc) => ({
          _id: doc.data()._id,
          createdAt: doc.data().createdAt.toDate(),
          text: doc.data().text,
          user: doc.data().user,
        }))
      );
    });

    return unsubscribe;
  }, []);

  const onSend = useCallback((messages = []) => {
    setMessages((prevMsg) => GiftedChat.append(prevMsg, messages));

    const { _id, createdAt, text, user } = messages[0];
    addDoc(collection(database, "chats"), {
      _id,
      createdAt,
      text,
      user,
    });
  }, []);

  return (
    <View style={styles.container}>
      <GiftedChat
        messages={messages}
        showAvatarForEveryMessage={false}
        showUserAvatar={false}
        onSend={(messages) => onSend(messages)}
        messagesContainerStyle={{
          backgroundColor: "white",
        }}
        textInputStyle={{
          backgroundColor: "#fff",
          borderRadius: 20,
        }}
        user={{
          _id: auth?.currentUser?.email,
          avatar: "https://i.pravatar.cc/300",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
});
