import React, { useState } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

export default function Conversation() {
  const { username, lastMessage } = useLocalSearchParams();
  const [messages, setMessages] = useState([
    { id: 1, text: lastMessage, sender: false },
    { id: 2, text: "Hey! How's it going?", sender: true },
  ]);
  const [input, setInput] = useState("");

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), text: input, sender: true }]);
    setInput("");
  };

  return (
    <View style={styles.container}>
      {/* Top bar with profile picture */}
      <View style={styles.topBar}>
        <View style={styles.profilePic}>
          <FontAwesome name="user" size={40} color="#fff" />
        </View>
        <Text style={styles.username}>{username}</Text>
      </View>

      {/* Messages */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.messageBubble, item.sender ? styles.sent : styles.received]}>
            <Text style={styles.messageText}>{item.text}</Text>
          </View>
        )}
        contentContainerStyle={{ padding: 10, flexGrow: 1 }}
      />

      {/* Bottom input area */}
      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.iconButton}>
          <MaterialIcons name="photo-camera" size={28} color="#fff" />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder="Type a message"
          placeholderTextColor="#888"
          value={input}
          onChangeText={setInput}
        />

        <TouchableOpacity style={styles.iconButton} onPress={sendMessage}>
          <FontAwesome name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  profilePic: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  username: { fontSize: 20, fontWeight: "700", color: "#fff" },
  messageBubble: {
    maxWidth: "70%",
    padding: 10,
    borderRadius: 16,
    marginVertical: 4,
  },
  sent: { backgroundColor: "#333", alignSelf: "flex-end", borderTopRightRadius: 0 },
  received: { backgroundColor: "#1a1a1a", alignSelf: "flex-start", borderTopLeftRadius: 0 },
  messageText: { color: "#fff", fontSize: 15 },
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#222",
    color: "#fff",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 8,
    fontSize: 15,
  },
  iconButton: { padding: 5 },
});