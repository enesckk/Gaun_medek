"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentDetectionCard } from "@/components/ai/StudentDetectionCard";
import { AIScorePreviewTable } from "@/components/ai/AIScorePreviewTable";
import { AIScorePreviewToolbar } from "@/components/ai/AIScorePreviewToolbar";
import { type AIAnswer, type AIProcessResponse } from "@/lib/api/aiApi";
import { scoreApi, type SubmitScoreDto } from "@/lib/api/scoreApi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function AIPreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [data, setData] = useState<AIProcessResponse | null>(null);
  const [answers, setAnswers] = useState<AIAnswer[]>([]);
  const [studentId, setStudentId] = useState<string>("");
  const [examId, setExamId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    // Load data from localStorage (stored by AI page)
    if (sessionId) {
      const storedData = localStorage.getItem(`ai_session_${sessionId}`);
      if (storedData) {
        const parsed: AIProcessResponse = JSON.parse(storedData);
        setData(parsed);
        setAnswers(parsed.answers);
        
        // Find exam by examCode
        findExamByCode(parsed.examId);
      }
    }
  }, [sessionId]);

  const findExamByCode = async (examCode: string) => {
    try {
      const { examApi } = await import("@/lib/api/examApi");
      const exam = await examApi.getByExamCode(examCode);
      if (exam) {
        setExamId(exam._id);
      }
    } catch (error) {
      console.error("Failed to find exam by code", error);
    }
  };

  const handleApproveAndSave = async () => {
    if (!studentId) {
      toast.error("Please verify student information");
      return;
    }

    if (answers.length === 0) {
      toast.error("No scores to save");
      return;
    }

    setShowSaveDialog(true);
  };

  const handleConfirmSave = async () => {
    setIsSaving(true);
    let successCount = 0;
    let errorCount = 0;

    // Map answers to questions by number if questionId is missing
    const { questionApi } = await import("@/lib/api/questionApi");
    const examQuestions = await questionApi.getByExam(examId);
    const questionsByNumber = new Map(
      examQuestions.map((q) => [q.number, q])
    );

    for (const answer of answers) {
      try {
        // Get questionId from number if not present
        let questionId = answer.questionId;
        if (!questionId) {
          const question = questionsByNumber.get(answer.number);
          if (!question) {
            console.error(`Question ${answer.number} not found`);
            errorCount++;
            continue;
          }
          questionId = question._id;
        }

        await scoreApi.submit({
          studentId,
          examId,
          questionId,
          scoreValue: answer.scoreValue,
        } as SubmitScoreDto);
        successCount++;
      } catch (error) {
        errorCount++;
        console.error("Failed to save score:", error);
      }
    }

    setIsSaving(false);
    setShowSaveDialog(false);

    if (errorCount === 0) {
      toast.success(`Successfully saved ${successCount} scores`);
      router.push("/scores");
    } else {
      toast.error(`Saved ${successCount} scores, ${errorCount} failed`);
    }
  };

  const handleClearAll = () => {
    setAnswers((prev) => prev.map((a) => ({ ...a, scoreValue: 0 })));
  };

  const handleDiscard = () => {
    if (confirm("Are you sure you want to discard all changes?")) {
      router.push("/ai");
    }
  };

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Score Preview</h2>
          <p className="text-muted-foreground">Loading preview data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Score Mapping Preview</h2>
        <p className="text-muted-foreground">
          Review and edit AI-detected scores before saving
        </p>
      </div>

      <StudentDetectionCard
        studentNumber={data.studentNumber}
        examId={data.examId}
        onStudentChange={setStudentId}
        onExamChange={setExamId}
      />

      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle>Detected Scores</CardTitle>
          <CardDescription>
            Review and edit the scores detected by AI. Click edit to modify any score.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AIScorePreviewTable
            answers={answers}
            examId={examId}
            onAnswersChange={setAnswers}
          />
        </CardContent>
      </Card>

      <AIScorePreviewToolbar
        onApproveAndSave={handleApproveAndSave}
        onClearAll={handleClearAll}
        onDiscard={handleDiscard}
        isSaving={isSaving}
        disabled={!studentId}
      />

      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Save</DialogTitle>
            <DialogDescription>
              Are you sure you want to save {answers.length} scores? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <button
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => setShowSaveDialog(false)}
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90"
              onClick={handleConfirmSave}
            >
              Save All Scores
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

