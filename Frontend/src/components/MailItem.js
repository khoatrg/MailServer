import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';

export default function MailItem({item, onPress}) {
  return (
    <TouchableOpacity onPress={onPress} style={{padding:10, borderBottomWidth:1, borderColor:'#ddd'}}>
      <Text style={{fontWeight:'bold'}}>{item.subject}</Text>
      <Text numberOfLines={1}>{item.from} - {(item.preview) || (item.body && item.body.slice(0,80))}</Text>
    </TouchableOpacity>
  );
}
