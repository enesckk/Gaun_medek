"use client";

import { ExamCreationWizard } from "@/components/exams/ExamCreationWizard";

export default function NewExamPage() {
  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        MÜDEK uyumlu sınav oluşturun. Adım adım sihirbaz ile kolayca sınav oluşturabilirsiniz.
      </p>
      <ExamCreationWizard />
    </div>
  );
}

