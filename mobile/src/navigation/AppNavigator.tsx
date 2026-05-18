import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

import HomeScreen from "../screens/HomeScreen";
import EstimateScreen from "../screens/EstimateScreen";
import PropertiesScreen from "../screens/PropertiesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import VerifyEmailScreen from "../screens/VerifyEmailScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const COLORS = { primary: "#1e40af", inactive: "#9ca3af" };

function TabNavigator() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, string> = {
            Home: focused ? "home" : "home-outline",
            Estimate: focused ? "calculator" : "calculator-outline",
            Properties: focused ? "business" : "business-outline",
            Profile: focused ? "person" : "person-outline",
          };
          return <Ionicons name={icons[route.name] as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        tabBarStyle: { height: 60, paddingBottom: 8, paddingTop: 4, borderTopColor: "#f3f4f6" },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: t("nav.home") }} />
      <Tab.Screen name="Estimate" component={EstimateScreen} options={{ title: t("nav.estimate") }} />
      <Tab.Screen name="Properties" component={PropertiesScreen} options={{ title: t("nav.properties") }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: t("nav.profile") }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="VerifyEmail" component={VerifyEmailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
