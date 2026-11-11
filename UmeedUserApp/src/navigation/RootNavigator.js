import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { Plus } from 'lucide-react-native';
import { HomeIcon, IssuesIcon, WelfareIcon, CommunityIcon } from '../components/TabIcons';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import ReportIssueScreen from '../screens/ReportIssueScreen';
import MyComplaintsScreen from '../screens/MyComplaintsScreen';
import ComplaintDetailScreen from '../screens/ComplaintDetailScreen';
import WelfareScreen from '../screens/WelfareScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CommunityScreen from '../screens/support/CommunityScreen';
import BloodDonorsScreen from '../screens/support/BloodDonorsScreen';
import EventsScreen from '../screens/support/EventsScreen';
import VolunteerScreen from '../screens/support/VolunteerScreen';
import FaqScreen from '../screens/support/FaqScreen';
import ContactScreen from '../screens/support/ContactScreen';
import AboutScreen from '../screens/support/AboutScreen';
import FeedbackScreen from '../screens/support/FeedbackScreen';
import ResourcesScreen from '../screens/support/ResourcesScreen';
import DonateScreen from '../screens/donations/DonateScreen';
import DonationHistoryScreen from '../screens/donations/DonationHistoryScreen';
import DonationReceiptScreen from '../screens/donations/DonationReceiptScreen';
import TransparencyScreen from '../screens/donations/TransparencyScreen';
import ImpactStoriesScreen from '../screens/donations/ImpactStoriesScreen';
import PrivacyPolicyScreen from '../screens/legal/PrivacyPolicyScreen';
import TermsScreen from '../screens/legal/TermsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({ label, focused, Icon }) => {
  const color = focused ? colors.careGreen : colors.gray;
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', minWidth: 64 }}>
      <Icon color={color} accessibilityLabel={label} />
      <Text style={{ fontSize: 10, fontWeight: focused ? '700' : '500', color, marginTop: 2 }} numberOfLines={1}>{label}</Text>
    </View>
  );
};

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { height: 70, paddingBottom: 10, paddingTop: 8, borderTopColor: colors.lightGray },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon label="Home" Icon={HomeIcon} focused={focused} /> }} />
      <Tab.Screen name="MyIssues" component={MyComplaintsScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon label="My Issues" Icon={IssuesIcon} focused={focused} /> }} />
      <Tab.Screen
        name="Report"
        component={ReportIssueScreen}
        options={{
          tabBarButton: ({ style, ...props }) => (
            <View style={[style, styles.reportBtnWrap]}>
              <TouchableOpacity
                {...props}
                activeOpacity={0.85}
                style={styles.reportBtn}
              >
                <Plus size={26} color="#fff" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      <Tab.Screen name="Welfare" component={WelfareScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon label="Welfare" Icon={WelfareIcon} focused={focused} /> }} />
      <Tab.Screen name="Community" component={CommunityScreen} options={{ tabBarIcon: ({ focused }) => <TabIcon label="Community" Icon={CommunityIcon} focused={focused} /> }} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <SplashScreen />;

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="ComplaintDetail" component={ComplaintDetailScreen} options={{ headerShown: true, title: 'Complaint' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: true, title: 'Notifications' }} />
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: true, title: 'Profile' }} />
            <Stack.Screen name="BloodDonors" component={BloodDonorsScreen} options={{ headerShown: true, title: 'Blood Donors' }} />
            <Stack.Screen name="Events" component={EventsScreen} options={{ headerShown: true, title: 'Events & Campaigns' }} />
            <Stack.Screen name="Volunteer" component={VolunteerScreen} options={{ headerShown: true, title: 'Volunteer Signup' }} />
            <Stack.Screen name="Faq" component={FaqScreen} options={{ headerShown: true, title: 'FAQ / Help' }} />
            <Stack.Screen name="Contact" component={ContactScreen} options={{ headerShown: true, title: 'Contact Umeed' }} />
            <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: true, title: 'About Umeed' }} />
            <Stack.Screen name="Feedback" component={FeedbackScreen} options={{ headerShown: true, title: 'Feedback' }} />
            <Stack.Screen name="Resources" component={ResourcesScreen} options={{ headerShown: true, title: 'Book Bank & Scholarships' }} />
            <Stack.Screen name="Donate" component={DonateScreen} options={{ headerShown: true, title: 'Donate / Support' }} />
            <Stack.Screen name="DonationHistory" component={DonationHistoryScreen} options={{ headerShown: true, title: 'Donation History' }} />
            <Stack.Screen name="DonationReceipt" component={DonationReceiptScreen} options={{ headerShown: true, title: 'Receipt' }} />
            <Stack.Screen name="Transparency" component={TransparencyScreen} options={{ headerShown: true, title: 'Transparency' }} />
            <Stack.Screen name="ImpactStories" component={ImpactStoriesScreen} options={{ headerShown: true, title: 'Impact Stories' }} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: true, title: 'Privacy Policy' }} />
            <Stack.Screen name="Terms" component={TermsScreen} options={{ headerShown: true, title: 'Terms of Use' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  reportBtnWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportBtn: {
    top: -18,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.careGreen,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.careGreen,
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});