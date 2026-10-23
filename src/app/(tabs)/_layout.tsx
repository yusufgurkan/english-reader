import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Kitaplar',
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
