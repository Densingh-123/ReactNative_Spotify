import TrackPlayer, { Event } from 'react-native-track-player';
import { AppState, AppStateStatus } from 'react-native';

let wasPlayingBeforeInterruption = false;
let appStateBeforeBackground: AppStateStatus = 'active';

export const PlaybackService = async function() {
  // ── Remote Control Events (notification/lockscreen buttons) ──
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
  TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
  TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
  TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());
  TrackPlayer.addEventListener(Event.RemoteSeek, (event) => TrackPlayer.seekTo(event.position));

  // ── Audio Focus (Android): pause on duck/focus loss, resume on focus gain ──
  TrackPlayer.addEventListener(Event.RemoteDuck, async (event) => {
    if (event.permanent) {
      // Permanent focus loss (e.g. another app playing loudly) → pause
      await TrackPlayer.pause();
      wasPlayingBeforeInterruption = false;
    } else if (event.paused) {
      // Temporary focus loss (e.g. notification) → remember state & pause
      const state = await TrackPlayer.getPlaybackState();
      const { State } = await import('react-native-track-player');
      wasPlayingBeforeInterruption = state.state === State.Playing;
      await TrackPlayer.pause();
    } else {
      // Focus regained → resume only if we were playing before
      if (wasPlayingBeforeInterruption) {
        await TrackPlayer.play();
        wasPlayingBeforeInterruption = false;
      }
    }
  });

  // ── App State Changes: pause when going to background with other audio ──
  AppState.addEventListener('change', async (nextState: AppStateStatus) => {
    if (appStateBeforeBackground === 'active' && nextState === 'background') {
      // App moved to background — Track Player continues playing in background
      // (this is intentional for music apps - keep playing)
      appStateBeforeBackground = nextState;
    } else if (nextState === 'active' && appStateBeforeBackground === 'background') {
      // App came back to foreground
      appStateBeforeBackground = nextState;
    }
  });
};
