"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  studentApi,
  type Student,
  type CreateStudentDto,
  type UpdateStudentDto,
} from "@/lib/api/studentApi";
import { departmentApi, type Department } from "@/lib/api/departmentApi";

const studentSchema = z.object({
  studentNumber: z.string().min(1, "Öğrenci numarası gereklidir"),
  name: z.string().min(1, "İsim gereklidir").min(2, "İsim en az 2 karakter olmalıdır"),
  department: z.string().optional(),
  classLevel: z.number().int().positive().max(4, "Sınıf seviyesi 1-4 arasında olmalıdır").optional().or(z.literal("")),
});

type StudentFormData = z.infer<typeof studentSchema>;

interface StudentFormProps {
  mode: "create" | "edit";
  studentId?: string;
  initialData?: Student;
  onSuccess?: () => void;
}

export function StudentForm({
  mode,
  studentId,
  initialData,
  onSuccess,
}: StudentFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const data = await departmentApi.getAll();
      setDepartments(data);
    } catch (error: any) {
      console.error("Bölümler yüklenemedi:", error);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentSchema),
    defaultValues: initialData
      ? {
          studentNumber: initialData.studentNumber,
          name: initialData.name,
          department: initialData.department || "",
          classLevel: initialData.classLevel || "",
        }
      : {
          studentNumber: "",
          name: "",
          department: "",
          classLevel: "",
        },
  });

  const onSubmit = async (data: StudentFormData) => {
    setIsSubmitting(true);
    try {
      const submitData: CreateStudentDto | UpdateStudentDto = {
        name: data.name,
        department: data.department || undefined,
        classLevel: data.classLevel && data.classLevel !== "" ? Number(data.classLevel) : undefined,
      };

      if (mode === "create") {
        await studentApi.create({
          ...submitData,
          studentNumber: data.studentNumber,
        } as CreateStudentDto);
        toast.success("Öğrenci başarıyla eklendi");
        router.push("/students");
      } else if (mode === "edit" && studentId) {
        await studentApi.update(studentId, submitData as UpdateStudentDto);
        toast.success("Öğrenci başarıyla güncellendi");
        router.push("/students");
      }
      onSuccess?.();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Öğrenci kaydedilemedi. Bir hata oluştu.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Öğrenci Numarası */}
        <FormItem>
          <FormLabel htmlFor="studentNumber" className="text-sm font-semibold text-slate-700">
            Öğrenci Numarası <span className="text-red-500">*</span>
          </FormLabel>
          <Input
            id="studentNumber"
            {...form.register("studentNumber")}
            placeholder="Örn: 2021001234"
            disabled={isSubmitting || mode === "edit"}
            className="h-10 text-sm border-2 focus:border-[#0a294e]"
          />
          {form.formState.errors.studentNumber && (
            <p className="text-sm font-medium text-destructive mt-1">
              {form.formState.errors.studentNumber.message}
            </p>
          )}
        </FormItem>

        {/* İsim */}
        <FormItem>
          <FormLabel htmlFor="name" className="text-sm font-semibold text-slate-700">
            Ad Soyad <span className="text-red-500">*</span>
          </FormLabel>
          <Input
            id="name"
            {...form.register("name")}
            placeholder="Örn: Ahmet Yılmaz"
            disabled={isSubmitting}
            className="h-10 text-sm border-2 focus:border-[#0a294e]"
          />
          {form.formState.errors.name && (
            <p className="text-sm font-medium text-destructive mt-1">
              {form.formState.errors.name.message}
            </p>
          )}
        </FormItem>

        {/* Bölüm */}
        <FormItem>
          <FormLabel htmlFor="department" className="text-sm font-semibold text-slate-700">
            Bölüm
          </FormLabel>
          {loadingDepartments ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground h-10">
              <Loader2 className="h-4 w-4 animate-spin" />
              Bölümler yükleniyor...
            </div>
          ) : (
            <>
              <Select
                id="department"
                value={form.watch("department") || ""}
                onChange={(e) => form.setValue("department", e.target.value)}
                disabled={isSubmitting}
                className="h-10 text-sm border-2 focus:border-[#0a294e]"
              >
                <option value="">Bölüm seçin (isteğe bağlı)</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept.name}>
                    {dept.name}
                  </option>
                ))}
              </Select>
              {form.formState.errors.department && (
                <p className="text-sm font-medium text-destructive mt-1">
                  {form.formState.errors.department.message}
                </p>
              )}
            </>
          )}
        </FormItem>

        {/* Sınıf Seviyesi */}
        <FormItem>
          <FormLabel htmlFor="classLevel" className="text-sm font-semibold text-slate-700">
            Sınıf Seviyesi
          </FormLabel>
          <Select
            id="classLevel"
            value={form.watch("classLevel")?.toString() || ""}
            onChange={(e) => {
              const value = e.target.value === "" ? "" : Number(e.target.value);
              form.setValue("classLevel", value as any);
            }}
            disabled={isSubmitting}
            className="h-10 text-sm border-2 focus:border-[#0a294e]"
          >
            <option value="">Sınıf seviyesi seçin (isteğe bağlı)</option>
            <option value="1">1. Sınıf</option>
            <option value="2">2. Sınıf</option>
            <option value="3">3. Sınıf</option>
            <option value="4">4. Sınıf</option>
          </Select>
          {form.formState.errors.classLevel && (
            <p className="text-sm font-medium text-destructive mt-1">
              {form.formState.errors.classLevel.message}
            </p>
          )}
        </FormItem>
      </div>

      {/* Butonlar */}
      <div className="flex gap-4 pt-4 border-t border-slate-200">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="h-11 px-6 font-semibold bg-[#0a294e] hover:bg-[#0a294e]/90 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Kaydediliyor...
            </>
          ) : mode === "create" ? (
            "Öğrenci Ekle"
          ) : (
            "Öğrenciyi Güncelle"
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="h-11 px-6"
        >
          İptal
        </Button>
      </div>
    </form>
  );
}

