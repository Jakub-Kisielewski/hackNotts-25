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
  ActivityIndicator,
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
  user1_id: number;
  user2_id: number;
  user1_name: string;
  user2_name: string;
  last_message_content: string;
  last_message_type: string;
  last_message_sender_id: number;
};

type State = {
  conversations: Conversation[];
  expandedId: number | null;
  loading: boolean;
  currentUserId: number | null;
};

export default class Explore extends Component<{}, State> {
  state: State = {
    conversations: [],
    expandedId: null,
    loading: true,
    currentUserId: null,
  };

  pollInterval: NodeJS.Timeout | null = null;

  async componentDidMount() {
    await this.fetchCurrentUser();
    this.fetchConversations();
    
    // Start polling for new conversations every 5 seconds
    this.pollInterval = setInterval(() => {
      this.fetchConversations(true); // silent fetch
    }, 5000);
  }

  componentWillUnmount() {
    // Clean up interval
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
  }

  fetchCurrentUser = async () => {
    try {
      // Get current user from AsyncStorage
      const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        this.setState({ currentUserId: user.id });
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  fetchConversations = async () => {
    try {
      const response = await fetch('http://localhost:3001/conversations', {
        credentials: 'include',
      });
      const data = await response.json();
      
      if (data.success) {
        this.setState({ 
          conversations: data.conversations,
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      this.setState({ loading: false });
    }
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
    const { currentUserId } = this.state;
    
    // Determine the other user's name (the person we're chatting with)
    const otherUserName = currentUserId === conversation.user1_id 
      ? conversation.user2_name 
      : conversation.user1_name;
    
    const otherUserId = currentUserId === conversation.user1_id
      ? conversation.user2_id
      : conversation.user1_id;
    
    router.push({
      pathname: "/(tabs)/conversation",
      params: {
        conversationId: conversation.id.toString(),
        username: otherUserName,
        otherUserId: otherUserId.toString(),
      },
    });

    this.setState({ expandedId: null });
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

  getDisplayMessage = (conv: Conversation) => {
    if (conv.last_message_type === 'share') {
      return '📦 Shared a product';
    }
    return conv.last_message_content || 'No messages yet';
  };

  renderConversation = ({ item }: { item: Conversation }) => {
    const { currentUserId } = this.state;
    
    // Show the OTHER user's name (not the current user)
    const displayName = currentUserId === item.user1_id 
      ? item.user2_name 
      : item.user1_name;
    
    const lastMessage = this.getDisplayMessage(item);
    
    return (
      <Swipeable renderRightActions={() => this.renderRightActions(item.id)}>
        <TouchableOpacity
          style={styles.row}
          onPress={() => this.handlePress(item)}
        >
          {/* User Icon */}
          <View style={[styles.userIconContainer, { marginRight: 20 }]}>
            <FontAwesome name="user" size={35} color="#fff" />
          </View>

          {/* Text container */}
          <View style={styles.textContainer}>
            <View style={styles.rowTop}>
              <Text style={styles.username}>{displayName || 'Unknown User'}</Text>
            </View>

            {/* Expandable Message */}
            <ExpandableMessage
              text={lastMessage}
              collapsedLines={1}
              textStyle={{ color: '#ccc' }}
            />

            {this.state.expandedId === item.id && (
              <Text style={styles.expandHint}>Tap again to open full chat</Text>
            )}
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  render() {
    if (this.state.loading) {
      return (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={{ color: '#fff', marginTop: 10 }}>Loading conversations...</Text>
        </View>
      );
    }

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
        {this.state.conversations.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: '#888', fontSize: 16 }}>No conversations yet</Text>
            <Text style={{ color: '#666', fontSize: 14, marginTop: 8 }}>
              Share a product to start chatting!
            </Text>
          </View>
        ) : (
          <FlatList
            data={this.state.conversations}
            keyExtractor={(item) => item.id.toString()}
            renderItem={this.renderConversation}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        )}
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