import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { Avatar, Text, Divider } from 'react-native-paper';
import { useSelector } from 'react-redux';

import InboxScreen from '../screens/InboxScreen';
import SentScreen from '../screens/SentScreen';
import ComposeScreen from '../screens/ComposeScreen';
import MailDetailScreen from '../screens/MailDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import SettingsScreen from '../screens/SettingScreen';
import DraftScreen from '../screens/DraftScreen';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Inbox" component={InboxScreen} />
      <Stack.Screen name="MailDetail" component={MailDetailScreen} />
      <Stack.Screen name="Compose" component={ComposeScreen} />
      <Stack.Screen name="Sent" component={SentScreen} />
    </Stack.Navigator>
  );
}

function CustomDrawerContent(props) {
  // wire to Redux auth slice
  const user = useSelector((s) => s.auth.user);
  const userName = user?.name || (user?.email ? user.email.split('@')[0] : 'Guest');
  const userEmail = user?.email || '';

  const avatarLabel = (userName || 'U').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.drawerScroll}>
      <View style={styles.header}>
        {user?.avatarUrl ? (
          <Avatar.Image size={56} source={{ uri: user.avatarUrl }} style={styles.avatar} />
        ) : (
          <Avatar.Text size={56} label={avatarLabel} style={styles.avatar} />
        )}
        <View style={styles.headerText}>
          <Text style={styles.name}>{userName}</Text>
          {userEmail ? <Text style={styles.email}>{userEmail}</Text> : null}
        </View>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.items}>
        <DrawerItem label="Inbox" labelStyle={styles.itemLabel} onPress={() => props.navigation.navigate('Inbox')} />
        <DrawerItem label="Sent" labelStyle={styles.itemLabel} onPress={() => props.navigation.navigate('Sent')} />
        <DrawerItem label="Drafts" labelStyle={styles.itemLabel} onPress={() => { props.navigation.navigate('Drafts'); }} />
        <DrawerItem label="Settings" labelStyle={styles.itemLabel} onPress={() => { props.navigation.navigate('Settings'); }} />
      </View>

      <View style={{ flex: 1 }} />

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => props.navigation.navigate('Compose')} style={styles.composeBtn}>
          <Text style={styles.composeText}>Compose</Text>
        </TouchableOpacity>
        <Text style={styles.version}>v1.0</Text>
      </View>
    </DrawerContentScrollView>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer theme={DarkTheme}>
      <Drawer.Navigator
        initialRouteName="Inbox"
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerStyle: styles.drawerStyle,
        }}
      >
        <Drawer.Screen name="Main" component={MainStack} options={{ title: 'Inbox' }} />
        <Drawer.Screen name="Drafts" component={DraftScreen} options={{ title: 'Drafts' }} />
        <Drawer.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
        <Drawer.Screen name="Sent" component={SentScreen} options={{ title: 'Sent' }} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  drawerStyle: { backgroundColor: '#07121a' },
  drawerScroll: { flex: 1, paddingVertical: 8 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 20 },
  avatar: { backgroundColor: '#ffffff' },
  headerText: { marginLeft: 12 },
  name: { color: '#ffffff', fontWeight: '700', fontSize: 16 },
  email: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  divider: { backgroundColor: '#0f1b26', marginHorizontal: 0, height: 1 },
  items: { marginTop: 8 },
  itemLabel: { color: '#d1dbe0', fontWeight: '600' },
  footer: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#0f1b26' },
  composeBtn: {
    backgroundColor: '#2f80ed',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  composeText: { color: '#fff', fontWeight: '700' },
  version: { color: '#94a3b8', marginTop: 8, textAlign: 'center' },
});
