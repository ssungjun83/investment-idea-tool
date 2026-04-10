import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Effect {
  id?: number;
  effect_order: number;
  category: string;
  description: string;
  magnitude: string;
}

const magnitudeConfig = {
  상: { label: "높음", className: "bg-red-100 text-red-700 border-red-200" },
  중: { label: "보통", className: "bg-amber-100 text-amber-700 border-amber-200" },
  하: { label: "낮음", className: "bg-gray-100 text-gray-600 border-gray-200" },
};

const categoryVariants: Record<string, "blue" | "green" | "amber" | "red" | "purple" | "gray"> = {
  산업: "blue",
  금융: "green",
  소비자: "amber",
  지정학: "red",
  기술: "purple",
  환경: "green",
};

export default function Stage2View({ effects }: { effects: Effect[] }) {
  const sorted = [...effects].sort((a, b) => a.effect_order - b.effect_order);

  return (
    <div className="space-y-3">
      {sorted.map((effect) => {
        const mag = magnitudeConfig[effect.magnitude as keyof typeof magnitudeConfig];
        return (
          <Card key={effect.id ?? effect.effect_order}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-sm font-bold">
                  {effect.effect_order}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={categoryVariants[effect.category] ?? "gray"}>
                      {effect.category}
                    </Badge>
                    {mag && (
                      <span
                        className={cn(
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
                          mag.className
                        )}
                      >
                        파급력: {mag.label}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {effect.description}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
