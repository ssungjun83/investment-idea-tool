"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle, Send, Loader2, User, Bot } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || loading) return;

      const question = input.trim();
      setInput("");
      setMessages((prev) => [...prev, { role: "user", content: question }]);
      setLoading(true);

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question }),
        });

        if (!res.body) throw new Error("스트림 오류");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let assistantText = "";

        // 빈 메시지 추가 (스트리밍으로 채워질 예정)
        setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === "delta") {
                assistantText += data.text;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: assistantText };
                  return updated;
                });
              } else if (data.type === "error") {
                assistantText = data.message;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = { role: "assistant", content: `오류: ${assistantText}` };
                  return updated;
                });
              }
            } catch {
              // skip
            }
          }
        }
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `오류: ${err instanceof Error ? err.message : "알 수 없는 오류"}` },
        ]);
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [input, loading]
  );

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-6 w-6 text-violet-500" />
        <h1 className="text-2xl font-bold">AI 투자 어시스턴트</h1>
        <span className="text-xs text-gray-400">축적된 데이터 기반으로 답변합니다</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4">
        {messages.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <Bot className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm mb-4">축적된 투자 데이터를 기반으로 질문에 답합니다.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["유가 하락 시 수혜 기업은?", "가장 많이 언급된 기업은?", "현재 주요 투자 테마를 정리해줘"].map(
                (q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setInput(q);
                      inputRef.current?.focus();
                    }}
                    className="text-xs px-3 py-1.5 rounded-full bg-violet-50 text-violet-600 hover:bg-violet-100 transition-colors"
                  >
                    {q}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="h-4 w-4 text-violet-600" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-md"
                  : "bg-white border rounded-bl-md text-gray-700"
              }`}
            >
              {msg.content || (loading && i === messages.length - 1 ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              ) : null)}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <User className="h-4 w-4 text-blue-600" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 pt-3 border-t">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="투자 데이터에 대해 질문하세요..."
          className="flex-1 px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          disabled={loading}
        />
        <Button
          type="submit"
          size="icon"
          className="h-12 w-12 rounded-xl bg-violet-600 hover:bg-violet-700"
          disabled={loading || !input.trim()}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}
