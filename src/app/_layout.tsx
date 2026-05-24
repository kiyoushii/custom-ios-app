import { Tabs } from 'expo-router';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme, Platform, View } from 'react-native';
import { Wallet as LucideWallet, BookOpen as LucideBookOpen, Dumbbell as LucideDumbbell, CheckSquare as LucideCheckSquare } from 'lucide-react-native';

const Wallet = LucideWallet as any;
const BookOpen = LucideBookOpen as any;
const Dumbbell = LucideDumbbell as any;
const CheckSquare = LucideCheckSquare as any;

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { ThemeProvider as CustomThemeProvider } from '@/context/ThemeContext';
import { useTheme } from '@/hooks/use-theme';

function AppLayout() {
  const theme = useTheme();
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View style={{ flex: 1, backgroundColor: theme.background }}>
        <AnimatedSplashOverlay />
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: theme.accent,
            tabBarInactiveTintColor: theme.textSecondary,
            tabBarStyle: {
              backgroundColor: theme.background,
              borderTopColor: theme.border,
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
              borderBottomColor: theme.border,
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

export default function RootLayout() {
  return (
    <CustomThemeProvider>
      <AppLayout />
    </CustomThemeProvider>
  );
}
