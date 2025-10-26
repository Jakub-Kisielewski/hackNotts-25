import React, { useState } from 'react';
import { View, StyleSheet, FlatList, Dimensions, Pressable } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

const { height } = Dimensions.get('window');

// Dummy pages just to show scroll working
const PAGES = Array.from({ length: 5 }, (_, i) => ({ id: `${i + 1}` }));

const Page = ({ index }: { index: number }) => {
  const [liked, setLiked] = useState(false);
  const toggleHeart = () => setLiked(!liked);

  return (
    <View style={styles.page}>
      <Pressable style={styles.imageContainer} onPress={toggleHeart}>
        <ThemedText type="title">Product Image</ThemedText>
      </Pressable>

      <Pressable style={styles.heartContainer} onPress={toggleHeart}>
        <FontAwesomeIcon
          icon={liked ? faHeartSolid : faHeartRegular}
          size={30}
          color={liked ? 'red' : 'white'}
        />
      </Pressable>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">More information</ThemedText>
        <ThemedText type="default">Company: </ThemedText>
        <ThemedText type="default">Label: </ThemedText>
        <ThemedText type="default">Price: </ThemedText>
        <ThemedText type="default">URL: </ThemedText>
      </ThemedView>
    </View>
  );
};

export default function HomeScreen() {
  return (
    <FlatList
      data={PAGES}
      keyExtractor={(item) => item.id}
      renderItem={({ index }) => <Page index={index} />}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      snapToAlignment="start"
      decelerationRate="fast"
      snapToInterval={height}
      getItemLayout={(_, index) => ({
        length: height,
        offset: height * index,
        index,
      })}
    />
  );
}

const styles = StyleSheet.create({
  page: {
    height: height,
    width: '100%',
    backgroundColor: '#000',
    position: 'relative',
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    minHeight: '50%',
    justifyContent: 'center',
    flex: 1,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    width: '100%',
    opacity: 0.8,
  },
  heartContainer: { 
    borderColor: 'white', 
    borderWidth: 2, 
    borderRadius: 50, 
    padding: 10, 
    paddingLeft: 15, },
});