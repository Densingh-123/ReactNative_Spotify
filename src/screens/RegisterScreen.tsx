import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import GlassCard from '../components/ui/GlassCard';
import { useTheme } from '../context/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';

export default function RegisterScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await setDoc(doc(db, 'users', cred.user.uid), { name, email, createdAt: new Date().toISOString() });
      // navigation.reset is handled automatically by MainNavigator
    } catch (err: any) {
      setError(err.code === 'auth/email-already-in-use' ? 'Email already registered. Please login instead.' : err.message);
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#1a1025', '#0f0f16']} style={StyleSheet.absoluteFillObject} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <GlassCard style={styles.card}>
          <View style={styles.header}>
            <View style={[styles.iconBox, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
              <Icon name="person-add" size={38} color="#fff" />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Join Melodify and explore a world of music</Text>
          </View>

          <View style={styles.form}>
            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: 'rgba(255,255,255,0.1)' }]}>
              <Icon name="person" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Full Name"
                placeholderTextColor={colors.textSecondary}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: 'rgba(255,255,255,0.1)' }]}>
              <Icon name="mail" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Email Address"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
            
            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: 'rgba(255,255,255,0.1)' }]}>
              <Icon name="lock-closed" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <TouchableOpacity 
              style={[styles.btnPrimary, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Create Account</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ alignItems: 'center', marginTop: 12 }}>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                Already have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Login</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </GlassCard>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1, justifyContent: 'center', padding: 20 },
  card: { padding: 36, borderRadius: 28, width: '100%', maxWidth: 420, alignSelf: 'center' },
  header: { alignItems: 'center', marginBottom: 32 },
  iconBox: {
    width: 72, height: 72, borderRadius: 22, justifyContent: 'center', alignItems: 'center',
    marginBottom: 20, elevation: 8, shadowOffset: {width: 0, height: 8}, shadowOpacity: 0.5, shadowRadius: 24
  },
  title: { fontSize: 26, fontWeight: '800', marginBottom: 6 },
  subtitle: { fontSize: 14 },
  form: { width: '100%' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, height: 50, marginBottom: 14 },
  input: { flex: 1, marginLeft: 10, fontSize: 15 },
  errorText: { color: '#ff4444', fontSize: 13, textAlign: 'center', marginBottom: 14 },
  btnPrimary: { height: 50, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
