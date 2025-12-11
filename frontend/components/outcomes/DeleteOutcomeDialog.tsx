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
import { learningOutcomeApi } from "@/lib/api/learningOutcomeApi";

interface DeleteOutcomeDialogProps {
  outcomeId: string;
  outcomeCode: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function DeleteOutcomeDialog({
  outcomeId,
  outcomeCode,
  open,
  onOpenChange,
  onSuccess,
}: DeleteOutcomeDialogProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await learningOutcomeApi.remove(outcomeId);
      toast.success("Öğrenme çıktısı başarıyla silindi");
      onOpenChange(false);
      router.refresh();
      // Dispatch custom event to notify other pages (like courses page) to refresh
      window.dispatchEvent(new CustomEvent('learningOutcomeDeleted'));
      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Öğrenme çıktısı silinemedi. Sınav sorularında kullanılıyor olabilir.";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)}>
        <DialogHeader>
          <DialogTitle>Öğrenme Çıktısını Sil</DialogTitle>
          <DialogDescription>
            <strong>{outcomeCode}</strong> öğrenme çıktısını silmek istediğinizden emin misiniz?
            <br />
            <br />
            Bu öğrenme çıktısını silmek MÜDEK eşleştirmelerini bozabilir. Bu işlem geri alınamaz.
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






