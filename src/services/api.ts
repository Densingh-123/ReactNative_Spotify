import CryptoJS from 'crypto-js';

export const decodeSaavnUrl = (input: string): string => {
  if (!input) return '';
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(input) } as any,
      key,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
    );
    let decoded = decrypted.toString(CryptoJS.enc.Utf8);
    decoded = decoded.replace(/\.mp4.*/, '.mp4').replace(/\.m4a.*/, '.m4a');
    return decoded.replace('http:', 'https:');
  } catch (e) {
    console.warn('Failed to decode Saavn URL', e);
    return '';
  }
};

export interface LyricLine { time: number; text: string; }
export interface LyricsData { plain: string; synced: LyricLine[]; }

export interface SongItem {
  id: string;
  title: string;
  artist: string;
  artworkUrl: string;
  album?: string;
  streamUrl?: string;
  fullStreamUrl?: string;
  previewUrl?: string;
  duration?: number; // in seconds
}

const CORS_PROXY = 'https://api.codetabs.com/v1/proxy/?quest=';
const PIPED_API_BASE = 'https://pipedapi.kavin.rocks';
const SAAVN_API_BASE = 'https://www.jiosaavn.com/api.php';
const LRCLIB_API_BASE = 'https://lrclib.net/api';

const fetchViaProxy = (url: string) =>
  fetch(`${CORS_PROXY}${encodeURIComponent(url)}`);

export const getProxiedUrl = (url: string) => {
  if (!url) return '';
  if (url.includes('api.codetabs.com') || url.includes('corsproxy.io')) return url;
  return `${CORS_PROXY}${encodeURIComponent(url)}`;
};

/**
 * Unified helper to get a playable audio URL with automatic fallback
 */
export const getPlayableAudioUrl = async (song: SongItem): Promise<string | null> => {
  // Try 1: Saavn Preview URL (Proxied) - Best for Ringtones
  if (song.previewUrl) {
    const proxied = getProxiedUrl(song.previewUrl);
    try {
      const res = await fetch(proxied, { method: 'HEAD' });
      if (res.ok && res.headers.get('content-length') !== '0') return proxied;
    } catch {}
  }

  // Try 2: Saavn Full Stream (if decoded)
  if (song.streamUrl && song.streamUrl.length > 20 && !song.streamUrl.includes('dummy')) {
    return getProxiedUrl(song.streamUrl);
  }

  // Try 3: YouTube/Piped Stream via ID
  const stream = await getStreamUrl(song.id).catch(() => null);
  if (stream) return stream;

  // Try 4: Search YouTube by Title/Artist
  return await getFullStreamUrl(song.title, song.artist);
};

export const getStreamUrl = async (videoId: string): Promise<string | null> => {
  try {
    const pDataRes = await fetchViaProxy(`${PIPED_API_BASE}/streams/${videoId}`);
    if (!pDataRes.ok) return null;
    const pData = await pDataRes.json();
    const audioStreams = pData.audioStreams || [];
    const bestAudio = audioStreams.find((s: any) =>
      s.mimeType && (s.mimeType.includes('mp4') || s.mimeType.includes('m4a'))
    ) || audioStreams[0];
    return bestAudio?.url || null;
  } catch (e) {
    console.error('Failed to fetch stream URL', e);
    return null;
  }
};

export const getFullStreamUrl = async (title: string, artist: string): Promise<string | null> => {
  try {
    const query = encodeURIComponent(`${title} ${artist} audio`);
    const res = await fetchViaProxy(`${PIPED_API_BASE}/search?q=${query}&filter=music_songs`);
    if (!res.ok) return null;
    const data = await res.json();
    const topResult = data?.items?.[0];
    const videoId = topResult?.url?.split('v=')?.[1] || topResult?.url?.split('/')?.pop();
    if (!videoId) return null;
    return await getStreamUrl(videoId);
  } catch {
    return null;
  }
};

export const getYoutubeId = async (title: string, artist: string): Promise<string | null> => {
  try {
    const query = encodeURIComponent(`${title} ${artist}`);
    const res = await fetchViaProxy(`${PIPED_API_BASE}/search?q=${query}&filter=videos`);
    if (!res.ok) return null;
    const data = await res.json();
    const topResult = data?.items?.[0];
    return topResult?.url?.split('v=')?.[1] || topResult?.url?.split('/')?.pop() || null;
  } catch {
    return null;
  }
};

const unescapeHtml = (safe: string) => {
  if (!safe) return '';
  return safe.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&apos;/g, "'");
};

const getHighResImage = (url: string) => {
  if (!url) return '';
  return url.replace('50x50', '500x500').replace('150x150', '500x500').replace('http:', 'https:');
};

