import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Avatar, Text, Surface, Divider, Switch, Button, List } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logout } from '../features/auth/authSlice';
import { useNavigation } from '@react-navigation/native';

export default function SettingsScreen() {
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const nav = useNavigation();

  const [pushEnabled, setPushEnabled] = useState(true);
  const [appLock, setAppLock] = useState(false);
  const [cacheSize, setCacheSize] = useState('0 MB');

  useEffect(() => {
    (async () => {
      try {
        const push = await AsyncStorage.getItem('push_notifications');
        const lock = await AsyncStorage.getItem('app_lock');
        if (push != null) setPushEnabled(push === 'true');
        if (lock != null) setAppLock(lock === 'true');
      } catch (e) {
        console.warn('Failed to load settings', e);
      }
      await calculateCache();
    })();
  }, []);

  const togglePush = async (v) => {
    setPushEnabled(v);
    try {
      await AsyncStorage.setItem('push_notifications', v ? 'true' : 'false');
    } catch (e) {}
  };

  const toggleAppLock = async (v) => {
    setAppLock(v);
    try {
      await AsyncStorage.setItem('app_lock', v ? 'true' : 'false');
    } catch (e) {}
  };

  const calculateCache = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const items = await AsyncStorage.multiGet(keys || []);
      let bytes = 0;
      items.forEach(([k, v]) => {
        if (k && v) {
          bytes += k.length + v.length;
        }
      });
      const mb = (bytes / 1024 / 1024);
      setCacheSize(`${mb < 0.01 ? '0 MB' : `${mb.toFixed(1)} MB`}`);
    } catch (e) {
      setCacheSize('0 MB');
    }
  };

  const clearCache = () => {
    Alert.alert('Clear cache', 'Are you sure you want to clear cache?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          try {
            // Be conservative: remove known cache keys only if you have them.
            // For demo we clear AsyncStorage entirely — adjust if you store important persistent data.
            await AsyncStorage.clear();
            await calculateCache();
            setPushEnabled(false);
            setAppLock(false);
          } catch (e) {
            console.warn('Failed to clear cache', e);
          }
        },
      },
    ]);
  };

  const onSignOut = () => {
    Alert.alert('Sign out', 'Sign out from this account?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          try {
            dispatch(logout());
            nav.reset({ index: 0, routes: [{ name: 'Login' }] });
          } catch (e) {
            console.warn(e);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.header}>Settings</Text>

      <Text style={styles.sectionTitle}>ACCOUNT MANAGEMENT</Text>
      <Surface style={styles.rowSurface}>
        <View style={styles.accountRow}>
          {user?.avatarUrl ? (
            <Avatar.Image size={44} source={{ uri: user.avatarUrl }} />
          ) : (
            <Avatar.Text size={44} label={(user?.name || 'U').slice(0, 1).toUpperCase()} />
          )}
          <View style={styles.accountText}>
            <Text style={styles.accountName}>{user?.name || 'Your name'}</Text>
            <Text style={styles.accountEmail}>{user?.email || 'you@company.com'}</Text>
          </View>
          <List.Icon icon="chevron-right" color="#94a3b8" />
        </View>
      </Surface>

      <Surface style={styles.rowSurface}>
        <List.Item
          title="Signature Settings"
          titleStyle={styles.itemTitle}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => Alert.alert('Signature Settings', 'Not implemented')}
        />
      </Surface>

      <Surface style={styles.rowSurface}>
        <List.Item
          title="Out of Office"
          titleStyle={styles.itemTitle}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => Alert.alert('Out of Office', 'Not implemented')}
        />
      </Surface>

      <Text style={styles.sectionTitle}>GENERAL</Text>
      <Surface style={styles.rowSurface}>
        <List.Item
          title="Appearance"
          description="System"
          titleStyle={styles.itemTitle}
          descriptionStyle={styles.itemDesc}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => Alert.alert('Appearance', 'Not implemented')}
        />
      </Surface>

      <Surface style={styles.rowSurface}>
        <List.Item
          title="Default Browser"
          description="In-App"
          titleStyle={styles.itemTitle}
          descriptionStyle={styles.itemDesc}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => Alert.alert('Default Browser', 'Not implemented')}
        />
      </Surface>

      <Text style={styles.sectionTitle}>NOTIFICATIONS</Text>
      <Surface style={styles.rowSurface}>
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.itemTitle}>Push Notifications</Text>
          </View>
          <Switch value={pushEnabled} onValueChange={togglePush} />
        </View>
      </Surface>

      <Surface style={styles.rowSurface}>
        <List.Item
          title="Sound & Vibration"
          titleStyle={styles.itemTitle}
          right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => Alert.alert('Sound & Vibration', 'Not implemented')}
        />
      </Surface>

      <Text style={styles.sectionTitle}>SECURITY</Text>
      <Surface style={styles.rowSurface}>
        <View style={styles.toggleRow}>
          <View>
            <Text style={styles.itemTitle}>App Lock</Text>
          </View>
          <Switch value={appLock} onValueChange={toggleAppLock} />
        </View>
      </Surface>

      <Surface style={styles.rowSurface}>
        <View style={styles.clearRow}>
          <View>
            <Text style={styles.itemTitle}>Clear Cache</Text>
            <Text style={styles.itemDesc}>{cacheSize}</Text>
          </View>
          <Button mode="text" onPress={clearCache}>
            Clear
          </Button>
        </View>
      </Surface>

      <View style={{ height: 18 }} />

      <Button mode="contained" onPress={onSignOut} buttonColor="#2f80ed" style={styles.signOutBtn}>
        <Text style={{ color: '#fff', fontWeight: '700' }}>Sign Out</Text>
      </Button>

      <Text style={styles.version}>App Version 1.0.0 (Build 1)</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#081426' },
  content: { padding: 16, paddingBottom: 40 },
  header: { color: '#fff', fontSize: 20, fontWeight: '700', marginBottom: 12 },
  sectionTitle: { color: '#94a3b8', fontSize: 12, marginTop: 12, marginBottom: 8 },
  rowSurface: { borderRadius: 12, backgroundColor: '#0f1b26', marginBottom: 10, overflow: 'hidden' },
  accountRow: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  accountText: { marginLeft: 12, flex: 1 },
  accountName: { color: '#fff', fontWeight: '700' },
  accountEmail: { color: '#94a3b8', marginTop: 4 },
  itemTitle: { color: '#fff', fontWeight: '600' },
  itemDesc: { color: '#94a3b8' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  clearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  signOutBtn: { marginTop: 16, borderRadius: 10, paddingVertical: 12 },
  version: { color: '#94a3b8', textAlign: 'center', marginTop: 18 },
});