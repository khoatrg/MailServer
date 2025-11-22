import React, { useMemo } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Text, Avatar, IconButton, Surface, Divider, Button } from 'react-native-paper';
import { useSelector } from 'react-redux';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function MailDetailScreen() {
  const nav = useNavigation();
  const route = useRoute();
  const { id } = route.params || {};
  const mails = useSelector((s) => s.mail.items || []);
  const mail = useMemo(() => mails.find((m) => String(m.id) === String(id)) || null, [mails, id]);

  if (!mail) {
    return (
      <View style={styles.empty}>
        <Text style={{ color: '#9aa6b2' }}>Message not found</Text>
      </View>
    );
  }

  const attachments = mail.attachments || []; // array of { name, size, url }

  const onDownload = (att) => {
    if (att.url) Linking.openURL(att.url);
  };

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <IconButton icon="arrow-left" color="#fff" size={24} onPress={() => nav.goBack()} />
        <View style={{ flex: 1 }} />
        <IconButton icon="download" color="#fff" size={22} onPress={() => {}} />
        <IconButton icon="dots-vertical" color="#fff" size={22} onPress={() => {}} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{mail.subject || '(no subject)'}</Text>

        <View style={styles.senderRow}>
          {mail.avatarUrl ? (
            <Avatar.Image size={56} source={{ uri: mail.avatarUrl }} style={styles.avatar} />
          ) : (
            <Avatar.Text size={56} label={(mail.from || 'U').slice(0, 2).toUpperCase()} style={styles.avatar} />
          )}
          <View style={styles.senderInfo}>
            <Text style={styles.senderName}>{mail.from_name || mail.from || mail.from_email}</Text>
            <Text style={styles.toText}>To: {mail.to || mail.to_email || 'You'}</Text>
          </View>
          <View style={styles.timeWrap}>
            <Text style={styles.timeText}>{new Date(mail.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </View>
        </View>

        <View style={styles.bodyWrap}>
          {String(mail.body || '')
            .split('\n\n')
            .map((p, i) => (
              <Text key={i} style={styles.paragraph}>
                {p.trim()}
              </Text>
            ))}
        </View>

        {attachments.length > 0 && (
          <>
            <Text style={styles.attachHeading}>Attachments</Text>
            {attachments.map((att, i) => (
              <Surface key={i} style={styles.attachment}>
                <View style={styles.attLeft}>
                  <View style={styles.attIcon}>
                    <Text style={styles.attIconText}>{(att.name || 'F').split('.').pop().toUpperCase()}</Text>
                  </View>
                </View>
                <View style={styles.attCenter}>
                  <Text style={styles.attName} numberOfLines={1}>{att.name}</Text>
                  <Text style={styles.attSize}>{att.size || '—'}</Text>
                </View>
                <TouchableOpacity style={styles.attAction} onPress={() => onDownload(att)}>
                  <IconButton icon="download" size={20} color="#94a3b8" />
                </TouchableOpacity>
              </Surface>
            ))}
          </>
        )}

        <View style={{ height: 88 }} />
      </ScrollView>

      <Divider />
      <View style={styles.actionBar}>
        <Button mode="text" compact icon="reply" onPress={() => nav.navigate('Compose', { to: mail.from_email || mail.from })} labelStyle={styles.actionLabel}>
          Reply
        </Button>
        <Button mode="text" compact icon="reply-all" onPress={() => nav.navigate('Compose', { to: (mail.to || '').split(',') })} labelStyle={styles.actionLabel}>
          Reply All
        </Button>
        <Button mode="text" compact icon="forward" onPress={() => nav.navigate('Compose', { to: '' })} labelStyle={styles.actionLabel}>
          Forward
        </Button>
        <Button mode="text" compact icon="trash-can" buttonColor="transparent" onPress={() => { /* delete handler */ }} labelStyle={[styles.actionLabel, { color: '#ff4d4f' }]}>
          Delete
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#081426' },
  topBar: {
    paddingTop: 16,
    paddingBottom: 8,
    paddingHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#0f1b26',
    borderBottomWidth: 1,
  },
  scroll: { padding: 20, paddingBottom: 0 },
  title: { color: '#ffffff', fontSize: 28, fontWeight: '800', marginBottom: 18 },
  senderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  avatar: { backgroundColor: '#0f606f' },
  senderInfo: { marginLeft: 12, flex: 1 },
  senderName: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
  toText: { color: '#94a3b8', marginTop: 4 },
  timeWrap: { alignItems: 'flex-end', marginLeft: 8 },
  timeText: { color: '#9aa6b2' },
  bodyWrap: { marginTop: 6 },
  paragraph: { color: '#d1dbe0', lineHeight: 24, marginBottom: 16, fontSize: 16 },
  attachHeading: { color: '#ffffff', fontSize: 18, fontWeight: '700', marginTop: 12, marginBottom: 8 },
  attachment: {
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#0f1b26',
    flexDirection: 'row',
    alignItems: 'center',
  },
  attLeft: { width: 56, alignItems: 'center', justifyContent: 'center' },
  attIcon: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#2b3740',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attIconText: { color: '#ffb4a2', fontWeight: '700' },
  attCenter: { flex: 1, paddingLeft: 12 },
  attName: { color: '#ffffff', fontWeight: '700' },
  attSize: { color: '#94a3b8', marginTop: 4 },
  attAction: { marginLeft: 8 },
  actionBar: {
    height: 64,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 6,
    backgroundColor: '#081426',
  },
  actionLabel: { color: '#94a3b8', fontSize: 12 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#081426' },
});