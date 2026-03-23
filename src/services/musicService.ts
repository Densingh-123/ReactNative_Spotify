import TrackPlayer, { State as TPState, RepeatMode as TPRepeatMode, Event, Track, Capability, AppKilledPlaybackBehavior } from 'react-native-track-player';
import { SongItem, getFullStreamUrl, getRecommendedSongs } from './api';
import { db, auth } from './firebaseConfig';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { trackListeningTime } from '../hooks/useStats';
import { triggerSleepWarningNotification } from './notificationService';

export type PlayerState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

export interface PlayerTrack extends SongItem {
  resolvedUrl?: string;
}

type Listener = () => void;

class MusicPlayerServiceClass {
  // Mocking EQ bands since React Native Track Player doesn't have native 10-band EQ without custom audio engines
  public readonly eqBands = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
  private eqGains = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  private _queue: PlayerTrack[] = [];
  private _originalQueue: PlayerTrack[] = [];
  private _currentIndex = 0;
  private _state: PlayerState = 'idle';
  private _position = 0;
  private _duration = 0;
  private _listeners: Listener[] = [];
  private _repeatMode: 'off' | 'track' | 'queue' = 'off';
  private _isShuffled = false;
  private _sleepTimer: any = null;
  private _sleepTimerWarning: any = null;
  private _sleepTimerEnd: number | null = null;
  private _isPlayerReady = false;
  private _userLanguages: string[] = ['Tamil'];

  setUserLanguages(langs: string[]) {
    if (langs && langs.length > 0) {
      this._userLanguages = langs;
    }
  }

  constructor() {
    this.initPlayer();
  }

  get sleepTimerEnd() { return this._sleepTimerEnd; }

  private async initPlayer() {
    if (this._isPlayerReady) return;
    try {
      await TrackPlayer.setupPlayer();
      this._isPlayerReady = true;

      await TrackPlayer.updateOptions({
        progressUpdateEventInterval: 1,
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.Stop,
          Capability.SeekTo,
        ],
        notificationCapabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.SkipToNext,
          Capability.SkipToPrevious,
          Capability.SeekTo,
        ],
        color: 4293685353, // 0xffec4899
        android: {
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.ContinuePlayback,
          alwaysPauseOnInterruption: true,
        }
      });

      TrackPlayer.addEventListener(Event.PlaybackState, (event) => {
        if (event.state === TPState.Playing) this._state = 'playing';
        else if (event.state === TPState.Paused) this._state = 'paused';
        else if (event.state === TPState.Loading || event.state === TPState.Buffering) this._state = 'loading';
        else if (event.state === TPState.Error) this._state = 'error';
        else if (event.state === TPState.Ready) this._state = 'idle'; // Adjust based on logic
        this.notify();
      });

      TrackPlayer.addEventListener(Event.PlaybackProgressUpdated, (event) => {
        if (this._state === 'playing') {
          const delta = event.position - this._position;
          if (delta > 0 && delta < 2) {
             trackListeningTime(delta, { artist: this.currentTrack?.artist });
          }
        }
        this._position = event.position;
        this._duration = event.duration;
        this.notify();
      });

