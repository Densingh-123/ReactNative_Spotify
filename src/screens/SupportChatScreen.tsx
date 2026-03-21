import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';

interface Message { id: string; text: string; isUser: boolean; }

const KB: Record<string, string> = {
  play: "Tap any song card to start playing. The mini-player will appear at the bottom so you can control playback from any screen.",
  search: "Go to the Search tab and type your query. Results appear as you type with a short delay to save data.",
  playlist: "Go to Library → tap the + button → give your playlist a name. Then tap 'Add to Playlist' on any song.",
  like: "Tap the ❤️ button on any song or in the Player screen. All liked songs are in Library → Liked Songs.",
  theme: "Go to Settings → Themes. There are 40 beautiful themes — dark and light!",
  download: "On any song, tap the ⋯ menu and choose 'Download Song'. This opens the stream in a new tab to save.",
  lyrics: "Lyrics are shown automatically in the Player screen. Synchronized lyrics scroll with the music.",
  repeat: "In the Player, tap the repeat button to cycle: Off → Repeat One → Repeat All.",
  login: "Tap the Login button or go to Settings. Use email/password or Google to sign in.",
  register: "Go to Login → Register. Enter your name, email, and password to create an account.",
  recently: "Melodify remembers what you listen to. View your history in Settings → Recently Played.",
  help: "I can help with: playing music, searching, playlists, likes, themes, downloads, lyrics, login, and more!",
  hello: "Hi there! 👋 I'm Melodify AI. How can I help you today?",
  hi: "Hello! I'm the Melodify support assistant. Ask me anything about the app!",
};

const getResponse = (input: string): string => {
  const text = input.toLowerCase();
  for (const [key, answer] of Object.entries(KB)) {
    if (text.includes(key)) return answer;
  }
  return "I'm here to help with Melodify! Try asking about playing music, playlists, themes, lyrics, or login.";
};

export default function SupportChatScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const [messages, setMessages] = useState<Message[]>([
    { id: '0', text: "Hi! I'm the Melodify AI assistant 🎵 Ask me anything about the app!", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg: Message = { id: Date.now().toString(), text, isUser: true };
    const botMsg: Message = { id: (Date.now() + 1).toString(), text: getResponse(text), isUser: false };
    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { borderBottomColor: 'rgba(255,255,255,0.05)' }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Icon name="chatbubbles" size={26} color={colors.primary} />
        <View style={styles.headerInfo}>
          <Text style={[styles.title, { color: colors.text }]}>Melodify AI Support</Text>
          <Text style={styles.status}>● Online</Text>
        </View>
      </View>

      <ScrollView 
        ref={scrollRef} 
        style={styles.chatArea} 
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map(msg => (
          <View key={msg.id} style={[styles.messageRow, { justifyContent: msg.isUser ? 'flex-end' : 'flex-start' }]}>
            {!msg.isUser && (
              <View style={[styles.botAvatar, { backgroundColor: colors.primary + '22' }]}>
                <Text style={{ fontSize: 16 }}>🎵</Text>
              </View>
            )}
            <View style={[
              styles.bubble, 
              { 
                backgroundColor: msg.isUser ? colors.primary : colors.surface,
                borderWidth: msg.isUser ? 0 : 1,
                borderColor: msg.isUser ? 'transparent' : 'rgba(255,255,255,0.05)',
                borderBottomRightRadius: msg.isUser ? 4 : 18,
                borderBottomLeftRadius: msg.isUser ? 18 : 4
              }
            ]}>
              <Text style={[styles.bubbleText, { color: msg.isUser ? '#fff' : colors.text }]}>
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.inputRow, { borderTopColor: 'rgba(255,255,255,0.05)' }]}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.surface, borderColor: 'rgba(255,255,255,0.1)', color: colors.text }]}
          placeholder="Ask me anything..."
          placeholderTextColor={colors.textSecondary}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={send}
          returnKeyType="send"
        />
        <TouchableOpacity 
          style={[styles.sendBtn, { backgroundColor: input.trim() ? colors.primary : colors.surface }]}
          onPress={send}
          activeOpacity={0.8}
        >
          <Icon name="send" size={20} color={input.trim() ? '#fff' : colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'transparent' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4, marginRight: 10 },
  headerInfo: { marginLeft: 10 },
  title: { fontWeight: '800', fontSize: 16 },
  status: { fontSize: 12, color: '#00e676', fontWeight: '600', marginTop: 2 },
  chatArea: { flex: 1 },
  chatContent: { padding: 16, paddingBottom: 24, paddingTop: 24 },
  messageRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  botAvatar: {
    width: 32, height: 32, borderRadius: 10,
    justifyContent: 'center', alignItems: 'center',
    marginRight: 8,
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 18,
  },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    paddingHorizontal: 20,
    fontSize: 15,
  },
  sendBtn: {
    width: 52, height: 52, borderRadius: 26,
    justifyContent: 'center', alignItems: 'center',
    marginLeft: 10,
  }
});
