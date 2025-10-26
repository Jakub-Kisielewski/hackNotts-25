import React, { Component } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { router } from "expo-router";
import ExpandableMessage from "../../components/ui/ExpandableMessage";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Conversation = {
  id: number;
  username: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: boolean;
};

type State = {
  conversations: Conversation[];
  expandedId: number | null;
};

export default class Explore extends Component<{}, State> {
  state: State = {
    conversations: [
      {
        id: 1,
        username: "Alex",
        avatar: "",
        lastMessage: "Can you see my new outfit?",
        timestamp: "2h",
        unread: true,
      },
      {
        id: 2,
        username: "Emma",
        avatar: "",
        lastMessage: "Love the jacket!",
        timestamp: "1d",
        unread: false,
      },
      {
        id: 3,
        username: "Ryan",
        avatar: "",
        lastMessage: "Check this look 😎",
        timestamp: "3d",
        unread: true,
      },
    ],
    expandedId: null,
  };

  handlePress = (item: Conversation) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (this.state.expandedId === item.id) {
      this.openConversation(item);
    } else {
      this.setState({ expandedId: item.id });
    }
  };

  openConversation = (conversation: Conversation) => {
    // Navigate using Expo Router
    router.push({
      pathname: "/conversation",
      params: {
        username: conversation.username,
        lastMessage: conversation.lastMessage,
      },
    });

    // Mark as read
    this.setState((prev) => ({
      conversations: prev.conversations.map((c) =>
        c.id === conversation.id ? { ...c, unread: false } : c
      ),
      expandedId: null,
    }));
  };

  deleteConversation = (id: number) => {
    this.setState((prev) => ({
      conversations: prev.conversations.filter((c) => c.id !== id),
    }));
  };

  renderRightActions = (id: number) => (
    <TouchableOpacity style={styles.deleteButton} onPress={() => this.deleteConversation(id)}>
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

  renderConversation = ({ item }: { item: Conversation }) => (
    <Swipeable renderRightActions={() => this.renderRightActions(item.id)}>
      <TouchableOpacity
        style={styles.row}
        onPress={() => this.handlePress(item)} // tap → expand → tap again → navigate
      >
        {/* User Icon */}
        <View style={[styles.userIconContainer, { marginRight: 20 }]}>
          <FontAwesome name="user" size={35} color="#fff" />
        </View>

        {/* Text container */}
        <View style={styles.textContainer}>
          <View style={styles.rowTop}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.timestamp}>{item.timestamp}</Text>
          </View>

          {/* Expandable Message */}
          <ExpandableMessage
            text={item.lastMessage}
            collapsedLines={1}
            textStyle={{ color: item.unread ? "#fff" : "#ccc" }}
          />

          {this.state.expandedId === item.id && (
            <Text style={styles.expandHint}>Tap again to open full chat</Text>
          )}
        </View>

        {/* Unread dot */}
        {item.unread && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    </Swipeable>
  );

  render() {
    return (
      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={[styles.topTitle, { color: "#fff", marginTop: 0 }]}>
            Messages
          </Text>
          <View style={{ width: 24 }} />
          <TouchableOpacity>
            <FontAwesome name="home" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Conversations List */}
        <FlatList
          data={this.state.conversations}
          keyExtractor={(item) => item.id.toString()}
          renderItem={this.renderConversation}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  topBar: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#1a1a1a",
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  topTitle: { fontSize: 20, fontWeight: "700" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  textContainer: { flex: 1 },
  rowTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 2 },
  username: { fontWeight: "600", fontSize: 16, color: "#fff" },
  timestamp: { fontSize: 12, color: "#fff" },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#0084ff",
    marginLeft: 6,
  },
  deleteButton: {
    backgroundColor: "red",
    justifyContent: "center",
    alignItems: "center",
    width: 90,
    height: "100%",
  },
  deleteText: { color: "#fff", fontWeight: "700" },
  expandHint: { fontSize: 12, color: "#888", marginTop: 4 },
  separator: { height: 1, backgroundColor: "#fff", marginLeft: 0 },
  userIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
  },
});