import CryptoJS from 'crypto-js';
import { ENV } from './firebaseConfig';

export const decodeSaavnUrl = (input: string): string => {
  if (!input) return '';
  try {
    const key = CryptoJS.enc.Utf8.parse(ENV.VITE_SAAVN_DES_KEY || '38346591');
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
}

const CORS_PROXY = ENV.VITE_CORS_PROXY || 'https://api.codetabs.com/v1/proxy/?quest=';
const PIPED_API_BASE = ENV.VITE_PIPED_API_BASE || 'https://pipedapi.kavin.rocks';
const SAAVN_API_BASE = ENV.VITE_SAAVN_API_BASE || 'https://www.jiosaavn.com/api.php';
const LRCLIB_API_BASE = ENV.VITE_LRCLIB_API_BASE || 'https://lrclib.net/api';

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

const mapTrack = (track: any): SongItem => ({
  id: track.id,
  title: unescapeHtml(track.title || track.song),
  artist: unescapeHtml(track.more_info?.music || track.subtitle || track.primary_artists || 'Unknown Artist'),
  artworkUrl: getHighResImage(track.image),
  streamUrl: decodeSaavnUrl(track.more_info?.encrypted_media_url || track.encrypted_media_url || ''),
  previewUrl: track.more_info?.preview_url || track.media_preview_url || '',
});

const saavnFetch = async (url: string) => {
  const res = await fetchViaProxy(url);
  if (!res.ok) throw new Error('Saavn fetch failed');
  const data = await res.json();
  let results = data.results || [];
  if (typeof results === 'object' && !Array.isArray(results)) results = Object.values(results);
  return results;
};

export const fetchTrending = async (languages: string[] = ['Tamil', 'English']): Promise<SongItem[]> => {
  try {
    const langs = languages.length > 0 ? languages : ['Tamil'];
    const allResults: SongItem[] = [];
    const keywords = ['hits', 'melody', 'new', 'trending', 'party', 'love', 'dance', 'top'];
    
    // Fetch for each language to ensure variety
    for (const lang of langs.slice(0, 5)) { // Limit to 5 langs to avoid too many requests
      const randomKeyword = keywords[Math.floor(Math.random() * keywords.length)];
      const queryStr = `${lang.toLowerCase()} ${randomKeyword}`;
      const url = `${SAAVN_API_BASE}?p=1&q=${encodeURIComponent(queryStr)}&_format=json&_marker=0&ctx=wap6dot0&n=50&__call=search.getResults`;
      try {
        const results = await saavnFetch(url);
        allResults.push(...results.map(mapTrack));
      } catch (e) {
        console.warn(`Failed to fetch trending for ${lang}`, e);
      }
    }

    // Shuffle and deduplicate
    const uniqueResults = Array.from(new Map(allResults.map(s => [s.id, s])).values());
    const shuffled = uniqueResults.sort(() => Math.random() - 0.5);
    
    return shuffled.slice(0, 100); // Return up to 100 songs for deep feed
  } catch (error) {
    console.error('Error fetching trending:', error);
    return [];
  }
};

export const searchMusic = async (query: string, offset = 0, languages?: string[]): Promise<SongItem[]> => {
  if (!query) return [];
  try {
    const langs = languages && languages.length > 0 ? languages : [];
    
    if (langs.length > 1) {
      // Fetch a few from each language
      const all: SongItem[] = [];
      const numToFetch = Math.max(1, Math.floor(50 / langs.length));
      
      for (const lang of langs.slice(0, 3)) { // Max 3 for performance
        const q = `${lang} ${query}`;
        const url = `${SAAVN_API_BASE}?p=1&q=${encodeURIComponent(q)}&_format=json&_marker=0&ctx=wap6dot0&n=${numToFetch}&__call=search.getResults`;
        try {
          const res = await saavnFetch(url);
          all.push(...res.map(mapTrack));
        } catch (e) {
          console.error(e);
        }
      }
      
      // Fill up with general search if needed
      if (all.length < 20) {
          const res = await saavnFetch(`${SAAVN_API_BASE}?p=1&q=${encodeURIComponent(query)}&_format=json&_marker=0&ctx=wap6dot0&n=30&__call=search.getResults`);
          all.push(...res.map(mapTrack));
      }
      
      return all.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i).slice(0, 50);
    } else {
      let finalQuery = query;
      if (langs.length === 1) {
        finalQuery = `${langs[0]} ${query}`;
      }
      const encodedQuery = encodeURIComponent(finalQuery);
      const page = Math.floor(offset / 50) + 1;
      const url = `${SAAVN_API_BASE}?p=${page}&q=${encodedQuery}&_format=json&_marker=0&ctx=wap6dot0&n=50&__call=search.getResults`;
      const results = await saavnFetch(url);
      return results.map(mapTrack);
    }
  } catch (error) {
    console.error('Error searching music:', error);
    return [];
  }
};

export const searchMusicDeep = async (query: string, limit = 100, languages?: string[]): Promise<SongItem[]> => {
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
          if (res.length < 10) break; // End of results for this query
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

    // 3. Fallback to trending to guarantee limit
    if (results.length < limit) {
      const filler = await fetchTrending(langs);
      results.push(...filler);
    }
    
    const unique = Array.from(new Map(results.map(s => [s.id, s])).values());
    return unique.slice(0, limit);
  } catch (error) {
    console.error('Error in searchMusicDeep:', error);
    return [];
  }
};

export const searchSongs = async (query: string, limit = 50, languages?: string[]): Promise<SongItem[]> => {
  return searchMusic(query, 0, languages);
};

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
    const lang = languages[0] || 'Tamil';
    const query = encodeURIComponent(`${lang} instrumental hits`);
    const url = `${SAAVN_API_BASE}?p=1&q=${query}&_format=json&_marker=0&ctx=wap6dot0&n=40&__call=search.getResults`;
    const results = await saavnFetch(url);
    // Filter for things that likely have previews or sound like ringtones
    return results.map(mapTrack).filter((s: SongItem) => s.previewUrl || s.title.toLowerCase().includes('tone'));
  } catch (error) {
    console.error('Error fetching trending ringtones:', error);
    return [];
  }
};

export const getRecommendedSongs = async (track: SongItem, languages?: string[], limit = 100): Promise<SongItem[]> => {
  try {
    const query = track.album || track.artist;
    // Use searchMusicDeep to get up to 'limit' songs related to the track's album or artist
    const results = await searchMusicDeep(query, limit + 1, languages);
    
    // Fallback 1: Artist Hits
    if (results.length < limit / 2) {
       const fallbackQuery = `${track.artist} hits`;
       const fallbackResults = await searchMusicDeep(fallbackQuery, limit - results.length, languages);
       results.push(...fallbackResults);
    }
    
    // Fallback 2: General Trending to guarantee 100 songs
    if (results.length < limit) {
       const trendingFiller = await fetchTrending(languages);
       results.push(...trendingFiller);
    }
    
    const unique = Array.from(new Map(results.map(s => [s.id, s])).values());
    return unique.filter(s => s.id !== track.id).slice(0, limit);
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
