"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StudentForm } from "@/components/students/StudentForm";
import { UserPlus } from "lucide-react";

export default function NewStudentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[#0a294e] rounded-lg">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Yeni Öğrenci Ekle</h1>
          </div>
          <p className="text-muted-foreground text-base ml-14">
            Sisteme yeni bir öğrenci ekleyin. Zorunlu alanlar <span className="text-red-500">*</span> ile işaretlenmiştir.
          </p>
        </div>

        {/* Form Card */}
        <Card className="border-2 border-slate-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <CardTitle className="text-xl text-slate-900">Öğrenci Bilgileri</CardTitle>
            <CardDescription className="text-sm">
              Öğrenci bilgilerini eksiksiz doldurun. Öğrenci numarası benzersiz olmalıdır.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <StudentForm mode="create" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

