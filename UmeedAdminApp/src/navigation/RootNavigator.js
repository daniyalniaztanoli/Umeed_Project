import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { LayoutDashboard, ClipboardList, HandHeart, HeartHandshake, Menu } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';

import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import NotificationsScreen from '../screens/dashboard/NotificationsScreen';
import ProfileScreen from '../screens/dashboard/ProfileScreen';

import ComplaintsScreen from '../screens/complaints/ComplaintsScreen';
import ComplaintDetailScreen from '../screens/complaints/ComplaintDetailScreen';

import WelfareScreen from '../screens/welfare/WelfareScreen';
import WelfareDetailScreen from '../screens/welfare/WelfareDetailScreen';

import DonationsScreen from '../screens/donations/DonationsScreen';
import DonationDetailScreen from '../screens/donations/DonationDetailScreen';

import MoreScreen from '../screens/content/MoreScreen';
import AnnouncementsScreen from '../screens/content/AnnouncementsScreen';
import AnnouncementFormScreen from '../screens/content/AnnouncementFormScreen';
import EventsScreen from '../screens/content/EventsScreen';
import EventFormScreen from '../screens/content/EventFormScreen';
import ResourcesScreen from '../screens/content/ResourcesScreen';
import ResourceFormScreen from '../screens/content/ResourceFormScreen';
import ImpactStoriesScreen from '../screens/content/ImpactStoriesScreen';
import ImpactStoryFormScreen from '../screens/content/ImpactStoryFormScreen';
import VolunteersScreen from '../screens/content/VolunteersScreen';
import BloodDonorsScreen from '../screens/content/BloodDonorsScreen';
import FeedbackScreen from '../screens/content/FeedbackScreen';

import UsersScreen from '../screens/users/UsersScreen';
import StaffScreen from '../screens/users/StaffScreen';
import DepartmentsScreen from '../screens/users/DepartmentsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ label, focused, Icon }) => {
  const color = focused ? colors.careGreen : colors.gray;
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', minWidth: 64 }}>
      <Icon color={color} size={20} strokeWidth={2} />
      <Text style={{ fontSize: 10, fontWeight: focused ? '700' : '500', color, marginTop: 2 }} numberOfLines={1}>{label}</Text>
    </View>
  );
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: 66, paddingBottom: 8, paddingTop: 8, borderTopColor: colors.lightGray },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen name="DashboardTab" component={DashboardScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon label="Dashboard" Icon={LayoutDashboard} focused={focused} /> }} />
      <Tab.Screen name="ComplaintsTab" component={ComplaintsScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon label="Complaints" Icon={ClipboardList} focused={focused} /> }} />
      <Tab.Screen name="WelfareTab" component={WelfareScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon label="Welfare" Icon={HandHeart} focused={focused} /> }} />
      <Tab.Screen name="DonationsTab" component={DonationsScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon label="Donations" Icon={HeartHandshake} focused={focused} /> }} />
      <Tab.Screen name="MoreTab" component={MoreScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon label="More" Icon={Menu} focused={focused} /> }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} options={{ headerShown: true, title: 'Complaint' }} />
            <Stack.Screen name="WelfareDetail" component={WelfareDetailScreen} options={{ headerShown: true, title: 'Welfare Request' }} />
            <Stack.Screen name="DonationDetail" component={DonationDetailScreen} options={{ headerShown: true, title: 'Donation' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: true, title: 'Notifications' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: 'Profile' }} />
            <Stack.Screen name="Announcements" component={AnnouncementsScreen} options={{ headerShown: true, title: 'Announcements' }} />
            <Stack.Screen name="AnnouncementForm" component={AnnouncementFormScreen} options={{ headerShown: true, title: 'Announcement' }} />
            <Stack.Screen name="Events" component={EventsScreen} options={{ headerShown: true, title: 'Events & Campaigns' }} />
            <Stack.Screen name="EventForm" component={EventFormScreen} options={{ headerShown: true, title: 'Event' }} />
            <Stack.Screen name="Resources" component={ResourcesScreen} options={{ headerShown: true, title: 'Resources' }} />
            <Stack.Screen name="ResourceForm" component={ResourceFormScreen} options={{ headerShown: true, title: 'Resource' }} />
            <Stack.Screen name="ImpactStories" component={ImpactStoriesScreen} options={{ headerShown: true, title: 'Impact Stories' }} />
            <Stack.Screen name="ImpactStoryForm" component={ImpactStoryFormScreen} options={{ headerShown: true, title: 'Impact Story' }} />
            <Stack.Screen name="Volunteers" component={VolunteersScreen} options={{ headerShown: true, title: 'Volunteers' }} />
            <Stack.Screen name="BloodDonors" component={BloodDonorsScreen} options={{ headerShown: true, title: 'Blood Donors' }} />
            <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ headerShown: true, title: 'Feedback' }} />
            <Stack.Screen name="Users" component={UsersScreen} options={{ headerShown: true, title: 'Users' }} />
            <Stack.Screen name="Staff" component={StaffScreen} options={{ headerShown: true, title: 'Staff' }} />
            <Stack.Screen name="Departments" component={DepartmentsScreen} options={{ headerShown: true, title: 'Departments' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
