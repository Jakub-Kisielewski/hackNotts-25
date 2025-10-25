import React, { Component } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

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
};

export default class InstagramInbox extends Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      conversations: [
        {
          id: 1,
          username: 'Alex',
          avatar: '',
          lastMessage: 'Can you see my new outfit?',
          timestamp: '2h',
          unread: true,
        },
        {
          id: 2,
          username: 'Emma',
          avatar: '',
          lastMessage: 'Love the jacket!',
          timestamp: '1d',
          unread: false,
        },
        {
          id: 3,
          username: 'Ryan',
          avatar: '',
          lastMessage: 'Check this look 😎',
          timestamp: '3d',
          unread: true,
        },
      ],
    };
  }
  openConversation = (id: number) => {
    console.log('Open conversation', id);
    // Mark as read
    this.setState(prevState => ({
      conversations: prevState.conversations.map(c =>
        c.id === id ? { ...c, unread: false } : c
      ),
    }));
  };

  deleteConversation = (id: number) => {
    this.setState(prevState => ({
      conversations: prevState.conversations.filter(c => c.id !== id),
    }));
  };

  
  renderRightActions = (id: number) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => this.deleteConversation(id)}
    >
      <Text style={styles.deleteText}>Delete</Text>
    </TouchableOpacity>
  );

   renderConversation = ({ item }: { item: Conversation }) => (
    <Swipeable renderRightActions={() => this.renderRightActions(item.id)}>
      <TouchableOpacity
        style={styles.row}
        onPress={() => this.openConversation(item.id)}
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
          <Text
            style={[styles.lastMessage, item.unread ? styles.unread : {}]}
            numberOfLines={1}
          >
            {item.lastMessage}
          </Text>
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
          <Text style={[styles.topTitle, { color: '#fff' , marginTop:0 }]}>Messages</Text>
          <View style={{ width: 24 }} />
          <TouchableOpacity>
            <FontAwesome name="home" size={24} color="#fff"  />
          </TouchableOpacity>
          
        </View>

        {/* Conversations */}
        <FlatList
          data={this.state.conversations}
          keyExtractor={item => item.id.toString()}
          renderItem={this.renderConversation}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  topBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  topTitle: { fontSize: 20, fontWeight: '700' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,

  },

  avatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12 },
  textContainer: { flex: 1 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  username: { fontWeight: '600', fontSize: 16 },
  timestamp: { fontSize: 12, color: '#fff' },
  lastMessage: { fontSize: 14, color: '#fff' },
  unread: { fontWeight: '700', color: '#fff' },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0084ff',
    marginLeft: 6,
  },

  deleteButton: {
  backgroundColor: 'red',
  justifyContent: 'center',
  alignItems: 'center',
  width: 90, // slightly larger
  height: '100%',
},

  separator: { height: 1, backgroundColor: '#fff', marginLeft: 0 },
});