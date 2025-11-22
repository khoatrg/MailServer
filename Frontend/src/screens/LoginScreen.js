import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { Text, TextInput, Button, IconButton, Surface, Divider } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { login } from '../features/auth/authSlice';

export default function LoginScreen({ navigation }) {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [visiblePassword, setVisiblePassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSignIn = async () => {
    setLoading(true);
    try {
      await dispatch(login({ email, password })).unwrap();
      // navigation is handled by auth state -> navigation stack
    } catch (err) {
      // simple feedback; your auth slice already surfaces errors
      // you can show a Snackbar here if you have one
      console.warn('Login failed', err);
    } finally {
      setLoading(false);
    }
  };

  const onBiometric = () => {
    // placeholder - wire actual biometric auth later
    console.log('Biometric pressed');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <View style={styles.topWrap}>
        <Surface style={styles.logoBox}>
          <Text style={styles.logoText}>LOGO</Text>
        </Surface>
        <Text variant="headlineLarge" style={styles.title}>Secure Sign In</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>Access your internal company mail</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Username"
          placeholder="Enter your username"
          mode="outlined"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          outlineColor="transparent"
          activeOutlineColor="#2f80ed"
          left={<TextInput.Icon name="account" />}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <View>
          <TextInput
            label="Password"
            placeholder="Enter your password"
            mode="outlined"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!visiblePassword}
            style={styles.input}
            outlineColor="transparent"
            activeOutlineColor="#2f80ed"
            left={<TextInput.Icon name="lock" />}
            right={<TextInput.Icon name={visiblePassword ? 'eye-off' : 'eye'} onPress={() => setVisiblePassword(v => !v)} />}
          />
          <TouchableOpacity onPress={() => {/* TODO: forgot password flow */}} style={styles.forgotWrap}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <Button
          mode="contained"
          onPress={onSignIn}
          loading={loading}
          disabled={loading}
          buttonColor="#2f80ed"
          contentStyle={styles.signInContent}
          style={styles.signInButton}
        >
          Sign In
        </Button>

        <View style={styles.orWrap}>
          <Divider style={styles.line} />
          <Text style={styles.orText}>OR</Text>
          <Divider style={styles.line} />
        </View>

        <Button
          mode="outlined"
          onPress={onBiometric}
          style={styles.bioButton}
          contentStyle={styles.bioContent}
          icon="fingerprint"
        >
          Sign in with Biometrics
        </Button>

        <TouchableOpacity onPress={() => Linking.openURL('https://example.com/terms')} style={styles.termsWrap}>
          <Text style={styles.termsText}>By signing in, you agree to our <Text style={styles.linkText}>Terms of Service</Text>.</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#081426', paddingHorizontal: 24, paddingTop: 48 },
  topWrap: { alignItems: 'center', marginBottom: 24 },
  logoBox: {
    width: 88,
    height: 88,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginBottom: 18,
  },
  logoText: { color: '#2f80ed', fontWeight: '700' },
  title: { color: '#ffffff', fontWeight: '700', marginBottom: 6 },
  subtitle: { color: '#9aa6b2', textAlign: 'center' },
  form: { marginTop: 8 },
  input: {
    backgroundColor: '#0f1b26',
    borderRadius: 12,
    marginBottom: 12,
  },
  forgotWrap: { alignSelf: 'flex-end', marginTop: 6, marginBottom: 6 },
  forgotText: { color: '#4da6ff', fontSize: 13 },
  signInButton: { borderRadius: 12, marginTop: 6 },
  signInContent: { height: 52 },
  orWrap: { flexDirection: 'row', alignItems: 'center', marginVertical: 12 },
  line: { flex: 1, height: 1, backgroundColor: '#20313b' },
  orText: { marginHorizontal: 12, color: '#9aa6b2' },
  bioButton: {
    borderRadius: 12,
    borderColor: '#2f80ed',
  },
  bioContent: { height: 48 },
  termsWrap: { marginTop: 14, alignItems: 'center' },
  termsText: { color: '#94a3b8', fontSize: 12, textAlign: 'center' },
  linkText: { color: '#4da6ff', textDecorationLine: 'underline' },
});