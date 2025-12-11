"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X, Plus, Trash2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { courseApi } from "@/lib/api/courseApi";
import { departmentApi, type Department } from "@/lib/api/departmentApi";
import { ExamSettingsComponent, type ExamSettings } from "@/components/courses/ExamSettings";
import { StudentImporter, type Student } from "@/components/courses/StudentImporter";
import { OutcomeEditor } from "@/components/courses/OutcomeEditor";

interface LearningOutcome {
  code: string;
  description: string;
  programOutcomes?: string[];
}

interface CreateCourseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateCourseModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateCourseModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [semester, setSemester] = useState("");
  const [learningOutcomes, setLearningOutcomes] = useState<LearningOutcome[]>([
    { code: "ÖÇ1", description: "", programOutcomes: [] },
  ]);
  const [midtermExam, setMidtermExam] = useState<ExamSettings>({
    examCode: "01",
    questionCount: 10,
    maxScorePerQuestion: 10,
  });
  const [finalExam, setFinalExam] = useState<ExamSettings>({
    examCode: "02",
    questionCount: 10,
    maxScorePerQuestion: 10,
  });
  const [students, setStudents] = useState<Student[]>([]);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const data = await departmentApi.getAll();
      
      // Eğer bölüm yoksa, otomatik seed yap
      if (!data || data.length === 0) {
        try {
          await departmentApi.seed();
          // Seed sonrası tekrar yükle
          const seededData = await departmentApi.getAll();
          setDepartments(seededData || []);
          toast.success("Bölümler otomatik olarak yüklendi");
        } catch (seedError: any) {
          console.error("Bölüm seed hatası:", seedError);
          // Seed başarısız olursa boş bırak
          setDepartments([]);
        }
      } else {
        setDepartments(data);
      }
    } catch (error: any) {
      console.error("Bölümler yüklenirken hata:", error);
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const resetForm = () => {
    setName("");
    setCode("");
    setDescription("");
    setDepartmentId("");
    setSemester("");
    setLearningOutcomes([{ code: "ÖÇ1", description: "", programOutcomes: [] }]);
    setMidtermExam({
      examCode: "01",
      questionCount: 10,
      maxScorePerQuestion: 10,
    });
    setFinalExam({
      examCode: "02",
      questionCount: 10,
      maxScorePerQuestion: 10,
    });
    setStudents([]);
    setErrors({});
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onOpenChange(false);
    }
  };


  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Ders adı gereklidir";
    } else if (name.trim().length < 3) {
      newErrors.name = "Ders adı en az 3 karakter olmalıdır";
    }

    if (!code.trim()) {
      newErrors.code = "Ders kodu gereklidir";
    } else if (code.trim().length < 2) {
      newErrors.code = "Ders kodu en az 2 karakter olmalıdır";
    } else if (!/^[A-Z0-9]+$/.test(code.trim().toUpperCase())) {
      newErrors.code = "Ders kodu sadece büyük harf ve rakam içermelidir";
    }

    if (!departmentId) {
      newErrors.departmentId = "Bölüm seçimi gereklidir";
    }

    // Validate learning outcomes
    const validOutcomes = learningOutcomes.filter(
      (lo) => lo.code.trim() && lo.description.trim()
    );

    if (validOutcomes.length === 0) {
      newErrors.learningOutcomes = "En az bir öğrenme çıktısı (ÖÇ) eklemelisiniz";
    }

    // Validate each learning outcome
    learningOutcomes.forEach((lo, index) => {
      if (lo.code.trim() && !lo.description.trim()) {
        newErrors[`lo_${index}_description`] = "Açıklama gereklidir";
      }
      if (!lo.code.trim() && lo.description.trim()) {
        newErrors[`lo_${index}_code`] = "Kod gereklidir";
      }
    });

    // Exam Settings Validation
    if (!midtermExam.examCode.trim()) {
      newErrors.midtermExamCode = "Vize sınav kodu gereklidir";
    } else if (!/^\d{2}$/.test(midtermExam.examCode.trim())) {
      newErrors.midtermExamCode = "Vize sınav kodu 2 haneli sayı olmalıdır";
    }
    if (!midtermExam.questionCount || midtermExam.questionCount < 1) {
      newErrors.midtermQuestionCount = "Vize soru sayısı en az 1 olmalıdır";
    }
    if (!midtermExam.maxScorePerQuestion || midtermExam.maxScorePerQuestion <= 0) {
      newErrors.midtermMaxScore = "Vize soru başına maksimum puan gereklidir";
    }

    if (!finalExam.examCode.trim()) {
      newErrors.finalExamCode = "Final sınav kodu gereklidir";
    } else if (!/^\d{2}$/.test(finalExam.examCode.trim())) {
      newErrors.finalExamCode = "Final sınav kodu 2 haneli sayı olmalıdır";
    }
    if (!finalExam.questionCount || finalExam.questionCount < 1) {
      newErrors.finalQuestionCount = "Final soru sayısı en az 1 olmalıdır";
    }
    if (!finalExam.maxScorePerQuestion || finalExam.maxScorePerQuestion <= 0) {
      newErrors.finalMaxScore = "Final soru başına maksimum puan gereklidir";
    }

    if (midtermExam.examCode === finalExam.examCode && midtermExam.examCode) {
      newErrors.examCodeMatch = "Vize ve Final sınav kodları farklı olmalıdır";
      newErrors.midtermExamCode = "Vize ve Final sınav kodları farklı olmalıdır";
      newErrors.finalExamCode = "Vize ve Final sınav kodları farklı olmalıdır";
    }

    // Students Validation
    if (students.length === 0) {
      newErrors.students = "En az bir öğrenci eklemelisiniz";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Lütfen formdaki hataları düzeltin");
      return;
    }

    setIsLoading(true);

    try {
      // Filter valid learning outcomes
      const validOutcomes = learningOutcomes.filter(
        (lo) => lo.code.trim() && lo.description.trim()
      );

      // Prepare data with required fields for backend
      const courseData = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim() || undefined,
        departmentId: departmentId,
        semester: semester.trim() || undefined,
        learningOutcomes: validOutcomes.map((lo) => ({
          code: lo.code.trim(),
          description: lo.description.trim(),
          programOutcomes: lo.programOutcomes || [],
        })),
        midtermExam: {
          examCode: midtermExam.examCode.trim(),
          questionCount: midtermExam.questionCount,
          maxScorePerQuestion: midtermExam.maxScorePerQuestion,
        },
        finalExam: {
          examCode: finalExam.examCode.trim(),
          questionCount: finalExam.questionCount,
          maxScorePerQuestion: finalExam.maxScorePerQuestion,
        },
        students: students.map((s) => ({
          studentNumber: s.studentNumber.trim(),
          fullName: s.fullName.trim(),
        })),
      };

      await courseApi.createCourse(courseData);

      toast.success("Ders başarıyla oluşturuldu");
      handleClose();
      onSuccess?.();
      router.refresh();
    } catch (error: any) {
      console.error("Course creation error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Ders kaydedilemedi. Bir hata oluştu.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose} size="full">
      <DialogContent
        onClose={handleClose}
        className="max-h-[90vh] h-[90vh] overflow-y-auto"
      >
        <DialogHeader className="pb-3">
          <DialogTitle className="text-base">Yeni Ders Oluştur</DialogTitle>
          <DialogDescription className="text-sm">
            Yeni bir ders eklemek için aşağıdaki bilgileri doldurun.{" "}
            <span className="text-destructive">*</span> ile işaretli alanlar
            zorunludur.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">
              Temel Bilgiler
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm">
                  Ders Adı <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Örn: Veri Yapıları"
                  disabled={isLoading}
                  className={`h-10 text-sm ${errors.name ? "border-destructive" : ""}`}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-sm">
                  Ders Kodu <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                  }
                  placeholder="Örn: CS201"
                  disabled={isLoading}
                  className={`h-10 text-sm ${errors.code ? "border-destructive" : ""}`}
                />
                {errors.code && (
                  <p className="text-xs text-destructive">{errors.code}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="departmentId" className="text-sm">
                  Bölüm <span className="text-destructive">*</span>
                </Label>
                <Select
                  id="departmentId"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  disabled={isLoading || loadingDepartments}
                  className={`h-10 text-sm ${errors.departmentId ? "border-destructive" : ""}`}
                >
                  <option value="">
                    {loadingDepartments 
                      ? "Yükleniyor..." 
                      : departments.length === 0
                      ? "Bölüm bulunamadı - yükleniyor..."
                      : "Bölüm seçin"}
                  </option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name} {dept.code ? `(${dept.code})` : ""}
                    </option>
                  ))}
                </Select>
                {errors.departmentId && (
                  <p className="text-xs text-destructive">{errors.departmentId}</p>
                )}
                {!loadingDepartments && departments.length === 0 && (
                  <p className="text-xs text-muted-foreground">
                    Bölümler yüklenemedi. Lütfen sayfayı yenileyin veya backend'i kontrol edin.
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="semester" className="text-sm">Dönem</Label>
                <Input
                  id="semester"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="Örn: Güz 2024"
                  disabled={isLoading}
                  className="h-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description" className="text-sm">Açıklama</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ders hakkında açıklama..."
                rows={2}
                disabled={isLoading}
                className="text-sm"
              />
            </div>
          </div>

          {/* Learning Outcomes */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">
              Öğrenme Çıktıları (ÖÇ){" "}
              <span className="text-destructive">*</span>
            </h3>
            <div className="max-h-[300px] overflow-y-auto pr-2">
              <OutcomeEditor
                outcomes={learningOutcomes}
                onChange={setLearningOutcomes}
                departmentId={departmentId}
                errors={errors}
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Exam Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">
              Sınav Ayarları <span className="text-destructive">*</span>
            </h3>
            <ExamSettingsComponent
              midterm={midtermExam}
              final={finalExam}
              onMidtermChange={setMidtermExam}
              onFinalChange={setFinalExam}
              errors={errors}
              disabled={isLoading}
            />
          </div>

          {/* Student List */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">
              Öğrenci Listesi <span className="text-destructive">*</span>
            </h3>
            <div className="max-h-[300px] overflow-y-auto pr-2">
              <StudentImporter
                students={students}
                onChange={setStudents}
                errors={errors}
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                "Ders Oluştur"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

