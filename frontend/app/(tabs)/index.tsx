import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';


export default function HomeScreen() {
  const [liked, setLiked] = useState(false);

  const toggleHeart = () => setLiked(!liked);

  return (
    <>
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
    </>
  );
}

const styles = StyleSheet.create({
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    minHeight: '50%',
    justifyContent: 'center',
    color: 'white',
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
    paddingLeft: 15, 
  },
});
