import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, LayoutAnimation, Platform, UIManager } from "react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type Props = {
  text: string;
  collapsedLines?: number;
  textStyle?: object;
};

export default function ExpandableMessage({ text, collapsedLines = 3, textStyle = {} }: Props) {
  const [expanded, setExpanded] = useState(false);

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={{ marginVertical: 4 }}>
      <TouchableOpacity activeOpacity={0.8} onPress={toggle}>
        <Text
          style={[styles.text, textStyle]}
          numberOfLines={expanded ? undefined : collapsedLines}
          ellipsizeMode="tail"
        >
          {text}
        </Text>
      </TouchableOpacity>
      <Text style={styles.toggleHint}>{expanded ? "Tap to collapse" : "Tap to expand"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  text: { fontSize: 15, color: "#fff", lineHeight: 20 },
  toggleHint: { fontSize: 12, color: "#888", marginTop: 2 },
});