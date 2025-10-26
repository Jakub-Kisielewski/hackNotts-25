import { Tabs, useRouter } from 'expo-router';
import React from 'react';
import { TouchableOpacity, Alert, View, Text, StyleSheet } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '@/contexts/auth-context';
import { FontAwesome } from '@expo/vector-icons';

function LogoutButton() {
  const colorScheme = useColorScheme();
  const { logout } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleLogout = async () => {
    console.log('Logout button pressed');
    
    // For web compatibility, use confirm instead of Alert
    if (typeof window !== 'undefined' && window.confirm) {
      const confirmed = window.confirm('Are you sure you want to logout?');
      if (!confirmed) {
        console.log('Logout cancelled');
        return;
      }
    }
    
    try {
      setIsLoggingOut(true);
      console.log('Logging out...');
      await logout();
      console.log('Logged out, redirecting to auth...');
      router.replace('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.logoutButton} 
      onPress={handleLogout}
      activeOpacity={0.7}
      disabled={isLoggingOut}
    >
      <FontAwesome 
        size={28} 
        name="sign-out" 
        color={Colors[colorScheme ?? 'light'].tabIconDefault} 
      />
      <Text style={[
        styles.logoutText, 
        { color: Colors[colorScheme ?? 'light'].tabIconDefault }
      ]}>
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </Text>
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#000' : '#fff',
          borderTopColor: colorScheme === 'dark' ? '#333' : '#ddd',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="logout"
        options={{
          title: '',
          tabBarButton: () => <LogoutButton />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
  },
  logoutText: {
    fontSize: 10,
    marginTop: 4,
  },
});