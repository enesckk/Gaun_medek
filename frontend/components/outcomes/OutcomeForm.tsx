"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  learningOutcomeApi,
  type LearningOutcome,
  type CreateLearningOutcomeDto,
  type UpdateLearningOutcomeDto,
} from "@/lib/api/learningOutcomeApi";
import { courseApi } from "@/lib/api/courseApi";

const outcomeSchema = z.object({
  courseId: z.string().min(1, "Ders seçimi gereklidir"),
  code: z.string().min(1, "ÖÇ kodu gereklidir"),
  description: z.string().min(1, "Açıklama gereklidir"),
});

type OutcomeFormData = z.infer<typeof outcomeSchema>;

interface OutcomeFormProps {
  mode: "create" | "edit";
  outcomeId?: string;
  initialData?: LearningOutcome;
  onSuccess?: () => void;
}

export function OutcomeForm({
  mode,
  outcomeId,
  initialData,
  onSuccess,
}: OutcomeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [existingOutcomes, setExistingOutcomes] = useState<LearningOutcome[]>([]);

  const form = useForm<OutcomeFormData>({
    resolver: zodResolver(outcomeSchema),
    defaultValues: initialData
      ? {
          courseId: initialData.courseId,
          code: initialData.code,
          description: initialData.description,
        }
      : {
          courseId: "",
          code: "",
          description: "",
        },
  });

  const selectedCourseId = form.watch("courseId");
  const enteredCode = form.watch("code");

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId && mode === "create") {
      fetchExistingOutcomes(selectedCourseId);
    } else if (initialData?.courseId) {
      fetchExistingOutcomes(initialData.courseId);
    }
  }, [selectedCourseId, initialData?.courseId, mode]);

  const fetchCourses = async () => {
    try {
      const data = await courseApi.getAll();
      setCourses(data);
    } catch (error) {
      toast.error("Dersler yüklenemedi");
    }
  };

  const fetchExistingOutcomes = async (courseId: string) => {
    try {
      const outcomes = await learningOutcomeApi.getByCourse(courseId);
      setExistingOutcomes(outcomes);
    } catch (error) {
      // Course might not have outcomes yet, that's okay
      setExistingOutcomes([]);
    }
  };

  const onSubmit = async (data: OutcomeFormData) => {
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await learningOutcomeApi.create(data as CreateLearningOutcomeDto);
        toast.success("Öğrenme çıktısı başarıyla oluşturuldu");
        router.push("/outcomes");
      } else if (mode === "edit" && outcomeId) {
        await learningOutcomeApi.update(outcomeId, data as UpdateLearningOutcomeDto);
        toast.success("Öğrenme çıktısı başarıyla güncellendi");
        router.push("/outcomes");
      }
      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Öğrenme çıktısı kaydedilemedi";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormItem>
        <FormLabel htmlFor="courseId">Ders <span className="text-destructive">*</span></FormLabel>
        <select
          id="courseId"
          {...form.register("courseId")}
          disabled={isSubmitting || mode === "edit"}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Ders seçin</option>
          {courses.map((course) => (
            <option key={course._id} value={course._id}>
              {course.code} - {course.name}
            </option>
          ))}
        </select>
        {form.formState.errors.courseId && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.courseId.message}
          </p>
        )}
      </FormItem>

      <FormItem>
        <FormLabel htmlFor="code">ÖÇ Kodu <span className="text-destructive">*</span></FormLabel>
        <Input
          id="code"
          {...form.register("code", {
            validate: (value) => {
              if (!value || !value.trim()) {
                return "ÖÇ kodu gereklidir";
              }
              if (selectedCourseId && mode === "create") {
                const normalizedCode = value.trim();
                const duplicate = existingOutcomes.find(
                  (outcome) => outcome.code.trim() === normalizedCode
                );
                if (duplicate) {
                  return `"${normalizedCode}" kodu bu ders için zaten mevcut. Aynı ders içinde aynı ÖÇ kodu kullanılamaz.`;
                }
              }
              if (selectedCourseId && mode === "edit" && outcomeId) {
                const normalizedCode = value.trim();
                const duplicate = existingOutcomes.find(
                  (outcome) => outcome.code.trim() === normalizedCode && outcome._id !== outcomeId
                );
                if (duplicate) {
                  return `"${normalizedCode}" kodu bu ders için zaten mevcut. Aynı ders içinde aynı ÖÇ kodu kullanılamaz.`;
                }
              }
              return true;
            },
          })}
          placeholder="Örn: ÖÇ1"
          disabled={isSubmitting}
        />
        {form.formState.errors.code && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.code.message}
          </p>
        )}
        {selectedCourseId && enteredCode && existingOutcomes.length > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            Bu ders için mevcut ÖÇ kodları: {existingOutcomes.map(lo => lo.code).join(", ")}
          </p>
        )}
      </FormItem>

      <FormItem>
        <FormLabel htmlFor="description">Açıklama <span className="text-destructive">*</span></FormLabel>
        <Textarea
          id="description"
          {...form.register("description")}
          placeholder="Öğrenme çıktısı açıklaması..."
          rows={4}
          disabled={isSubmitting}
        />
        {form.formState.errors.description && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.description.message}
          </p>
        )}
      </FormItem>

      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Kaydediliyor..."
            : mode === "create"
            ? "Öğrenme Çıktısı Oluştur"
            : "Öğrenme Çıktısını Güncelle"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          İptal
        </Button>
      </div>
    </form>
  );
}



