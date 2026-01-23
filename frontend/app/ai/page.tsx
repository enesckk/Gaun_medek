"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileUploadCard } from "@/components/ai/FileUploadCard";
import { ProcessingStatusCard } from "@/components/ai/ProcessingStatusCard";
import { aiApi } from "@/lib/api/aiApi";

export default function AIPage() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);

  const handleFileSelect = async (file: File) => {
    setIsProcessing(true);
    setProgress(0);

    try {
      // İlerleme simülasyonu
      setProgress(10);
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      setProgress(30);
      await new Promise((resolve) => setTimeout(resolve, 400));
      
      setProgress(50);
      await new Promise((resolve) => setTimeout(resolve, 600));
      
      setProgress(70);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Gerçek API çağrısı
      const response = await aiApi.process(file);

      setProgress(100);
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Store response in localStorage for preview page
      localStorage.setItem(`ai_session_${response.sessionId}`, JSON.stringify(response));

      // Redirect to preview page
      router.push(`/ai/preview?sessionId=${response.sessionId}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Belge işlenirken hata oluştu");
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Otomatik puanlama için sınav belgelerini yükleyin
      </p>

      {!isProcessing ? (
        <FileUploadCard onFileSelect={handleFileSelect} />
      ) : (
        <ProcessingStatusCard progress={progress} />
      )}
    </div>
  );
}

