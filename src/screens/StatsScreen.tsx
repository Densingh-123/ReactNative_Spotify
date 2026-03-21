import React, { useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from '../context/ThemeContext';
import { useStats } from '../hooks/useStats';
import { useRecentlyPlayed } from '../hooks/useRecentlyPlayed';
import LinearGradient from 'react-native-linear-gradient';

export default function StatsScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { stats, loading } = useStats();
  const { recentlyPlayed } = useRecentlyPlayed(10);

  const chartData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const aggregated = [0,0,0,0,0,0,0];

    stats.forEach(s => {
      const date = new Date(s.date);
      const dayIdx = date.getDay();
      aggregated[dayIdx] += s.secondsListened;
    });

    const maxValue = Math.max(1, ...aggregated.map(s => s / 3600));

    return days.map((day, idx) => ({
      subject: day,
      value: Number((aggregated[idx] / 3600).toFixed(2)),
      percentage: Math.min(100, (Number((aggregated[idx] / 3600)) / maxValue) * 100)
    }));
  }, [stats]);

  const genreData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    stats.forEach(s => {
      if (s.artists) {
        Object.entries(s.artists).forEach(([name, secs]) => {
          counts[name] = (counts[name] || 0) + secs;
        });
      }
    });

    const data = Object.entries(counts)
      .map(([name, value]) => ({ name, value: Number((value / 3600).toFixed(2)) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    const maxValue = Math.max(1, ...data.map(d => d.value));

    return data.map(d => ({
       ...d,
       percentage: (d.value / maxValue) * 100
    }));
  }, [stats]);

  const totalSeconds = stats.reduce((acc, curr) => acc + (curr.secondsListened || 0), 0);
  const totalHours = totalSeconds / 3600;
  
  const displayTime = useMemo(() => {
    if (totalSeconds < 60) return `${totalSeconds} SECS`;
    if (totalSeconds < 3600) return `${Math.floor(totalSeconds / 60)} MINS`;
    return `${totalHours.toFixed(1)} HRS`;
  }, [totalSeconds]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.surface, colors.surfaceHighlight]} start={{x:0, y:0}} end={{x:1, y:0}} style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={26} color={colors.text} />
        </TouchableOpacity>
        <Icon name="stats-chart" size={24} color={colors.primary} />
        <Text style={[styles.title, { color: colors.text }]}>Listening Stats</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : stats.length === 0 || totalSeconds === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 64, opacity: 0.4 }}>🕸️</Text>
            <Text style={{ color: colors.textSecondary, fontSize: 16 }}>No metrics collected yet</Text>
          </View>
        ) : (
          <View style={{ paddingBottom: 60 }}>
            {/* Hero Stats */}
            <LinearGradient
              colors={[colors.primary, colors.primary + '99']}
              start={{x:0, y:0}} end={{x:1, y:1}}
              style={styles.heroCard}
            >
              <View style={styles.heroBgIcon}>
                <Icon name="stats-chart" size={120} color="rgba(255,255,255,0.1)" />
              </View>
              <Text style={styles.heroPretitle}>TOTAL LISTENING TIME</Text>
              <Text style={styles.heroValue}>{displayTime}</Text>
              <Text style={styles.heroSubtitle}>Across all sessions</Text>
            </LinearGradient>

            <View style={styles.chartsContainer}>
              {/* Fake Usage Bar Chart (replacing Radar) */}
              <View style={[styles.chartCard, { backgroundColor: colors.surfaceHighlight, borderColor: 'rgba(255,255,255,0.05)' }]}>
                <View style={styles.chartHeaderRow}>
                  <Icon name="musical-notes" color={colors.primary} size={20} />
                  <Text style={[styles.chartTitle, { color: colors.text }]}>Usage Activity</Text>
                </View>
                <View style={styles.chartArea}>
                  {chartData.map((d, i) => (
                    <View key={i} style={styles.barCol}>
                      <View style={[styles.barWrapper, { backgroundColor: 'rgba(255,255,255,0.05)' }]}>
                        <View style={[styles.barFill, { height: `${d.percentage}%`, backgroundColor: colors.primary }]} />
                      </View>
                      <Text style={[styles.barLabel, { color: colors.textSecondary }]}>{d.subject.slice(0, 1)}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Horizontal Bar Chart for Artists */}
              <View style={[styles.chartCard, { backgroundColor: colors.surfaceHighlight, borderColor: 'rgba(255,255,255,0.05)' }]}>
                <View style={styles.chartHeaderRow}>
                  <Icon name="person" color={colors.primary} size={20} />
                  <Text style={[styles.chartTitle, { color: colors.text }]}>Top Artists</Text>
                </View>
                <View style={[styles.horizontalChartArea, { marginTop: 16 }]}>
                  {genreData.map((d, i) => (
                     <View key={i} style={{ marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                          <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }} numberOfLines={1}>{d.name}</Text>
                          <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{d.value}h</Text>
                        </View>
                        <View style={{ height: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8, overflow: 'hidden' }}>
                           <View style={{ 
                             height: '100%', 
                             width: `${d.percentage}%`, 
                             backgroundColor: colors.primary,
                             opacity: Math.max(0.4, 1 - (i * 0.15))
                           }} />
                        </View>
                     </View>
                  ))}
                  {genreData.length === 0 && <Text style={{ color: colors.textSecondary }}>No artist data found.</Text>}
                </View>
              </View>
            </View>

            {/* History List */}
            <View style={{ marginTop: 24 }}>
              <View style={styles.historyHeader}>
                <View style={styles.chartHeaderRow}>
                  <Icon name="time" color={colors.primary} size={20} />
                  <Text style={[styles.chartTitle, { color: colors.text }]}>Just Heard</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Library' })}>
                  <Text style={{ fontSize: 13, color: colors.primary, fontWeight: '600' }}>View Log</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.historyList}>
                {recentlyPlayed.map((song, i) => (
                  <View key={`${song.id}-${i}`} style={[styles.historyCard, { backgroundColor: colors.surfaceHighlight }]}>
                    <Image source={{ uri: song.artworkUrl }} style={styles.historyArt} />
                    <View style={styles.historyInfo}>
                      <Text style={[styles.historyTitle, { color: colors.text }]} numberOfLines={1}>{song.title}</Text>
                      <Text style={[styles.historyArtist, { color: colors.textSecondary }]}>{song.artist}</Text>
                    </View>
                    <Text style={{ fontSize: 11, color: colors.textSecondary, opacity: 0.6 }}>
                      {i === 0 ? 'Just now' : `${i + 1} tracks ago`}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
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
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backBtn: { padding: 4, marginRight: 12 },
  title: { fontSize: 22, fontWeight: '900', marginLeft: 8 },
  scrollContent: { padding: 20 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  heroCard: {
    padding: 32, borderRadius: 28, alignItems: 'center',
    elevation: 8, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20,
    overflow: 'hidden', marginBottom: 24, paddingVertical: 40
  },
  heroBgIcon: { position: 'absolute', top: -20, right: -20 },
  heroPretitle: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 2, opacity: 0.9 },
  heroValue: { color: '#fff', fontSize: 60, fontWeight: '900', marginVertical: 12 },
  heroSubtitle: { color: '#fff', fontSize: 14, opacity: 0.8 },
  chartsContainer: { gap: 24 },
  chartCard: { padding: 24, borderRadius: 24, borderWidth: 1 },
  chartHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  chartTitle: { fontSize: 18, fontWeight: '800' },
  chartArea: { height: 180, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 20, paddingHorizontal: 10 },
  barCol: { alignItems: 'center', width: '10%' },
  barWrapper: { height: 140, width: '100%', borderRadius: 8, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 8 },
  barLabel: { marginTop: 10, fontSize: 12, fontWeight: '600' },
  horizontalChartArea: { minHeight: 180 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  historyList: { gap: 10 },
  historyCard: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16 },
  historyArt: { width: 44, height: 44, borderRadius: 10 },
  historyInfo: { flex: 1, marginHorizontal: 12 },
  historyTitle: { fontWeight: '700', fontSize: 14, marginBottom: 2 },
  historyArtist: { fontSize: 12 }
});
