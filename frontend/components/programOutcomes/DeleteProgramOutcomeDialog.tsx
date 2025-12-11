"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { programOutcomeApi } from "@/lib/api/programOutcomeApi";

interface DeleteProgramOutcomeDialogProps {
  departmentId: string;
  programOutcomeCode: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteProgramOutcomeDialog({
  departmentId,
  programOutcomeCode,
  open,
  onOpenChange,
  onSuccess,
}: DeleteProgramOutcomeDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!departmentId) {
      toast.error("Bölüm bilgisi bulunamadı");
      return;
    }
    
    setIsDeleting(true);
    try {
      await programOutcomeApi.delete(departmentId, programOutcomeCode);
      toast.success("Program çıktısı başarıyla silindi");
      onOpenChange(false);
      router.refresh();
      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Program çıktısı silinemedi. Öğrenme çıktılarında kullanılıyor olabilir.";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Program Çıktısını Sil</DialogTitle>
          <DialogDescription>
            <strong>{programOutcomeCode}</strong> program çıktısını silmek istediğinizden emin misiniz?
            <br />
            <br />
            Bu program çıktısını silmek MÜDEK eşleştirmelerini bozabilir. Bu işlem geri alınamaz.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            İptal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Siliniyor..." : "Sil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