const parseDuration = (raw: string | number | undefined): number => {
  if (!raw) return 0;
  if (typeof raw === 'number') return raw;
  const parts = String(raw).split(':');
  if (parts.length === 2) return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  return parseInt(raw) || 0;
};

const mapTrack = (track: any): SongItem => ({
  id: track.id,
  title: unescapeHtml(track.title || track.song),
  artist: unescapeHtml(track.more_info?.music || track.subtitle || track.primary_artists || 'Unknown Artist'),
  artworkUrl: getHighResImage(track.image),
  album: unescapeHtml(track.more_info?.album || track.album || ''),
  streamUrl: decodeSaavnUrl(track.more_info?.encrypted_media_url || track.encrypted_media_url || ''),
  previewUrl: track.more_info?.preview_url || track.media_preview_url || '',
  duration: parseDuration(track.more_info?.duration || track.duration),
});

// Full songs: >= 3 minutes (180 seconds). Shorter songs are ringtone-suitable.
const isFullSong = (s: SongItem) => !s.duration || s.duration >= 180;
const isRingtoneSong = (s: SongItem) => s.duration && s.duration > 0 && s.duration < 180;

const saavnFetch = async (url: string) => {
  const res = await fetchViaProxy(url);
  if (!res.ok) throw new Error('Saavn fetch failed');
  const data = await res.json();
  let results = data.results || [];
  if (typeof results === 'object' && !Array.isArray(results)) results = Object.values(results);
  return results;
};

export const fetchTrending = async (languages: string[] = ['Tamil', 'English'], fullSongsOnly = true): Promise<SongItem[]> => {
  try {
    const langs = languages.length > 0 ? languages : ['Tamil'];
    const allResults: SongItem[] = [];
    const keywordSets = [
      ['hits', 'top songs', 'new releases'],
      ['love songs', 'romantic', 'melody'],
      ['dance', 'party', 'energetic'],
      ['trending', 'viral', 'popular'],
      ['old hits', 'classic', 'evergreen'],
    ];
    
    const flatKeywords = keywordSets.flat().sort(() => Math.random() - 0.5);
    const fetchPromises: Promise<SongItem[]>[] = [];
    
    for (const lang of langs) {
      for (const keyword of flatKeywords.slice(0, 8)) {
        const queryStr = `${lang.toLowerCase()} ${keyword}`;
        const url = `${SAAVN_API_BASE}?p=1&q=${encodeURIComponent(queryStr)}&_format=json&_marker=0&ctx=wap6dot0&n=50&__call=search.getResults`;
        fetchPromises.push(saavnFetch(url).then(res => res.map(mapTrack)));
      }
    }

    const settled = await Promise.allSettled(fetchPromises);
    for (const res of settled) {
      if (res.status === 'fulfilled') {
        const tracks = res.value;
        allResults.push(...(fullSongsOnly ? tracks.filter(isFullSong) : tracks));
      }
    }

    // Deduplicate mapping by ID
    const unique = Array.from(new Map(allResults.map(s => [s.id, s])).values());
    const shuffled = unique.sort(() => Math.random() - 0.5);
    
    return shuffled.slice(0, 250);
  } catch (error) {
    console.error('Error fetching trending:', error);
    return [];
  }
};

export const fetchMoodSongs = async (mood: string, languages: string[] = ['Tamil', 'English']): Promise<SongItem[]> => {
  const moodQueryMap: Record<string, string[]> = {
    Podcasts: ['podcast talk', 'motivational speech', 'interview', 'story', 'talk show'],
    Romance: ['love songs', 'romantic', 'melody', 'heartbreak', 'romantic hits', 'love mashup'],
    Relax: ['lofi chill', 'calm instrumental', 'ambient', 'soothing', 'peaceful', 'relaxing'],
    'Feel good': ['happy songs', 'upbeat feel good', 'positive vibes', 'cheerful', 'joy', 'feel good hits'],
    Energise: ['energy boost', 'workout power', 'hype songs', 'energetic', 'fast beat', 'high energy'],
    Commute: ['road trip songs', 'commute playlist', 'driving', 'travel', 'journey', 'car songs'],
    Party: ['party hits', 'dance songs', 'club mix', 'dj remix', 'celebration', 'dance hits'],
    'Work out': ['gym workout', 'fitness motivation', 'pump up', 'gym motivation', 'workout energetic', 'gym hits'],
    Sad: ['sad songs', 'emotional', 'heartbreak', 'crying', 'painful', 'sad hits'],
    Focus: ['study music', 'concentration focus', 'deep work', 'focus instrumental', 'study background'],
    Sleep: ['sleep music', 'lullaby soothing', 'night relax', 'deep sleep', 'calm sleep', 'bedtime'],
  };
  
  const queries = moodQueryMap[mood] || [mood.toLowerCase()];
  const allResults: SongItem[] = [];
  
  // Strictly respect the user's preferred languages without appending unauthorized fallbacks
  const safeLangs = languages && languages.length > 0 ? languages : ['Tamil'];
  const fetchPromises: Promise<SongItem[]>[] = [];
  
  for (const lang of safeLangs) {
    // Collect ~250 songs concurrently
    for (const q of queries.slice(0, 10)) {
      const url = `${SAAVN_API_BASE}?p=1&q=${encodeURIComponent(`${lang} ${q}`)}&_format=json&_marker=0&ctx=wap6dot0&n=50&__call=search.getResults`;
      fetchPromises.push(saavnFetch(url).then(res => res.map(mapTrack).filter(isFullSong)));
    }
  }

  const settled = await Promise.allSettled(fetchPromises);
  for (const res of settled) {
    if (res.status === 'fulfilled') {
      allResults.push(...res.value);
    }
  }

  // Final array unique by ID to prevent repeated tracks
  const unique = Array.from(new Map(allResults.map(s => [s.id, s])).values());
  
  // If we collected more than 250, truncate. Otherwise shuffle the payload.
  return unique.sort(() => Math.random() - 0.5).slice(0, 250);
};

