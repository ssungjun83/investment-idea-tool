"use client";

import { Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingAnalysisProps {
  currentStage: number;
  message: string;
}

const stages = [
  { label: "투자 아이디어 분석 중", icon: "💡" },
  { label: "사이드이펙트 도출 중", icon: "🌊" },
  { label: "수혜 기업 저장 중", icon: "🏢" },
];

export default function LoadingAnalysis({ currentStage, message }: LoadingAnalysisProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-12">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-bounce">{stages[currentStage - 1]?.icon ?? "⏳"}</div>
        <p className="text-sm text-gray-500 font-medium">{message}</p>
      </div>

      <div className="flex gap-6">
        {stages.map((stage, idx) => {
          const stageNum = idx + 1;
          const isDone = stageNum < currentStage;
          const isCurrent = stageNum === currentStage;

          return (
            <div
              key={stageNum}
              className={cn(
                "flex flex-col items-center gap-2 transition-all",
                isDone ? "opacity-100" : isCurrent ? "opacity-100" : "opacity-30"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                  isDone
                    ? "bg-emerald-100 text-emerald-600"
                    : isCurrent
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-400"
                )}
              >
                {isDone ? (
                  <CheckCircle className="h-5 w-5" />
                ) : isCurrent ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  stageNum
                )}
              </div>
              <span className="text-xs text-center text-gray-600 w-20">{stage.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
