import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { AuthContext } from '../context/AuthContext';
import { DrawerMenu } from '../components/DrawerMenu';

import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Complaints from '../pages/Complaints';
import ComplaintDetail from '../pages/ComplaintDetail';
import Welfare from '../pages/Welfare';
import WelfareDetail from '../pages/WelfareDetail';
import Donations from '../pages/Donations';
import DonationDetail from '../pages/DonationDetail';
import Announcements from '../pages/Announcements';
import Users from '../pages/Users';
import Staff from '../pages/Staff';
import Departments from '../pages/Departments';
import BloodDonors from '../pages/BloodDonors';
import Events from '../pages/Events';
import Volunteers from '../pages/Volunteers';
import ImpactStories from '../pages/ImpactStories';
import Notifications from '../pages/Notifications';
import Feedback from '../pages/Feedback';
import Resources from '../pages/Resources';
import Reports from '../pages/Reports';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

function AdminDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <DrawerMenu {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Drawer.Screen name="Dashboard" component={Dashboard} />
      <Drawer.Screen name="Complaints" component={Complaints} />
      <Drawer.Screen name="ComplaintDetail" component={ComplaintDetail} />
      <Drawer.Screen name="Welfare" component={Welfare} />
      <Drawer.Screen name="WelfareDetail" component={WelfareDetail} />
      <Drawer.Screen name="Donations" component={Donations} />
      <Drawer.Screen name="DonationDetail" component={DonationDetail} />
      <Drawer.Screen name="Announcements" component={Announcements} />
      <Drawer.Screen name="Users" component={Users} />
      <Drawer.Screen name="Staff" component={Staff} />
      <Drawer.Screen name="Departments" component={Departments} />
      <Drawer.Screen name="BloodDonors" component={BloodDonors} />
      <Drawer.Screen name="Events" component={Events} />
      <Drawer.Screen name="Volunteers" component={Volunteers} />
      <Drawer.Screen name="ImpactStories" component={ImpactStories} />
      <Drawer.Screen name="Notifications" component={Notifications} />
      <Drawer.Screen name="Feedback" component={Feedback} />
      <Drawer.Screen name="Resources" component={Resources} />
      <Drawer.Screen name="Reports" component={Reports} />
    </Drawer.Navigator>
  );
}

export default function RootNavigator() {
  const { user, loading } = useContext(AuthContext);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {loading ? (
          <Stack.Screen name="Splash" component={() => null} />
        ) : user ? (
          <Stack.Screen name="Admin" component={AdminDrawer} />
        ) : (
          <Stack.Screen name="Login" component={Login} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