export const searchMusic = async (query: string, offset = 0, languages?: string[]): Promise<SongItem[]> => {
  if (!query) return [];
  try {
    const langs = languages && languages.length > 0 ? languages : [];
    const finalQuery = langs.length > 0 ? `${langs[0]} ${query}` : query;
    const encodedQuery = encodeURIComponent(finalQuery);
    const page = Math.floor(offset / 20) + 1;
    const url = `${SAAVN_API_BASE}?p=${page}&q=${encodedQuery}&_format=json&_marker=0&ctx=wap6dot0&n=20&__call=search.getResults`;
    const results = await saavnFetch(url);
    return results.map(mapTrack);
  } catch (error) {
    console.error('Error searching music:', error);
    return [];
  }
};

export const searchMusicDeep = async (query: string, limit = 100, languages?: string[], fullSongsOnly = true): Promise<SongItem[]> => {
  try {
    const results: SongItem[] = [];
    const langs = languages && languages.length > 0 ? languages : ['Tamil', 'English', 'Hindi'];
    
    // 1. Try each preferred language
    for (const lang of langs.slice(0, 3)) {
      const finalQuery = `${lang} ${query}`;
      const encodedQuery = encodeURIComponent(finalQuery);
      const pages = Math.ceil((limit - results.length) / 50);
      
      for (let page = 1; page <= pages; page++) {
        const url = `${SAAVN_API_BASE}?p=${page}&q=${encodedQuery}&_format=json&_marker=0&ctx=wap6dot0&n=50&__call=search.getResults`;
        try {
          const res = await saavnFetch(url);
          results.push(...res.map(mapTrack));
          if (res.length < 10) break;
        } catch { break; }
      }
      if (results.length >= limit) break;
    }
    
    // 2. Try general search if still low
    if (results.length < limit / 2) {
      const url = `${SAAVN_API_BASE}?p=1&q=${encodeURIComponent(query)}&_format=json&_marker=0&ctx=wap6dot0&n=50&__call=search.getResults`;
      try {
        const res = await saavnFetch(url);
        results.push(...res.map(mapTrack));
      } catch {}
    }

    // 3. Fallback to trending
    if (results.length < limit) {
      const filler = await fetchTrending(langs, fullSongsOnly);
      results.push(...filler);
    }
    
    let unique = Array.from(new Map(results.map(s => [s.id, s])).values());
    if (fullSongsOnly) unique = unique.filter(isFullSong);
    return unique.slice(0, limit);
  } catch (error) {
    console.error('Error in searchMusicDeep:', error);
    return [];
  }
};

export const searchSongs = searchMusic;

export const searchRingtones = async (query: string, languages: string[] = ['Tamil']): Promise<SongItem[]> => {
  try {
    // Search the query directly first - most Saavn songs have 30s previews anyway
    const url = `${SAAVN_API_BASE}?p=1&q=${encodeURIComponent(query)}&_format=json&_marker=0&ctx=wap6dot0&n=30&__call=search.getResults`;
    let results = await saavnFetch(url);
    
    // If no results, try appending ' ringtone' as a fallback
    if (results.length === 0) {
      const fallbackUrl = `${SAAVN_API_BASE}?p=1&q=${encodeURIComponent(query + ' ringtone')}&_format=json&_marker=0&ctx=wap6dot0&n=30&__call=search.getResults`;
      results = await saavnFetch(fallbackUrl);
    }

    return results.map(mapTrack);
  } catch (error) {
    console.error('Error searching ringtones:', error);
    return [];
  }
};

