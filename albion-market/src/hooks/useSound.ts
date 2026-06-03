// src/hooks/useSound.ts
"use client";

import { useCallback, useRef } from "react";
import { useAppStore } from "@/store";

export function useSound() {
  const { settings } = useAppStore();
  const audioContextRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback(
    (frequency: number, duration: number, type: OscillatorType = "sine") => {
      if (!settings.soundAlerts) return;

      try {
        const ctx = getAudioContext();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

        gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + duration
        );

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
      } catch (err) {
        console.warn("Audio playback error:", err);
      }
    },
    [settings.soundAlerts, getAudioContext]
  );

  const playAlert = useCallback(() => {
    // Ascending alert sound
    playTone(440, 0.15);
    setTimeout(() => playTone(554, 0.15), 150);
    setTimeout(() => playTone(659, 0.25), 300);
  }, [playTone]);

  const playSuccess = useCallback(() => {
    playTone(523, 0.1);
    setTimeout(() => playTone(659, 0.1), 100);
    setTimeout(() => playTone(784, 0.2), 200);
  }, [playTone]);

  const playNotification = useCallback(() => {
    playTone(880, 0.1, "square");
    setTimeout(() => playTone(1100, 0.15, "sine"), 120);
  }, [playTone]);

  return { playAlert, playSuccess, playNotification };
}
