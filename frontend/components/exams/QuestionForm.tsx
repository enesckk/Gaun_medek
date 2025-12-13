"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  questionApi,
  type Question,
  type CreateQuestionDto,
  type UpdateQuestionDto,
} from "@/lib/api/questionApi";
import { examApi, type Exam } from "@/lib/api/examApi";
import { courseApi, type Course } from "@/lib/api/courseApi";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

const questionSchema = z.object({
  number: z.number().int().positive("Soru numarası pozitif olmalıdır"),
  maxScore: z.number().positive("Maksimum puan pozitif olmalıdır"),
  mappedLearningOutcomes: z.array(z.string()).min(1, "En az bir Öğrenme Çıktısı (ÖÇ) seçmelisiniz"),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface QuestionFormProps {
  mode: "create" | "edit";
  examId: string;
  questionId?: string;
  initialData?: Question;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function QuestionForm({
  mode,
  examId,
  questionId,
  initialData,
  onSuccess,
  onCancel,
}: QuestionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [learningOutcomes, setLearningOutcomes] = useState<Array<{ code: string; description: string }>>([]);
  const [selectedOutcomes, setSelectedOutcomes] = useState<string[]>([]);
  const [exam, setExam] = useState<Exam | null>(null);

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: initialData
      ? {
          number: initialData.number,
          maxScore: initialData.maxScore,
          mappedLearningOutcomes: Array.isArray(initialData.mappedLearningOutcome)
            ? initialData.mappedLearningOutcome
            : typeof initialData.mappedLearningOutcome === "string"
            ? [initialData.mappedLearningOutcome]
            : (initialData.mappedLearningOutcome as any)?._id
            ? [(initialData.mappedLearningOutcome as any)._id]
            : [],
        }
      : {
          number: 1,
          maxScore: 0,
          mappedLearningOutcomes: [],
        },
  });

  useEffect(() => {
    fetchExamAndOutcomes();
  }, [examId]);

  useEffect(() => {
    const currentOutcomes = form.watch("mappedLearningOutcomes");
    setSelectedOutcomes(currentOutcomes || []);
  }, [form.watch("mappedLearningOutcomes")]);

  const fetchExamAndOutcomes = async () => {
    try {
      // Fetch exam to get courseId
      const examData = await examApi.getById(examId);
      setExam(examData);

      if (examData.courseId) {
        // Fetch course to get embedded learningOutcomes
        const course = await courseApi.getById(examData.courseId);
        if (course.learningOutcomes && Array.isArray(course.learningOutcomes)) {
          setLearningOutcomes(
            course.learningOutcomes.map((lo: any) => ({
              code: lo.code || "",
              description: lo.description || "",
            }))
          );
        }
      }
    } catch (error) {
      console.error("Ders bilgileri yüklenirken hata oluştu:", error);
      toast.error("Öğrenme çıktıları yüklenemedi");
    }
  };

  const toggleLearningOutcome = (outcomeCode: string) => {
    const current = form.getValues("mappedLearningOutcomes") || [];
    const updated = current.includes(outcomeCode)
      ? current.filter((code) => code !== outcomeCode)
      : [...current, outcomeCode];
    form.setValue("mappedLearningOutcomes", updated);
    setSelectedOutcomes(updated);
  };

  const removeLearningOutcome = (outcomeCode: string) => {
    const current = form.getValues("mappedLearningOutcomes") || [];
    const updated = current.filter((code) => code !== outcomeCode);
    form.setValue("mappedLearningOutcomes", updated);
    setSelectedOutcomes(updated);
  };

  const onSubmit = async (data: QuestionFormData) => {
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await questionApi.create({
          examId,
          number: data.number,
          maxScore: data.maxScore,
          mappedLearningOutcomes: data.mappedLearningOutcomes,
        } as CreateQuestionDto);
        toast.success("Soru başarıyla kaydedildi");
        form.reset();
        setSelectedOutcomes([]);
        onSuccess?.();
      } else if (mode === "edit" && questionId) {
        await questionApi.update(questionId, {
          number: data.number,
          maxScore: data.maxScore,
          mappedLearningOutcomes: data.mappedLearningOutcomes,
        } as UpdateQuestionDto);
        toast.success("Soru başarıyla güncellendi");
        onSuccess?.();
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Soru kaydedilemedi";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormItem>
        <FormLabel htmlFor="number">Soru Numarası <span className="text-red-500">*</span></FormLabel>
        <Input
          id="number"
          type="number"
          {...form.register("number", { valueAsNumber: true })}
          placeholder="Örn: 1"
          disabled={isSubmitting}
          className="h-12 text-base"
        />
        {form.formState.errors.number && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.number.message}
          </p>
        )}
      </FormItem>

      <FormItem>
        <FormLabel htmlFor="maxScore">Maksimum Puan <span className="text-red-500">*</span></FormLabel>
        <Input
          id="maxScore"
          type="number"
          step="0.1"
          {...form.register("maxScore", { valueAsNumber: true })}
          placeholder="Örn: 10"
          disabled={isSubmitting}
          className="h-12 text-base"
        />
        {form.formState.errors.maxScore && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.maxScore.message}
          </p>
        )}
      </FormItem>

      <FormItem>
        <FormLabel>Öğrenme Çıktıları (ÖÇ) <span className="text-red-500">*</span></FormLabel>
        <div className="space-y-3">
          {/* Selected Outcomes Badges */}
          {selectedOutcomes.length > 0 && (
            <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
              {selectedOutcomes.map((code) => {
                const outcome = learningOutcomes.find((lo) => lo.code === code);
                return (
                  <Badge
                    key={code}
                    variant="secondary"
                    className="text-sm px-3 py-1.5 bg-[#0a294e]/10 text-[#0a294e] hover:bg-[#0a294e]/20"
                  >
                    {code}
                    <button
                      type="button"
                      onClick={() => removeLearningOutcome(code)}
                      className="ml-2 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Multi-select Popover */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full justify-between h-12 text-base",
                  selectedOutcomes.length === 0 && "text-muted-foreground"
                )}
                disabled={isSubmitting || learningOutcomes.length === 0}
              >
                <span>
                  {selectedOutcomes.length === 0
                    ? "Öğrenme çıktıları seçin (birden fazla seçebilirsiniz)"
                    : `${selectedOutcomes.length} ÖÇ seçildi`}
                </span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <div className="max-h-60 overflow-auto p-2">
                {learningOutcomes.length === 0 ? (
                  <p className="text-sm text-muted-foreground p-2 text-center">
                    Bu ders için henüz öğrenme çıktısı tanımlanmamış.
                  </p>
                ) : (
                  learningOutcomes.map((outcome) => (
                    <div
                      key={outcome.code}
                      className="flex items-start p-2 hover:bg-gray-100 cursor-pointer rounded-md"
                      onClick={() => toggleLearningOutcome(outcome.code)}
                    >
                      <Checkbox
                        checked={selectedOutcomes.includes(outcome.code)}
                        className="mt-1 mr-2"
                        readOnly
                      />
                      <div className="flex-1">
                        <Label className="text-base font-semibold text-gray-900 cursor-pointer">
                          {outcome.code}
                        </Label>
                        <p className="text-sm text-gray-600 mt-0.5">
                          {outcome.description}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </PopoverContent>
          </Popover>

          {form.formState.errors.mappedLearningOutcomes && (
            <p className="text-sm font-medium text-destructive">
              {form.formState.errors.mappedLearningOutcomes.message}
            </p>
          )}
          <p className="text-sm text-gray-500">
            Bu soru hangi öğrenme çıktılarını ölçüyor? Birden fazla seçebilirsiniz.
          </p>
        </div>
      </FormItem>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting} className="h-12 px-6">
          {isSubmitting
            ? "Kaydediliyor..."
            : mode === "create"
            ? "Soru Ekle"
            : "Soruyu Güncelle"}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-12 px-6"
          >
            İptal
          </Button>
        )}
      </div>
    </form>
  );
}

