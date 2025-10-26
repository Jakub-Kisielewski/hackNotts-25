import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, Linking, RefreshControl } from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/auth-context";

type Message = {
  id: number;
  content: string;
  sender_id: number;
  message_type: 'text' | 'share';
  product_id?: number;
  product_label?: string;
  product_company?: string;
  product_price?: number;
  product_websiteurl?: string;
  product_imageurls?: string[];
  product_sizes?: string[];
};

export default function Conversation() {
  const { conversationId, username } = useLocalSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Fetch messages when component mounts or conversation changes
  useEffect(() => {
    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId]);

  // Set up polling when screen is focused, clear when unfocused
  useFocusEffect(
    React.useCallback(() => {
      // Start polling every 3 seconds
      pollIntervalRef.current = setInterval(() => {
        fetchMessages(true); // true = silent fetch (no loading spinner)
      }, 3000);

      // Cleanup: stop polling when screen loses focus
      return () => {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
        }
      };
    }, [conversationId])
  );

  const fetchMessages = async (silent = false) => {
    if (!silent) {
      setLoading(true);
    }
    
    try {
      const response = await fetch(
        `http://localhost:3001/conversations/${conversationId}/messages`,
        { credentials: 'include' }
      );
      const data = await response.json();
      
      if (data.success) {
        setMessages(data.messages);
        
        // Auto-scroll to bottom when new messages arrive (only if not silent)
        if (!silent) {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        }
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      if (!silent) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMessages(true);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    try {
      const response = await fetch('http://localhost:3001/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          conversation_id: conversationId,
          content: input,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setMessages([...messages, data.message]);
        setInput("");
        
        // Scroll to bottom after sending
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    // Check if the current logged-in user sent this message
    const isSender = item.sender_id === user?.id;
    
    if (item.message_type === 'share' && item.product_id) {
      // Render shared product
      const imageUrl = item.product_imageurls && item.product_imageurls.length > 0 
        ? item.product_imageurls[0] 
        : null;
      
      return (
        <View style={[styles.messageBubble, isSender ? styles.sent : styles.received]}>
          <Text style={styles.shareLabel}>
            {isSender ? 'You shared a product:' : `${username} shared a product:`}
          </Text>
          
          <View style={styles.productCard}>
            {imageUrl && imageUrl !== 'NA' && (
              <Image 
                source={{ uri: imageUrl }} 
                style={styles.productImage}
                resizeMode="cover"
              />
            )}
            
            <View style={styles.productInfo}>
              <Text style={styles.productLabel}>{item.product_label}</Text>
              <Text style={styles.productCompany}>{item.product_company}</Text>
              <Text style={styles.productPrice}>
                £{typeof item.product_price === 'number' 
                  ? item.product_price.toFixed(2) 
                  : parseFloat(item.product_price || '0').toFixed(2)}
              </Text>
              
              {item.product_sizes && item.product_sizes.length > 0 && (
                <Text style={styles.productSizes}>
                  Sizes: {item.product_sizes.join(', ')}
                </Text>
              )}
              
              {item.product_websiteurl && (
                <TouchableOpacity 
                  style={styles.viewButton}
                  onPress={() => Linking.openURL(item.product_websiteurl!)}
                >
                  <Text style={styles.viewButtonText}>View Product</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      );
    }
    
    // Render text message
    return (
      <View style={[styles.messageBubble, isSender ? styles.sent : styles.received]}>
        <Text style={styles.messageText}>{item.content}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: '#fff' }}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top bar with profile picture */}
      <View style={styles.topBar}>
        <View style={styles.profilePic}>
          <FontAwesome name="user" size={40} color="#fff" />
        </View>
        <Text style={styles.username}>{username}</Text>
        <View style={styles.autoRefreshIndicator}>
          <MaterialIcons name="refresh" size={16} color="#4CAF50" />
          <Text style={styles.autoRefreshText}>Auto-refresh</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 10, flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
            colors={["#fff"]}
          />
        }
        onContentSizeChange={() => {
          // Auto-scroll to bottom when content size changes
          flatListRef.current?.scrollToEnd({ animated: false });
        }}
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
          onSubmitEditing={sendMessage}
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
  username: { fontSize: 20, fontWeight: "700", color: "#fff", flex: 1 },
  autoRefreshIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  autoRefreshText: {
    color: "#4CAF50",
    fontSize: 10,
    marginLeft: 4,
    fontWeight: "600",
  },
  messageBubble: {
    maxWidth: "70%",
    padding: 10,
    borderRadius: 16,
    marginVertical: 4,
  },
  sent: { 
    backgroundColor: "#0084ff", 
    alignSelf: "flex-end", 
    borderTopRightRadius: 0 
  },
  received: { 
    backgroundColor: "#333", 
    alignSelf: "flex-start", 
    borderTopLeftRadius: 0 
  },
  messageText: { color: "#fff", fontSize: 15 },
  shareLabel: { 
    color: "#fff", 
    fontSize: 12, 
    marginBottom: 8,
    fontStyle: 'italic'
  },
  productCard: {
    backgroundColor: "#2a2a2a",
    borderRadius: 8,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 150,
  },
  productInfo: {
    padding: 10,
  },
  productLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  productCompany: {
    color: "#bbb",
    fontSize: 14,
    marginBottom: 4,
  },
  productPrice: {
    color: "#4CAF50",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
  productSizes: {
    color: "#888",
    fontSize: 12,
    marginBottom: 8,
  },
  viewButton: {
    backgroundColor: "#0084ff",
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
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