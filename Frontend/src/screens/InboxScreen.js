import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { Text, Avatar, Divider, FAB, ActivityIndicator, Snackbar, IconButton } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMails } from '../features/mail/mailSlice';
import { useNavigation } from '@react-navigation/native';

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = (now - d) / (1000 * 60 * 60 * 24);
  if (diff < 1) {
    // show time e.g. 10:45 AM
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (diff < 2) return 'Yesterday';
  return d.toLocaleDateString();
}

export default function InboxScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const mails = useSelector((s) => s.mail.items || []);
  const loading = useSelector((s) => s.mail.loading);
  const error = useSelector((s) => s.mail.error);
  const [snackVisible, setSnackVisible] = useState(false);

  useEffect(() => {
    dispatch(fetchMails());
  }, [dispatch]);

  useEffect(() => {
    if (error) setSnackVisible(true);
  }, [error]);

  const renderItem = ({ item }) => {
    const initials = (item.from || item.from_email || 'U').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('MailDetail', { id: item.id })}
        activeOpacity={0.8}
      >
        <View style={styles.left}>
          {item.avatarUrl ? (
            <Avatar.Image size={52} source={{ uri: item.avatarUrl }} />
          ) : (
            <Avatar.Text size={52} label={initials} style={styles.avatar} />
          )}
          {item.unread && <View style={styles.unreadDot} />}
        </View>

        <View style={styles.center}>
          <View style={styles.row}>
            <Text style={styles.name}>{item.from_name || item.from || item.from_email}</Text>
            <Text style={styles.time}>{formatTime(item.created_at)}</Text>
          </View>
          <Text style={styles.subject} numberOfLines={2}>
            {item.subject || '(no subject)'}
          </Text>
          <Text style={styles.preview} numberOfLines={1}>
            {item.body ? item.body.replace(/\s+/g, ' ').trim() : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Inbox</Text>
        <IconButton icon="magnify" color="#9aa6b2" size={22} onPress={() => {}} />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator animating size="large" color="#2f80ed" />
        </View>
      ) : (
        <FlatList
          data={mails}
          keyExtractor={(i) => String(i.id)}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <Divider style={styles.divider} />}
          contentContainerStyle={styles.listContent}
        />
      )}

      <FAB
        icon="pencil"
        style={styles.fab}
        small={false}
        onPress={() => navigation.navigate('Compose')}
        color="#fff"
      />

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.tabItem}>
          <IconButton icon="inbox" color="#2f80ed" size={22} />
          <Text style={[styles.tabLabel, { color: '#2f80ed' }]}>Inbox</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <IconButton icon="send" color="#94a3b8" size={22} />
          <Text style={styles.tabLabel}>Sent</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <IconButton icon="file" color="#94a3b8" size={22} />
          <Text style={styles.tabLabel}>Drafts</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <IconButton icon="cog" color="#94a3b8" size={22} />
          <Text style={styles.tabLabel}>Settings</Text>
        </TouchableOpacity>
      </View>

      <Snackbar visible={snackVisible} onDismiss={() => setSnackVisible(false)} duration={3000}>
        {error || 'An error occurred'}
      </Snackbar>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#081426' },
  headerRow: {
    paddingTop: Platform.OS === 'ios' ? 48 : 20,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomColor: '#0f1b26',
    borderBottomWidth: 1,
  },
  headerTitle: { color: '#ffffff', fontSize: 22, fontWeight: '700' },
  listContent: { paddingBottom: 120 },
  item: { flexDirection: 'row', paddingVertical: 14, paddingHorizontal: 16, backgroundColor: 'transparent' },
  left: { width: 72, alignItems: 'center', justifyContent: 'center' },
  avatar: { backgroundColor: '#0f606f' },
  unreadDot: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 10,
    height: 10,
    borderRadius: 6,
    backgroundColor: '#0a84ff',
    borderWidth: 2,
    borderColor: '#081426',
  },
  center: { flex: 1, paddingRight: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  time: { color: '#2f80ed', fontSize: 12, fontWeight: '700' },
  subject: { color: '#ffffff', fontSize: 15, fontWeight: '700', marginTop: 4 },
  preview: { color: '#9aa6b2', fontSize: 13, marginTop: 6 },
  divider: { backgroundColor: '#0f1b26', height: 1, marginLeft: 16 },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 88,
    backgroundColor: '#2f80ed',
    width: 64,
    height: 64,
    borderRadius: 18,
    justifyContent: 'center',
  },
  bottomBar: {
    height: 64,
    borderTopColor: '#0f1b26',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#081426',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabLabel: { fontSize: 12, color: '#94a3b8' },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});