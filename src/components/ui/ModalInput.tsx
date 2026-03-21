import React, { useState } from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';

interface Props {
  visible: boolean;
  title: string;
  placeholder: string;
  onConfirm: (val: string) => void;
  onCancel: () => void;
}

export default function ModalInput({ visible, title, placeholder, onConfirm, onCancel }: Props) {
  const { colors } = useTheme();
  const [value, setValue] = useState('');

  return (
    <Modal visible={visible} transparent animationType="fade">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity style={StyleSheet.absoluteFill} onPress={onCancel} />
        
        <View style={[styles.content, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: 'rgba(255,255,255,0.05)' }]}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            value={value}
            onChangeText={setValue}
            autoFocus
          />
          
          <View style={styles.actions}>
            <TouchableOpacity onPress={onCancel} style={styles.btn}>
              <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              onPress={() => { if(value.trim()) onConfirm(value.trim()); }}
              disabled={!value.trim()}
            >
              <LinearGradient colors={[colors.primary, colors.accent]} style={styles.confirmBtn}>
                <Text style={styles.confirmText}>Confirm</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  content: { width: '100%', maxWidth: 400, padding: 24, borderRadius: 24, borderWidth: 1 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 20, textAlign: 'center' },
  input: { height: 56, borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, fontSize: 16, marginBottom: 24 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 16 },
  btn: { padding: 12 },
  confirmBtn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 12 },
  confirmText: { color: '#fff', fontWeight: '800' }
});
