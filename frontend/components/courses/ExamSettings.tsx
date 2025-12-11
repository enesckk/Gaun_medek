"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface ExamSettings {
  examCode: string;
  questionCount: number;
  maxScorePerQuestion: number;
}

interface ExamSettingsProps {
  midterm: ExamSettings;
  final: ExamSettings;
  onMidtermChange: (settings: ExamSettings) => void;
  onFinalChange: (settings: ExamSettings) => void;
  errors?: Record<string, string>;
  disabled?: boolean;
}

export function ExamSettingsComponent({
  midterm,
  final,
  onMidtermChange,
  onFinalChange,
  errors = {},
  disabled = false,
}: ExamSettingsProps) {
  const updateMidterm = (field: keyof ExamSettings, value: string | number) => {
    onMidtermChange({ ...midterm, [field]: value });
  };

  const updateFinal = (field: keyof ExamSettings, value: string | number) => {
    onFinalChange({ ...final, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Midterm Card */}
      <Card className="rounded-lg shadow-sm border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Vize Sınavı</CardTitle>
          <CardDescription className="text-xs">
            Vize sınavı ayarlarını girin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          <div className="space-y-1.5">
            <Label htmlFor="midterm-code" className="text-sm">
              Sınav Kodu (2 haneli) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="midterm-code"
              type="text"
              value={midterm.examCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 2);
                updateMidterm("examCode", value);
              }}
              placeholder="01"
              disabled={disabled}
              className={cn(
                "h-10 text-sm text-center font-mono",
                errors.midtermExamCode ? "border-destructive" : ""
              )}
            />
            {errors.midtermExamCode && (
              <p className="text-xs text-destructive">{errors.midtermExamCode}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="midterm-questions" className="text-sm">
              Soru Sayısı <span className="text-destructive">*</span>
            </Label>
            <Input
              id="midterm-questions"
              type="number"
              min="1"
              value={midterm.questionCount || ""}
              onChange={(e) =>
                updateMidterm("questionCount", parseInt(e.target.value) || 0)
              }
              placeholder="10"
              disabled={disabled}
              className={cn(
                "h-10 text-sm",
                errors.midtermQuestionCount ? "border-destructive" : ""
              )}
            />
            {errors.midtermQuestionCount && (
              <p className="text-xs text-destructive">
                {errors.midtermQuestionCount}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="midterm-max-score" className="text-sm">
              Soru Başına Maksimum Puan <span className="text-destructive">*</span>
            </Label>
            <Input
              id="midterm-max-score"
              type="number"
              min="0"
              step="0.1"
              value={midterm.maxScorePerQuestion || ""}
              onChange={(e) =>
                updateMidterm(
                  "maxScorePerQuestion",
                  parseFloat(e.target.value) || 0
                )
              }
              placeholder="10"
              disabled={disabled}
              className={cn(
                "h-10 text-sm",
                errors.midtermMaxScore ? "border-destructive" : ""
              )}
            />
            {errors.midtermMaxScore && (
              <p className="text-xs text-destructive">{errors.midtermMaxScore}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Final Card */}
      <Card className="rounded-lg shadow-sm border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Final Sınavı</CardTitle>
          <CardDescription className="text-xs">
            Final sınavı ayarlarını girin
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          <div className="space-y-1.5">
            <Label htmlFor="final-code" className="text-sm">
              Sınav Kodu (2 haneli) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="final-code"
              type="text"
              value={final.examCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "").slice(0, 2);
                updateFinal("examCode", value);
              }}
              placeholder="02"
              disabled={disabled}
              className={cn(
                "h-10 text-sm text-center font-mono",
                errors.finalExamCode ? "border-destructive" : ""
              )}
            />
            {errors.finalExamCode && (
              <p className="text-xs text-destructive">{errors.finalExamCode}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="final-questions" className="text-sm">
              Soru Sayısı <span className="text-destructive">*</span>
            </Label>
            <Input
              id="final-questions"
              type="number"
              min="1"
              value={final.questionCount || ""}
              onChange={(e) =>
                updateFinal("questionCount", parseInt(e.target.value) || 0)
              }
              placeholder="10"
              disabled={disabled}
              className={cn(
                "h-10 text-sm",
                errors.finalQuestionCount ? "border-destructive" : ""
              )}
            />
            {errors.finalQuestionCount && (
              <p className="text-xs text-destructive">{errors.finalQuestionCount}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="final-max-score" className="text-sm">
              Soru Başına Maksimum Puan <span className="text-destructive">*</span>
            </Label>
            <Input
              id="final-max-score"
              type="number"
              min="0"
              step="0.1"
              value={final.maxScorePerQuestion || ""}
              onChange={(e) =>
                updateFinal(
                  "maxScorePerQuestion",
                  parseFloat(e.target.value) || 0
                )
              }
              placeholder="10"
              disabled={disabled}
              className={cn(
                "h-10 text-sm",
                errors.finalMaxScore ? "border-destructive" : ""
              )}
            />
            {errors.finalMaxScore && (
              <p className="text-xs text-destructive">{errors.finalMaxScore}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

