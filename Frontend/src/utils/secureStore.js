import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let SecureStoreNative = null;
try {
  // dynamic require so bundlers for web don't fail when expo-secure-store isn't installed
  // eslint-disable-next-line global-require
  SecureStoreNative = require('expo-secure-store');
} catch (e) {
  SecureStoreNative = null;
}

const isWeb = Platform.OS === 'web';

export async function setItem(key, value) {
  if (!isWeb && SecureStoreNative && SecureStoreNative.setItemAsync) {
    return SecureStoreNative.setItemAsync(key, value, { keychainAccessible: 'WHEN_UNLOCKED' });
  }
  return AsyncStorage.setItem(key, value);
}

export async function getItem(key) {
  if (!isWeb && SecureStoreNative && SecureStoreNative.getItemAsync) {
    return SecureStoreNative.getItemAsync(key);
  }
  return AsyncStorage.getItem(key);
}

export async function deleteItem(key) {
  if (!isWeb && SecureStoreNative && SecureStoreNative.deleteItemAsync) {
    return SecureStoreNative.deleteItemAsync(key);
  }
  return AsyncStorage.removeItem(key);
}

export default { setItem, getItem, deleteItem };
