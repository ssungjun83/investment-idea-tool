import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import IdeaInputForm from "@/components/IdeaInputForm";
import { Lightbulb } from "lucide-react";

export default function NewIdeaPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-2">
        <Lightbulb className="h-6 w-6 text-amber-400" />
        <h1 className="text-2xl font-bold">새 아이디어 입력</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">투자 아이디어 분석</CardTitle>
        </CardHeader>
        <CardContent>
          <IdeaInputForm />
        </CardContent>
      </Card>
    </div>
  );
}
