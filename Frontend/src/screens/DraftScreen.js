import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity, Platform } from 'react-native';
import { Text, Avatar, Divider, FAB, ActivityIndicator, IconButton } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { fetchMails } from '../features/mail/mailSlice';
import { useNavigation } from '@react-navigation/native';

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const diff = (now - d) / (1000 * 60 * 60 * 24);
  if (diff < 1) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (diff < 2) return 'Yesterday';
  return d.toLocaleDateString();
}

export default function DraftsScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const mails = useSelector((s) => s.mail.items || []);
  const loading = useSelector((s) => s.mail.loading);
  const error = useSelector((s) => s.mail.error);

  useEffect(() => {
    dispatch(fetchMails());
  }, [dispatch]);

  // support a few possible draft markers used in different backends
  const drafts = mails.filter(
    (m) =>
      m.is_draft === true ||
      m.draft === true ||
      String(m.folder || '').toLowerCase() === 'drafts' ||
      String(m.folder || '').toLowerCase() === 'draft'
  );

  const renderItem = ({ item }) => {
    const toLabel = item.to_name || item.to || item.to_email || 'Recipient';
    const initials = (toLabel || 'U').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
    return (
      <TouchableOpacity
        style={styles.item}
        onPress={() => navigation.navigate('Compose', { to: item.to || item.to_email, subject: item.subject, body: item.body, attachments: item.attachments })}
        activeOpacity={0.85}
      >
        <View style={styles.left}>
          {item.to_avatar ? (
            <Avatar.Image size={48} source={{ uri: item.to_avatar }} />
          ) : (
            <Avatar.Text size={48} label={initials} style={styles.avatar} />
          )}
        </View>

        <View style={styles.center}>
          <View style={styles.row}>
            <Text style={styles.name}>To: {toLabel}</Text>
            <Text style={styles.time}>{formatTime(item.created_at)}</Text>
          </View>
          <Text style={styles.subject} numberOfLines={2}>
            {item.subject ? item.subject : <Text style={{ fontStyle: 'italic', color: '#9aa6b2' }}>(no subject)</Text>}
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
        <IconButton icon="arrow-left" color="#9aa6b2" size={22} onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Drafts</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator animating size="large" color="#2f80ed" />
        </View>
      ) : (
        <FlatList
          data={drafts}
          keyExtractor={(i) => String(i.id)}
          renderItem={renderItem}
          ItemSeparatorComponent={() => <Divider style={styles.divider} />}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<View style={styles.empty}><Text style={styles.emptyText}>No drafts</Text></View>}
        />
      )}

      <FAB
        icon="pencil"
        label="Compose"
        style={styles.fab}
        onPress={() => navigation.navigate('Compose')}
        color="#fff"
      />
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
  left: { width: 64, alignItems: 'center', justifyContent: 'center' },
  avatar: { backgroundColor: '#0f606f' },
  center: { flex: 1, paddingRight: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  time: { color: '#9aa6b2', fontSize: 12 },
  subject: { color: '#ffffff', fontSize: 15, fontWeight: '700', marginTop: 4 },
  preview: { color: '#9aa6b2', fontSize: 13, marginTop: 6 },
  divider: { backgroundColor: '#0f1b26', height: 1, marginLeft: 16 },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 24,
    backgroundColor: '#2f80ed',
    borderRadius: 28,
  },
  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: '#94a3b8' },
});
