import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID_HERE.apps.googleusercontent.com', // TODO: Add your Firebase Web Client ID here
});
import GlassCard from '../components/ui/GlassCard';
import { useTheme } from '../context/ThemeContext';
import LinearGradient from 'react-native-linear-gradient';

export default function LoginScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // navigation.reset is handled automatically by MainNavigator when user state changes
    } catch (err: any) { 
      setError(err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleGoogle = async () => {
    try {
      setLoading(true);
      setError('');
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;
      
      if (!idToken) throw new Error('No ID token found from Google Sign-In');
      
      const googleCredential = GoogleAuthProvider.credential(idToken);
      await signInWithCredential(auth, googleCredential);
    } catch (err: any) {
      if (err.code === 'SIGN_IN_CANCELLED') {
        // user cancelled, no error needed
      } else if (err.code === 'IN_PROGRESS') {
        setError('Sign-in is in progress...');
      } else if (err.code === 'PLAY_SERVICES_NOT_AVAILABLE') {
        Alert.alert('Error', 'Play Services not available or outdated');
      } else {
        Alert.alert('Google Auth Not Configured', `To fix DEVELOPER_ERROR:\n1. Open android/app/google-services.json\n2. Find client_id where "client_type": 3\n3. Paste it into LoginScreen.tsx line 10.\n\nFor now, please use Email/Password to login!`);
      }
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
              <Icon name="musical-notes" size={38} color="#fff" />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Login to continue your musical journey</Text>
          </View>

          <View style={styles.form}>
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
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Login</Text>}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
              <Text style={[styles.dividerText, { color: colors.textSecondary }]}>OR</Text>
              <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.1)' }]} />
            </View>

            <TouchableOpacity 
              style={[styles.btnGhost, { borderColor: 'rgba(255,255,255,0.1)' }]}
              onPress={handleGoogle}
            >
              <Icon name="logo-google" size={20} color={colors.text} />
              <Text style={[styles.btnGhostText, { color: colors.text }]}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ alignItems: 'center', marginTop: 12 }}>
              <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                Don't have an account? <Text style={{ color: colors.primary, fontWeight: '700' }}>Register</Text>
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
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 14 },
  divider: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 12, fontSize: 12, fontWeight: '700' },
  btnGhost: { height: 50, borderRadius: 14, borderWidth: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 14 },
  btnGhostText: { fontSize: 16, fontWeight: '600', marginLeft: 10 }
});
