import { useCallback, useEffect, useRef, useState } from "react";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((e: any) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

function getRecognition(): SpeechRecognitionLike | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition ?? null;
  if (!Ctor) return null;
  const rec: SpeechRecognitionLike = new Ctor();
  rec.lang = navigator.language?.startsWith("kn") ? "kn-IN" : "en-IN";
  rec.continuous = false;
  rec.interimResults = true;
  return rec;
}

/** Free, browser-native voice input + speech output (no API keys, works on any host). */
export function useVoice() {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState({ mic: false, speaker: false });
  const recRef = useRef<SpeechRecognitionLike | null>(null);

  useEffect(() => {
    setSupported({
      mic: Boolean(
        (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition,
      ),
      speaker: typeof window !== "undefined" && "speechSynthesis" in window,
    });
    return () => {
      recRef.current?.stop();
      if (typeof window !== "undefined" && "speechSynthesis" in window)
        window.speechSynthesis.cancel();
    };
  }, []);

  const stopListening = useCallback(() => {
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
  }, []);

  const startListening = useCallback(
    (onText: (text: string, final: boolean) => void) => {
      const rec = getRecognition();
      if (!rec) return;
      recRef.current = rec;
      rec.onresult = (e: any) => {
        let text = "";
        let final = false;
        for (let i = e.resultIndex; i < e.results.length; i++) {
          text += e.results[i][0].transcript;
          if (e.results[i].isFinal) final = true;
        }
        onText(text.trim(), final);
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      try {
        rec.start();
        setListening(true);
      } catch {
        setListening(false);
      }
    },
    [],
  );

  const speak = useCallback((text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "en-IN";
    u.rate = 1;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(u);
  }, []);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window)
      window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  return { listening, speaking, supported, startListening, stopListening, speak, stopSpeaking };
}
