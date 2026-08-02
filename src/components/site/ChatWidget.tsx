import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { useVoice } from "@/lib/useVoice";

type ChatMessage = { role: "user" | "assistant"; content: string };

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Hi! Ask me anything about classes, fees, timings, or admissions at Brilliant Desk Tuitions. You can also tap the mic and speak.",
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [voiceReply, setVoiceReply] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { listening, speaking, supported, startListening, stopListening, speak, stopSpeaking } =
    useVoice();

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
    else {
      stopListening();
      stopSpeaking();
    }
  }, [open, stopListening, stopSpeaking]);

  async function ask(text: string) {
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.filter((m) => m !== WELCOME) }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      const content =
        data.reply ?? data.error ?? "Sorry, something went wrong. Please WhatsApp 099025 43544.";
      setMessages((m) => [...m, { role: "assistant", content }]);
      if (voiceReply && data.reply) speak(data.reply);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: "I could not connect just now. Please WhatsApp us on 099025 43544.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    void ask(text);
  }

  function toggleMic() {
    if (listening) {
      stopListening();
      return;
    }
    stopSpeaking();
    setVoiceReply(true);
    startListening((text, final) => {
      setInput(text);
      if (final && text) {
        stopListening();
        void ask(text);
      }
    });
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-5 z-[60] flex h-[70vh] max-h-[520px] w-[min(92vw,370px)] flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-line bg-ink px-4 py-3 text-paper">
            <div>
              <p className="font-display text-base font-semibold">Ask Brilliant Desk</p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-paper/60">
                Admissions assistant
              </p>
            </div>
            <div className="flex items-center gap-2">
              {supported.speaker && (
                <button
                  aria-label={voiceReply ? "Turn off voice replies" : "Turn on voice replies"}
                  title={voiceReply ? "Voice replies on" : "Voice replies off"}
                  onClick={() => {
                    if (voiceReply) stopSpeaking();
                    setVoiceReply((v) => !v);
                  }}
                  className={voiceReply ? "text-marigold" : "text-paper/60"}
                >
                  {voiceReply ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                </button>
              )}
              <button aria-label="Close chat" onClick={() => setOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-pen text-paper"
                      : "border border-line bg-card text-foreground"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl border border-line bg-card px-3.5 py-2 text-sm text-muted-foreground">
                  <span className="inline-flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-marigold [animation-delay:-0.2s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-marigold [animation-delay:-0.1s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-marigold" />
                  </span>
                </div>
              </div>
            )}
            {(listening || speaking) && (
              <p className="text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                {listening ? "Listening…" : "Speaking…"}
              </p>
            )}
          </div>

          <form onSubmit={send} className="flex items-center gap-2 border-t border-line px-3 py-3">
            {supported.mic && (
              <button
                type="button"
                onClick={toggleMic}
                aria-label={listening ? "Stop listening" : "Speak your question"}
                className={`inline-flex h-10 w-10 flex-none items-center justify-center rounded-full border border-line ${
                  listening ? "bg-marigold text-ink" : "bg-card text-ink-soft"
                }`}
              >
                {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            )}
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? "Listening…" : "Type or speak your question…"}
              className="h-10 flex-1 rounded-full border border-input bg-card px-4 text-sm outline-none focus:border-marigold"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-full bg-pen text-paper disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        className="fixed bottom-5 right-5 z-[60] inline-flex h-14 w-14 items-center justify-center rounded-full bg-marigold text-ink shadow-xl transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </>
  );
}
