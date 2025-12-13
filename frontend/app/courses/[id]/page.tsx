"use client";

export const dynamic = 'force-dynamic';

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CourseForm } from "@/components/courses/CourseForm";
import { courseApi, type Course } from "@/lib/api/courseApi";
import { Loader2, BookOpen } from "lucide-react";

export default function EditCoursePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    try {
      setIsLoading(true);
      const data = await courseApi.getById(courseId);
      setCourse(data);
    } catch (error: any) {
      toast.error("Ders yüklenemedi");
      console.error("Failed to load course:", error);
      router.push("/courses");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Ders Düzenle</h2>
              <p className="text-muted-foreground">Ders bilgileri yükleniyor...</p>
            </div>
          </div>
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Ders Düzenle</h2>
            <p className="text-muted-foreground">
              Ders bilgilerini güncelleyin
            </p>
          </div>
        </div>

        <Card className="rounded-xl shadow-sm">
          <CardHeader>
            <CardTitle>Ders Bilgileri</CardTitle>
            <CardDescription>
              Aşağıdaki alanları düzenleyin. <span className="text-destructive">*</span> ile işaretli alanlar zorunludur.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <CourseForm mode="edit" courseId={courseId} initialData={course} />
          </CardContent>
        </Card>
    </div>
  );
}

