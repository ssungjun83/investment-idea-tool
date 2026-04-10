import { Suspense } from "react";
import GraphPageContent from "./GraphPageContent";
import { Network } from "lucide-react";

export default function GraphPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-2 py-8 text-gray-400">
          <Network className="h-5 w-5 animate-pulse" />
          <span className="text-sm">그래프 로딩 중...</span>
        </div>
      }
    >
      <GraphPageContent />
    </Suspense>
  );
}
