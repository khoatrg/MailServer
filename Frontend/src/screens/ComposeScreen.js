import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Text, TextInput, IconButton, Surface, Button, Divider, Snackbar } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { sendMail } from '../features/mail/mailSlice';
import { useNavigation, useRoute } from '@react-navigation/native';

export default function ComposeScreen() {
  const dispatch = useDispatch();
  const nav = useNavigation();
  const route = useRoute();
  const prefill = route.params || {};

  const [recipients, setRecipients] = useState(
    Array.isArray(prefill.to) ? prefill.to.map((t) => ({ id: t, label: t })) : prefill.to ? [{ id: prefill.to, label: prefill.to }] : []
  );
  const [recipientInput, setRecipientInput] = useState('');
  const [subject, setSubject] = useState(prefill.subject || '');
  const [body, setBody] = useState(prefill.body || '');
  const [attachments, setAttachments] = useState(prefill.attachments || []);
  const [sending, setSending] = useState(false);
  const [snack, setSnack] = useState({ visible: false, text: '' });

  const bodyRef = useRef(null);

  useEffect(() => {
    nav.setOptions({ headerShown: false });
  }, [nav]);

  const addRecipientFromInput = () => {
    const value = recipientInput.trim();
    if (!value) return;
    // simple email or name fallback; keep label same as value
    setRecipients((p) => [...p, { id: value, label: value }]);
    setRecipientInput('');
  };

  const removeRecipient = (id) => {
    setRecipients((p) => p.filter((r) => r.id !== id));
  };

  const pickAttachment = async () => {
    try {
      // dynamic import so web/native bundlers don't fail if package not installed
      const DocumentPicker = await import('expo-document-picker');
      const res = await DocumentPicker.getDocumentAsync({});
      if (res.type === 'success') {
        setAttachments((a) => [...a, { name: res.name, size: res.size, uri: res.uri }]);
      }
    } catch (err) {
      console.warn('Document picker not available', err);
      setSnack({ visible: true, text: 'Attachment picker not available' });
    }
  };

  const removeAttachment = (idx) => {
    setAttachments((a) => a.filter((_, i) => i !== idx));
  };

  const onSend = async () => {
    // basic validation
    if (recipients.length === 0) {
      setSnack({ visible: true, text: 'Please add at least one recipient' });
      return;
    }
    if (!subject.trim() && body.trim().length === 0) {
      setSnack({ visible: true, text: 'Subject or message required' });
      return;
    }

    setSending(true);
    try {
      const to = recipients.map((r) => r.id).join(',');
      // attachments handling: currently send metadata only; backend must support actual upload
      await dispatch(sendMail({ to, subject, body, attachments })).unwrap();
      setSnack({ visible: true, text: 'Message sent' });
      setTimeout(() => nav.goBack(), 700);
    } catch (err) {
      console.warn(err);
      setSnack({ visible: true, text: err?.message || 'Failed to send' });
    } finally {
      setSending(false);
    }
  };

  // simple formatting helpers (insert markdown tags at caret end)
  const insertTag = (tag) => {
    const insert = tag === 'bullet' ? '\n• ' : tag === 'bold' ? '**bold**' : tag === 'italic' ? '_italic_' : tag === 'underline' ? '__underline__' : '';
    setBody((b) => (b ? b + insert : insert));
    // focus body
    bodyRef.current?.focus();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <View style={styles.topBar}>
        <IconButton icon="close" color="#fff" onPress={() => nav.goBack()} />
        <Text style={styles.topTitle}>Compose</Text>
        <Button mode="contained" compact onPress={onSend} loading={sending} style={styles.sendBtn} contentStyle={styles.sendContent}>
          Send
        </Button>
      </View>

      <Divider />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.row}>
          <Text style={styles.label}>To:</Text>
          <View style={styles.recipientsWrap}>
            {recipients.map((r, idx) => (
              <Surface key={r.id + idx} style={styles.chip}>
                <Text style={styles.chipText}>{r.label}</Text>
                <TouchableOpacity onPress={() => removeRecipient(r.id)} style={styles.chipX}>
                  <IconButton icon="close" size={16} color="#d1dbe0" />
                </TouchableOpacity>
              </Surface>
            ))}

            <TextInput
              placeholder="Add recipients"
              value={recipientInput}
              onChangeText={setRecipientInput}
              onSubmitEditing={addRecipientFromInput}
              style={styles.recipientInput}
              underlineColor="transparent"
              mode="flat"
              right={
                <TextInput.Icon
                  icon="chevron-down"
                  onPress={() => {
                    /* optional address book */
                  }}
                />
              }
            />
          </View>
        </View>

        <TextInput
          placeholder="Subject"
          value={subject}
          onChangeText={setSubject}
          style={styles.subject}
          mode="flat"
          underlineColor="transparent"
        />

        {/* attachments preview */}
        {attachments.map((att, i) => (
          <Surface key={i} style={styles.attachment}>
            <View style={styles.attLeft}>
              <Text style={styles.attIcon}>{(att.name || 'F').split('.').pop().toUpperCase()}</Text>
            </View>
            <View style={styles.attCenter}>
              <Text style={styles.attName} numberOfLines={1}>{att.name}</Text>
              <Text style={styles.attSize}>{att.size ? `${(att.size / 1024).toFixed(1)} KB` : ''}</Text>
            </View>
            <TouchableOpacity style={styles.attRemove} onPress={() => removeAttachment(i)}>
              <IconButton icon="close" size={18} color="#d1dbe0" />
            </TouchableOpacity>
          </Surface>
        ))}

        <TextInput
          placeholder="Compose email"
          value={body}
          onChangeText={setBody}
          multiline
          mode="flat"
          underlineColor="transparent"
          style={styles.body}
          ref={bodyRef}
        />
      </ScrollView>

      <View style={styles.toolbar}>
        <IconButton icon="paperclip" onPress={pickAttachment} color="#94a3b8" />
        <Divider style={{ height: 28, width: 1, backgroundColor: '#0f1b26', marginHorizontal: 8 }} />
        <IconButton icon="format-bold" onPress={() => insertTag('bold')} color="#94a3b8" />
        <IconButton icon="format-italic" onPress={() => insertTag('italic')} color="#94a3b8" />
        <IconButton icon="format-underline" onPress={() => insertTag('underline')} color="#94a3b8" />
        <IconButton icon="format-list-bulleted" onPress={() => insertTag('bullet')} color="#94a3b8" />
        <View style={{ flex: 1 }} />
        <IconButton icon="dots-vertical" onPress={() => {}} color="#94a3b8" />
      </View>

      <Snackbar visible={snack.visible} onDismiss={() => setSnack((s) => ({ ...s, visible: false }))} duration={3000}>
        {snack.text}
      </Snackbar>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#081426' },
  topBar: {
    height: 56,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#081426',
  },
  topTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  sendBtn: { marginRight: 8, borderRadius: 20, backgroundColor: '#2f80ed' },
  sendContent: { height: 36, paddingHorizontal: 14 },
  content: { padding: 16, paddingBottom: 92 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  label: { color: '#94a3b8', width: 36 },
  recipientsWrap: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  chip: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 20, backgroundColor: '#0f2a3a', marginRight: 8, marginBottom: 8 },
  chipText: { color: '#d1dbe0' },
  chipX: { marginLeft: 6 },
  recipientInput: { minWidth: 120, maxWidth: 240, backgroundColor: 'transparent', height: 40, marginBottom: 8 },
  subject: { backgroundColor: 'transparent', borderRadius: 8, marginBottom: 12, color: '#fff' },
  attachment: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, backgroundColor: '#0f1b26', marginVertical: 8 },
  attLeft: { width: 44, alignItems: 'center', justifyContent: 'center' },
  attIcon: { color: '#2f80ed', fontWeight: '700' },
  attCenter: { flex: 1, paddingLeft: 12 },
  attName: { color: '#fff', fontWeight: '700' },
  attSize: { color: '#94a3b8', marginTop: 4, fontSize: 12 },
  attRemove: { marginLeft: 8 },
  body: { minHeight: 240, textAlignVertical: 'top', backgroundColor: 'transparent', color: '#d1dbe0' },
  toolbar: { height: 56, borderTopColor: '#0f1b26', borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, backgroundColor: '#081426' },
});