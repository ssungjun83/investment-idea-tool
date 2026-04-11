import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import IndicatorDashboard from "@/components/IndicatorDashboard";

export const dynamic = "force-dynamic";

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      }
    >
      <IndicatorDashboard />
    </Suspense>
  );
}
