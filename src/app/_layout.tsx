import { Tabs } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme, Platform, StyleSheet, View } from 'react-native';
import { Wallet as LucideWallet, BookOpen as LucideBookOpen, Dumbbell as LucideDumbbell, CheckSquare as LucideCheckSquare } from 'lucide-react-native';
const Wallet = LucideWallet as any;
const BookOpen = LucideBookOpen as any;
const Dumbbell = LucideDumbbell as any;
const CheckSquare = LucideCheckSquare as any;

import { Colors } from '@/constants/theme';
import { AnimatedSplashOverlay } from '@/components/animated-icon';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <AnimatedSplashOverlay />
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#6366F1', // Indigo Accent
            tabBarInactiveTintColor: theme.textSecondary,
            tabBarStyle: {
              backgroundColor: theme.background,
              borderTopColor: theme.backgroundElement,
              height: Platform.OS === 'ios' ? 88 : 65,
              paddingBottom: Platform.OS === 'ios' ? 30 : 10,
              paddingTop: 10,
              borderTopWidth: 1,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: colorScheme === 'dark' ? 0.3 : 0.05,
              shadowRadius: 8,
              elevation: 5,
            },
            tabBarLabelStyle: {
              fontSize: 12,
              fontWeight: '500',
            },
            headerStyle: {
              backgroundColor: theme.background,
              borderBottomColor: theme.backgroundElement,
              borderBottomWidth: 1,
              shadowColor: 'transparent',
              elevation: 0,
            },
            headerTitleStyle: {
              color: theme.text,
              fontSize: 18,
              fontWeight: 'bold',
            },
            headerTintColor: theme.text,
            headerShown: true,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Финансы',
              tabBarLabel: 'Финансы',
              tabBarIcon: ({ color, size }) => <Wallet color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="journal"
            options={{
              title: 'Дневник',
              tabBarLabel: 'Дневник',
              tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="workout"
            options={{
              title: 'Тренировки',
              tabBarLabel: 'Зал',
              tabBarIcon: ({ color, size }) => <Dumbbell color={color} size={size} />,
            }}
          />
          <Tabs.Screen
            name="habits"
            options={{
              title: 'Привычки',
              tabBarLabel: 'Привычки',
              tabBarIcon: ({ color, size }) => <CheckSquare color={color} size={size} />,
            }}
          />
          
          {/* Hide explore and components that are not part of main tabs */}
          <Tabs.Screen
            name="explore"
            options={{
              href: null,
            }}
          />
        </Tabs>
      </View>
    </ThemeProvider>
  );
}
