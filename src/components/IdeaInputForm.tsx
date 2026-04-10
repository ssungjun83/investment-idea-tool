"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import LoadingAnalysis from "./LoadingAnalysis";
import { Sparkles, X, ImageIcon } from "lucide-react";

interface PastedImage {
  data: string;       // base64
  media_type: string; // image/png, image/jpeg, ...
  preview: string;    // object URL for preview
}

export default function IdeaInputForm() {
  const [input, setInput] = useState("");
  const [image, setImage] = useState<PastedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const router = useRouter();
  const dropRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Elapsed timer
  useEffect(() => {
    if (loading) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading]);

  // Cancel handler
  const handleCancel = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setLoading(false);
    setError("");
    setStage(1);
    setMessage("");
  }, []);

  // ── 클립보드 붙여넣기 / 드래그&드롭 처리 ──────────────────────────
  function extractImageFromItems(items: DataTransferItemList) {
    for (const item of Array.from(items)) {
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (!file) continue;
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(",")[1];
          setImage({
            data: base64,
            media_type: file.type,
            preview: URL.createObjectURL(file),
          });
        };
        reader.readAsDataURL(file);
        return true;
      }
    }
    return false;
  }

  function handlePaste(e: React.ClipboardEvent) {
    if (e.clipboardData.items) {
      extractImageFromItems(e.clipboardData.items);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    if (e.dataTransfer.items) {
      extractImageFromItems(e.dataTransfer.items);
    }
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }

  function removeImage() {
    if (image) URL.revokeObjectURL(image.preview);
    setImage(null);
  }

  // ── 제출 ──────────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() && !image) return;

    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError("");
    setStage(1);
    setMessage("투자 아이디어 분석 중...");

    try {
      const body: Record<string, unknown> = {
        raw_input: input || "첨부된 이미지를 분석해주세요.",
      };
      if (image) {
        body.image = { data: image.data, media_type: image.media_type };
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `서버 오류 (${res.status})`);
      }

      if (!res.body) throw new Error("스트림을 받을 수 없습니다.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

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

            if (data.type === "status") {
              setStage(data.stage);
              setMessage(data.message);
            } else if (data.type === "done") {
              setLoading(false);
              router.push(`/ideas/${data.idea_id}`);
              return;
            } else if (data.type === "error") {
              setError(data.message);
              setLoading(false);
              return;
            }
          } catch {
            // skip malformed SSE lines
          }
        }
      }

      // Stream ended without 'done' event — likely a timeout
      if (loading) {
        setError("서버 연결이 끊어졌습니다. 다시 시도해주세요.");
        setLoading(false);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        // User cancelled — do nothing
        return;
      }
      setError(err instanceof Error ? err.message : "오류가 발생했습니다.");
      setLoading(false);
    }
  }

  const placeholder = `투자 아이디어를 입력하거나 이미지를 붙여넣으세요 (Ctrl+V)

예시:
- 미국의 AI 데이터센터 투자 급증으로 전력 수요가 폭발적으로 증가하고 있다
- 중국의 전기차 수출 증가로 배터리 원자재 수요가 급등하고 있다`;

  if (loading) {
    return (
      <LoadingAnalysis
        currentStage={stage}
        message={message}
        onCancel={handleCancel}
        elapsed={elapsed}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 붙여넣기 / 드래그&드롭 영역 */}
      <div
        ref={dropRef}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="relative"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="min-h-[180px] text-sm leading-relaxed resize-none"
          disabled={loading}
        />

        {/* 이미지 없을 때 힌트 */}
        {!image && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 text-xs text-gray-300 pointer-events-none select-none">
            <ImageIcon className="h-3.5 w-3.5" />
            <span>이미지 붙여넣기 가능</span>
          </div>
        )}
      </div>

      {/* 붙여넣은 이미지 미리보기 */}
      {image && (
        <div className="relative inline-block rounded-lg overflow-hidden border border-blue-200 bg-blue-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.preview}
            alt="붙여넣은 이미지"
            className="max-h-48 max-w-full object-contain"
          />
          <button
            type="button"
            onClick={removeImage}
            className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-0.5 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
          <div className="px-3 py-1.5 text-xs text-blue-600 font-medium bg-blue-50">
            이미지 첨부됨 — AI가 이미지를 함께 분석합니다
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full h-12 text-base gap-2"
        disabled={loading || (!input.trim() && !image)}
      >
        <Sparkles className="h-5 w-5" />
        AI 분석 시작
      </Button>
    </form>
  );
}
