"use client";

import Link from "next/link";
import { Edit, Trash2, Calendar, Users, Target, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Course } from "@/lib/api/courseApi";

interface CourseCardProps {
  course: Course;
  onDelete: (course: Course) => void;
}

export function CourseCard({ course, onDelete }: CourseCardProps) {
  const semester = course.semester || "-";
  const departmentName = (course as any).department?.name || (typeof (course as any).department === "string" ? (course as any).department : "(Eski kayıt – bölüm seçilmemiş)");
  const learningOutcomeCount = course.learningOutcomes?.length || 0;
  const studentCount = course.students?.length || 0;
  const examCount = course.examCount || 0;
  const midtermExams = course.midtermExams || [];
  const finalExams = course.finalExams || [];
  const updatedAt = course.updatedAt
    ? new Date(course.updatedAt).toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";

  // Show exams if there are any
  const hasExams = examCount > 0;

  return (
    <Card className="rounded-xl shadow-sm hover:shadow-lg transition-all border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 h-full flex flex-col min-w-0">
      <CardContent className="p-4 sm:p-6 flex flex-col flex-1 min-w-0">
        <div className="space-y-4 sm:space-y-5 flex-1 min-w-0">
          {/* Course Header */}
          <div className="pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 break-words">
              {course.name}
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-semibold break-words">
              {course.code}
            </p>
          </div>

          {/* Course Details - Better Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="flex items-start gap-2 sm:gap-3 min-w-0">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Dönem</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate" title={semester}>
                  {semester}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3 min-w-0">
              <Target className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Öğrenme Çıktısı</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {learningOutcomeCount} adet
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3 min-w-0">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Öğrenci</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {studentCount} kişi
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3 min-w-0">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Sınav</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  {examCount} adet
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 sm:gap-3 min-w-0">
              <div className="h-4 w-4 sm:h-5 sm:w-5 text-slate-500 dark:text-slate-400 mt-0.5 flex-shrink-0 flex items-center justify-center">
                <span className="text-xs sm:text-sm">🏛️</span>
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Bölüm</p>
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate" title={departmentName}>
                  {departmentName}
                </p>
              </div>
            </div>
          </div>

          {/* Exam Codes - Show all exams */}
          {hasExams && (
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              {midtermExams.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap font-medium">Vize:</span>
                  {midtermExams.map((exam, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs px-1.5 sm:px-2 py-0.5 h-5 whitespace-nowrap">
                      {exam.examCode}
                    </Badge>
                  ))}
                </div>
              )}
              {finalExams.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap font-medium">Final:</span>
                  {finalExams.map((exam, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs px-1.5 sm:px-2 py-0.5 h-5 whitespace-nowrap">
                      {exam.examCode}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons - Responsive */}
          <div className="flex flex-col sm:flex-row gap-2 pt-3 sm:pt-4 border-t border-slate-200 dark:border-slate-700 mt-auto">
            <Button
              asChild
              variant="default"
              size="default"
              className="flex-1 h-10 sm:h-11 text-sm sm:text-base font-semibold bg-[#0a294e] hover:bg-[#0a294e]/90 min-w-0"
            >
              <Link href={`/dashboard/courses/${course._id}`} className="flex items-center justify-center min-w-0">
                <FileText className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Detay</span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="default"
              className="flex-1 h-10 sm:h-11 text-sm sm:text-base font-semibold min-w-0"
            >
              <Link href={`/dashboard/courses/edit/${course._id}`} className="flex items-center justify-center min-w-0">
                <Edit className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 flex-shrink-0" />
                <span className="truncate">Düzenle</span>
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="default"
              onClick={() => onDelete(course)}
              className="h-10 sm:h-11 text-sm sm:text-base font-semibold px-3 sm:px-4 flex-shrink-0"
            >
              <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

