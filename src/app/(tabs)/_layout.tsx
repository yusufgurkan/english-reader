import Ionicons from '@expo/vector-icons/Ionicons';
import { router, Tabs } from 'expo-router';
import { Pressable } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Kitaplar',
          headerRight: () => (
            <Pressable
              onPress={() => router.push('/about')}
              hitSlop={12}
              style={{ marginRight: 16 }}
              accessibilityRole="button"
              accessibilityLabel="Hakkında"
            >
              <Ionicons name="information-circle-outline" size={24} color="#2563eb" />
            </Pressable>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library-outline" size={size} color={typeof color === "string" ? color : undefined} />
          ),
        }}
      />
      <Tabs.Screen
        name="words"
        options={{
          title: 'Kelimelerim',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bookmark-outline" size={size} color={typeof color === "string" ? color : undefined} />
          ),
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: 'Test',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school-outline" size={size} color={typeof color === "string" ? color : undefined} />
          ),
        }}
      />
    </Tabs>
  );
}