      // Auto-play next song when current track finishes
      TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
        // Song finished playing — advance to next
        await this.handleEnded();
      });

      // Native queue index is always 0 since we feed it one track at a time.
      // Do not overwrite our React internal _currentIndex with event.index!
      TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (event) => {
        // Ignored. We manage the React _currentIndex internally.
      });
      
      TrackPlayer.addEventListener(Event.PlaybackError, () => {
        this._state = 'error';
        this.notify();
        // Try to skip to next on error
        setTimeout(() => this.skipNext(), 1500);
      });

    } catch (e) {
      console.warn('TrackPlayer init error or already initialized:', e);
      this._isPlayerReady = true; // might be already init
    }
  }

  private notify() { this._listeners.forEach(l => l()); }

  subscribe(listener: Listener) {
    this._listeners.push(listener);
    return () => { this._listeners = this._listeners.filter(l => l !== listener); };
  }

  get currentTrack(): PlayerTrack | null { return this._queue[this._currentIndex] || null; }
  get queue(): PlayerTrack[] { return this._queue; }
  get currentIndex(): number { return this._currentIndex; }
  get state(): PlayerState { return this._state; }
  get position(): number { return this._position; }
  get duration(): number { return this._duration; }
  get isPlaying(): boolean { return this._state === 'playing'; }
  get repeatMode() { return this._repeatMode; }
  get isShuffled() { return this._isShuffled; }

  async playTrack(track: SongItem, queue?: SongItem[], index?: number) {
    if (!this._isPlayerReady) await this.initPlayer();
    const newQueue = (queue || [track]).map(s => ({ ...s }));
    this._originalQueue = [...newQueue];

    const trackIndex = index ?? newQueue.findIndex(s => s.id === track.id);

    if (this._isShuffled) {
      if (newQueue.length > 1) {
        const remaining = newQueue.filter((_, i) => i !== trackIndex);
        for (let i = remaining.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
        }
        this._queue = [newQueue[trackIndex], ...remaining];
        this._currentIndex = 0;
      } else {
        this._queue = newQueue;
        this._currentIndex = trackIndex;
      }
    } else {
      this._queue = newQueue;
      this._currentIndex = Math.max(0, trackIndex);
    }

    await this.loadAndPlay(this._queue[this._currentIndex]);

    // Auto-expand Up Next queue if it is short
    if (this._queue.length < 50 && track) {
      getRecommendedSongs(track, this._userLanguages, 100).then(recos => {
        const existingIds = new Set(this._queue.map(s => s.id));
        const freshRecos = recos.filter(s => !existingIds.has(s.id));
        if (freshRecos.length > 0) {
          this._queue = [...this._queue, ...freshRecos];
          this._originalQueue = [...this._queue];
          
          const tpTracks = freshRecos.map(track => {
            let url = (track as any).localPath || track.streamUrl || '';
            if ((track as any).localPath && !url.startsWith('file://')) url = `file://${url}`;
            return {
              id: track.id,
              url: url || 'dummy',
              title: track.title,
              artist: track.artist,
              artwork: track.artworkUrl && track.artworkUrl.length > 10 ? track.artworkUrl : 'ic_launcher',
            };
          });
          
          TrackPlayer.add(tpTracks).then(() => this.notify());
        }
      }).catch(e => console.log('Queue expansion failed', e));
    }
  }

  private async loadAndPlay(track: PlayerTrack) {
    if (!track) {
      this._state = 'error';
      this.notify();
      return;
    }

    this._state = 'loading';
    this.notify();
    
    let url = (track as any).localPath || track.streamUrl || '';

    // If it's a downloaded file, format the file URI
    if ((track as any).localPath) {
      if (!url.startsWith('file://')) {
        url = `file://${url}`;
      }
    } 
    // Otherwise calculate remote stream if missing
    else if (!url || url.includes('dummy') || url.length < 10) {
      const resolved = await getFullStreamUrl(track.title, track.artist);
      url = resolved || '';
    }

    if (!url) {
      this._state = 'error';
      this.notify();
      return;
    }

    track.resolvedUrl = url;

    try {
      const tpTrack: Track = {
        id: track.id,
        url: url,
        title: track.title,
        artist: track.artist,
        artwork: track.artworkUrl && track.artworkUrl.length > 10 ? track.artworkUrl : 'ic_launcher',
      };

      await TrackPlayer.reset();
      await TrackPlayer.add([tpTrack]);
      await TrackPlayer.play();
      this._state = 'playing';
      this.trackRecentlyPlayed(track);
      this.notify();
    } catch (e) {
      console.error('Audio play error:', e);
      this._state = 'error';
      this.notify();
    }
  }

  async play() {
    if (!this._isPlayerReady) await this.initPlayer();
    await TrackPlayer.play();
    this._state = 'playing';
    this.notify();
  }

  async pause() {
    await TrackPlayer.pause();
    this._state = 'paused';
    this.notify();
  }

  async togglePlay() {
    const state = await TrackPlayer.getPlaybackState();
    // Support both RNTP v3 (state.state) and RNTP v4 (state)
    const activeState = (state as any).state !== undefined ? (state as any).state : state;
    const isPlaying = activeState === TPState.Playing;
    
    if (isPlaying) {
      await this.pause();
    } else {
      await this.play();
    }
  }

  async seekTo(seconds: number) {
    await TrackPlayer.seekTo(seconds);
  }

  async skipNext() {
    if (this._repeatMode === 'track') {
      await TrackPlayer.seekTo(0);
      await TrackPlayer.play();
      return;
    }
    if (this._currentIndex < this._queue.length - 1) {
      this._currentIndex++;
      await this.loadAndPlay(this._queue[this._currentIndex]);
    } else if (this._repeatMode === 'queue') {
      this._currentIndex = 0;
      await this.loadAndPlay(this._queue[0]);
    } else {
      const current = this.currentTrack;
      if (current) {
        const reco = await getRecommendedSongs(current);
        if (reco.length > 0) {
          this._queue = [...this._queue, ...reco.map(s => ({ ...s }))];
          this._currentIndex++;
          await this.loadAndPlay(this._queue[this._currentIndex]);
        }
      }
    }
  }

  async skipPrev() {
    if (this._position > 3) {
      await TrackPlayer.seekTo(0);
      return;
    }
    if (this._currentIndex > 0) {
      this._currentIndex--;
      await this.loadAndPlay(this._queue[this._currentIndex]);
    }
  }

  async jumpToQueueIndex(index: number) {
    if (index >= 0 && index < this._queue.length) {
      this._currentIndex = index;
      await this.loadAndPlay(this._queue[this._currentIndex]);
    }
  }

  setRepeat(mode: 'off' | 'track' | 'queue') {
    this._repeatMode = mode;
    this.notify();
  }

  toggleShuffle() {
    this._isShuffled = !this._isShuffled;
    if (this._isShuffled) {
      const current = this._queue[this._currentIndex];
      const remaining = this._queue.filter((_, i) => i !== this._currentIndex);
      for (let i = remaining.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
      }
      this._queue = [current, ...remaining];
      this._currentIndex = 0;
    } else {
      const current = this._queue[this._currentIndex];
      this._queue = [...this._originalQueue];
      this._currentIndex = Math.max(0, this._queue.findIndex(t => t.id === current?.id));
    }
    this.notify();
  }

  setSleepTimer(minutes: number) {
    if (this._sleepTimer) clearTimeout(this._sleepTimer);
    if (this._sleepTimerWarning) clearTimeout(this._sleepTimerWarning);
    this._sleepTimerEnd = null;

    if (minutes <= 0) {
      this.notify();
      return;
    }

    const waitTime = minutes * 60 * 1000;
    this._sleepTimerEnd = Date.now() + waitTime;

    const warningTime = waitTime - 10000;
    if (warningTime > 0) {
      this._sleepTimerWarning = setTimeout(async () => {
        if (this._sleepTimerEnd) {
          await triggerSleepWarningNotification();
        }
      }, warningTime);
    }

    this._sleepTimer = setTimeout(() => {
      this.pause();
      this._sleepTimerEnd = null;
      console.log('Sleep timer elapsed. Playback paused.');
      this.notify();
    }, waitTime);
    
    this.notify();
  }

  private async handleEnded() {
    if (this._repeatMode === 'track') {
      await TrackPlayer.seekTo(0);
      await TrackPlayer.play();
    } else {
      await this.skipNext();
    }
  }

  private async trackRecentlyPlayed(track: PlayerTrack) {
    const user = auth.currentUser;
    if (!user) return;
    try {
      const docId = `${user.uid}_${track.id}`;
      await setDoc(doc(db, 'recentlyPlayed', docId), {
        userId: user.uid,
        songId: track.id,
        title: track.title,
        artist: track.artist,
        artworkUrl: track.artworkUrl,
        streamUrl: track.streamUrl || '',
        duration: track.duration || 0,
        playedAt: serverTimestamp(),
      }, { merge: true });
    } catch (e) {
      console.warn('Failed to track recently played:', e);
    }
  }

  async reset() {
    await TrackPlayer.pause();
    await TrackPlayer.reset();
    this._queue = [];
    this._currentIndex = 0;
    this._position = 0;
    this._state = 'idle';
    this.notify();
  }

  getEqGain(index: number) {
    return this.eqGains[index];
  }

  setEqGain(index: number, value: number) {
    this.eqGains[index] = value;
    this.notify();
  }
}

const MusicPlayerService = new MusicPlayerServiceClass();
export default MusicPlayerService;
