"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import LoadingAnalysis from "./LoadingAnalysis";
import { Sparkles } from "lucide-react";

export default function IdeaInputForm() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    setLoading(true);
    setError("");
    setStage(1);
    setMessage("투자 아이디어 분석 중...");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_input: input }),
      });

      if (!res.body) throw new Error("스트림을 받을 수 없습니다.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = JSON.parse(line.slice(6));

          if (data.type === "status") {
            setStage(data.stage);
            setMessage(data.message);
          } else if (data.type === "done") {
            router.push(`/ideas/${data.idea_id}`);
            return;
          } else if (data.type === "error") {
            setError(data.message);
            setLoading(false);
            return;
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setLoading(false);
    }
  }

  const placeholder = `예시:
- 미국의 AI 데이터센터 투자 급증으로 전력 수요가 폭발적으로 증가하고 있다
- 중국의 전기차 수출 증가로 배터리 원자재 수요가 급등하고 있다
- 고령화 사회 진입으로 의료비 지출과 헬스케어 수요가 증가하고 있다`;

  if (loading) {
    return <LoadingAnalysis currentStage={stage} message={message} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="min-h-[200px] text-sm leading-relaxed resize-none"
        disabled={loading}
      />

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full h-12 text-base gap-2"
        disabled={loading || !input.trim()}
      >
        <Sparkles className="h-5 w-5" />
        AI 분석 시작
      </Button>
    </form>
  );
}
