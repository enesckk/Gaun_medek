"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { programOutcomeApi, type ProgramOutcome } from "@/lib/api/programOutcomeApi";

const programOutcomeSchema = z.object({
  code: z.string().min(1, "PÇ kodu gereklidir"),
  description: z.string().min(1, "Açıklama gereklidir"),
});

type ProgramOutcomeFormData = z.infer<typeof programOutcomeSchema>;

interface EditProgramOutcomeDialogProps {
  departmentId: string;
  programOutcome: ProgramOutcome;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditProgramOutcomeDialog({
  departmentId,
  programOutcome,
  open,
  onOpenChange,
  onSuccess,
}: EditProgramOutcomeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const oldCode = programOutcome.code;

  const form = useForm<ProgramOutcomeFormData>({
    resolver: zodResolver(programOutcomeSchema),
    defaultValues: {
      code: programOutcome.code,
      description: programOutcome.description,
    },
  });

  useEffect(() => {
    if (open && programOutcome) {
      form.reset({
        code: programOutcome.code,
        description: programOutcome.description,
      });
    }
  }, [open, programOutcome, form]);

  const onSubmit = async (data: ProgramOutcomeFormData) => {
    if (!departmentId) {
      toast.error("Bölüm bilgisi bulunamadı");
      return;
    }

    setIsSubmitting(true);
    try {
      // Get current program outcomes
      const currentPOs = await programOutcomeApi.getByDepartment(departmentId);
      
      // Update the specific PO
      const updatedPOs = currentPOs.map((po) => {
        if (po.code === oldCode) {
          return {
            code: data.code.trim(),
            description: data.description.trim(),
          };
        }
        return po;
      });

      // Update all program outcomes
      await programOutcomeApi.update(departmentId, updatedPOs);
      toast.success("Program çıktısı başarıyla güncellendi");
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Program çıktısı güncellenemedi";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Program Çıktısını Düzenle</DialogTitle>
          <DialogDescription>
            Program çıktısı bilgilerini güncelleyin. <span className="text-red-500">*</span> işaretli alanlar zorunludur.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-po-code" className="text-sm font-medium">
              PÇ Kodu <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-po-code"
              {...form.register("code")}
              placeholder="Örn: PÇ1"
              disabled={isSubmitting}
              className="h-10 text-sm"
              onChange={(e) => form.setValue("code", e.target.value.toUpperCase())}
            />
            {form.formState.errors.code && (
              <p className="text-xs text-red-600">
                {form.formState.errors.code.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-po-description" className="text-sm font-medium">
              Açıklama <span className="text-red-500">*</span>
            </Label>
            <Input
              id="edit-po-description"
              {...form.register("description")}
              placeholder="Örn: Matematiksel analiz yapabilme"
              disabled={isSubmitting}
              className="h-10 text-sm"
            />
            {form.formState.errors.description && (
              <p className="text-xs text-red-600">
                {form.formState.errors.description.message}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Güncelleniyor..." : "Güncelle"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


