"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  programOutcomeApi,
  type ProgramOutcome,
  type CreateProgramOutcomeDto,
  type UpdateProgramOutcomeDto,
} from "@/lib/api/programOutcomeApi";

const programOutcomeSchema = z.object({
  code: z.string().min(2, "Code must be at least 2 characters"),
  description: z.string().min(1, "Description is required"),
});

type ProgramOutcomeFormData = z.infer<typeof programOutcomeSchema>;

interface ProgramOutcomeFormProps {
  mode: "create" | "edit";
  programOutcomeId?: string;
  initialData?: ProgramOutcome;
  onSuccess?: () => void;
}

export function ProgramOutcomeForm({
  mode,
  programOutcomeId,
  initialData,
  onSuccess,
}: ProgramOutcomeFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProgramOutcomeFormData>({
    resolver: zodResolver(programOutcomeSchema),
    defaultValues: initialData
      ? {
          code: initialData.code,
          description: initialData.description,
        }
      : {
          code: "",
          description: "",
        },
  });

  const onSubmit = async (data: ProgramOutcomeFormData) => {
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        await programOutcomeApi.create(data as CreateProgramOutcomeDto);
        toast.success("Program Outcome saved");
        router.push("/program-outcomes");
      } else if (mode === "edit" && programOutcomeId) {
        await programOutcomeApi.update(programOutcomeId, data as UpdateProgramOutcomeDto);
        toast.success("Program Outcome saved");
        router.push("/program-outcomes");
      }
      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to save program outcome";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <FormItem>
        <FormLabel htmlFor="code">Code *</FormLabel>
        <Input
          id="code"
          {...form.register("code")}
          placeholder="e.g., PO1, PO2"
          disabled={isSubmitting}
        />
        {form.formState.errors.code && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.code.message}
          </p>
        )}
      </FormItem>

      <FormItem>
        <FormLabel htmlFor="description">Description *</FormLabel>
        <Textarea
          id="description"
          {...form.register("description")}
          placeholder="Program outcome description..."
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
            ? "Saving..."
            : mode === "create"
            ? "Create Program Outcome"
            : "Update Program Outcome"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

