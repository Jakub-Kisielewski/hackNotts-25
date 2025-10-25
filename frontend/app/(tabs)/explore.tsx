
import React, { Component } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity } from 'react-native';
import { AntDesign, FontAwesome } from '@expo/vector-icons';

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

  renderConversation = ({ item }: { item: Conversation }) => (
  <TouchableOpacity style={styles.row}>
    {/* Avatar or User Icon */}
    <View style={[styles.userIconContainer, { marginRight: 20 }]}>
      <FontAwesome name="user"  size={25} color="#fff" />
    </View>

    {/* Text container for username + last message */}
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
);

  render() {
    return (
      <View style={styles.container}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Text style={[styles.topTitle, { color: '#fff' }]}>Messages</Text>
          
        </View>

        {/* Conversations */}
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
  container: { flex: 1, backgroundColor: '#000' },
  topBar: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  separator: { height: 1, backgroundColor: '#fff', marginLeft: 0 },
});