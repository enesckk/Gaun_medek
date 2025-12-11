"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { scoreApi, type Score, type SubmitScoreDto } from "@/lib/api/scoreApi";

interface ScoreEditDialogProps {
  score: Score | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ScoreEditDialog({
  score,
  open,
  onOpenChange,
  onSuccess,
}: ScoreEditDialogProps) {
  const [scoreValue, setScoreValue] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [maxScore, setMaxScore] = useState<number>(0);

  useEffect(() => {
    if (score) {
      setScoreValue(score.scoreValue.toString());
      const question = typeof score.questionId === "string" ? null : score.questionId;
      setMaxScore(question?.maxScore || 0);
    }
  }, [score]);

  const handleSubmit = async () => {
    if (!score) return;

    const numValue = parseFloat(scoreValue);
    if (isNaN(numValue) || numValue < 0) {
      toast.error("Lütfen geçerli bir puan girin");
      return;
    }

    if (numValue > maxScore) {
      toast.error(`Puan maksimum puandan (${maxScore}) fazla olamaz`);
      return;
    }

    const studentId = typeof score.studentId === "string" ? score.studentId : score.studentId._id;
    const examId = typeof score.examId === "string" ? score.examId : score.examId._id;
    const questionId = typeof score.questionId === "string" ? score.questionId : score.questionId._id;

    setIsSubmitting(true);
    try {
      await scoreApi.submit({
        studentId,
        examId,
        questionId,
        scoreValue: numValue,
      } as SubmitScoreDto);
      toast.success("Puan başarıyla güncellendi");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Puan güncellenemedi";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!score) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Puanı Düzenle</DialogTitle>
          <DialogDescription>
            Puan değerini güncelleyin. Maksimum puan: {maxScore}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="scoreValue">Puan Değeri</Label>
            <Input
              id="scoreValue"
              type="number"
              step="0.1"
              min="0"
              max={maxScore}
              value={scoreValue}
              onChange={(e) => setScoreValue(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            İptal
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Kaydediliyor..." : "Puanı Kaydet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