export const fetchTrendingRingtones = async (languages: string[] = ['Tamil']): Promise<SongItem[]> => {
  try {
    const allResults: SongItem[] = [];
    for (const lang of languages.slice(0, 3)) {
      const queries = [`${lang} short songs`, `${lang} ringtone`, `${lang} hits`];
      for (const q of queries) {
        const url = `${SAAVN_API_BASE}?p=1&q=${encodeURIComponent(q)}&_format=json&_marker=0&ctx=wap6dot0&n=20&__call=search.getResults`;
        try {
          const results = await saavnFetch(url);
          allResults.push(...results.map(mapTrack));
        } catch {}
      }
    }
    const unique = Array.from(new Map(allResults.map(s => [s.id, s])).values());
    // Prefer short songs for ringtones, but include all if few short ones found
    const shortSongs = unique.filter(isRingtoneSong);
    return shortSongs.length >= 10 ? shortSongs.slice(0, 50) : unique.slice(0, 50);
  } catch (error) {
    console.error('Error fetching trending ringtones:', error);
    return [];
  }
};

/**
 * Smart recommendation engine similar to YouTube Music:
 * Uses multiple signals: album, artist, genre keywords, and language preferences
 * Returns only full songs (>= 3 minutes), deduped and shuffled.
 */
export const getRecommendedSongs = async (
  track: SongItem,
  languages?: string[],
  limit = 100,
  listenedIds: string[] = []
): Promise<SongItem[]> => {
  try {
    const allResults: SongItem[] = [];
    const langs = languages && languages.length > 0 ? languages : ['Tamil', 'English'];
    
    // Signal 1: Same album
    if (track.album && track.album.length > 2) {
      const albumSongs = await searchMusicDeep(track.album, 40, langs);
      allResults.push(...albumSongs);
    }
    
    // Signal 2: Same artist
    const artistSongs = await searchMusicDeep(track.artist, 40, langs);
    allResults.push(...artistSongs);
    
    // Signal 3: Artist + hits (discover more)
    const artistHits = await searchMusicDeep(`${track.artist} hits`, 30, langs);
    allResults.push(...artistHits);
    
    // Signal 4: Fill with trending in user's preferred languages
    if (allResults.length < limit) {
      const trendingFiller = await fetchTrending(langs);
      allResults.push(...trendingFiller);
    }
    
    // Deduplicate, exclude current track and already-listened songs
    const excludedIds = new Set([track.id, ...listenedIds]);
    const unique = Array.from(new Map(allResults.map(s => [s.id, s])).values())
      .filter(s => !excludedIds.has(s.id))
      .filter(isFullSong);
    
    // Shuffle for variety (like YTM)
    const shuffled = unique.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
};

export const getLyrics = async (id: string, title?: string, artist?: string, album?: string, duration?: number): Promise<LyricsData> => {
  try {
    if (title && artist) {
      const lrcLibData = await getLyricsLRCLib(title, artist, album, duration);
      if (lrcLibData) return lrcLibData;
    }
    const ytId = (title && artist) ? await getYoutubeId(title, artist) : id;
    if (!ytId) return { plain: 'No lyrics available.', synced: [] };
    const res = await fetchViaProxy(`${PIPED_API_BASE}/lyrics/${ytId}`);
    if (!res.ok) return { plain: 'No lyrics available.', synced: [] };
    const data = await res.json();
    if (Array.isArray(data.lines)) {
      const synced = data.lines.map((line: any) => ({
        time: line.startTimeMs / 1000,
        text: line.words || line.content || ''
      }));
      return { plain: synced.map((l: any) => l.text).join('\n'), synced };
    }
    return { plain: 'No lyrics available.', synced: [] };
  } catch {
    return { plain: 'Error loading lyrics.', synced: [] };
  }
};

const getLyricsLRCLib = async (title: string, artist: string, album?: string, duration?: number): Promise<LyricsData | null> => {
  try {
    const params = new URLSearchParams({ track_name: title, artist_name: artist });
    if (album) params.append('album_name', album);
    if (duration) params.append('duration', Math.round(duration).toString());
    const response = await fetch(`${LRCLIB_API_BASE}/get?${params.toString()}`);
    if (response.status === 200) {
      const data = await response.json();
      return { plain: data.plainLyrics || '', synced: parseLRC(data.syncedLyrics || data.plainLyrics || '') };
    }
    return null;
  } catch {
    return null;
  }
};

const parseLRC = (lrc: string): LyricLine[] => {
  if (!lrc) return [];
  const lines = lrc.split('\n');
  const result: LyricLine[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
  lines.forEach(line => {
    const match = timeRegex.exec(line);
    if (match) {
      const time = parseInt(match[1]) * 60 + parseInt(match[2]) + parseInt(match[3]) / (match[3].length === 3 ? 1000 : 100);
      const text = line.replace(timeRegex, '').trim();
      if (text) result.push({ time, text });
    }
  });
  return result.sort((a, b) => a.time - b.time);
};
