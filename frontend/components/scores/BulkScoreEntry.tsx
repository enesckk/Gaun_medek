"use client";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Save, Loader2, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { examApi, type Exam } from "@/lib/api/examApi";
import { courseApi, type Course } from "@/lib/api/courseApi";
import { questionApi, type Question } from "@/lib/api/questionApi";
import { scoreApi, type SubmitScoreDto } from "@/lib/api/scoreApi";
import { studentApi, type Student } from "@/lib/api/studentApi";

interface BulkScoreEntryProps {
  examId: string;
  onUpdate?: () => void;
}

type ScoreMatrix = Record<string, Record<string, number | "">>; // studentId -> questionId -> score

export function BulkScoreEntry({ examId, onUpdate }: BulkScoreEntryProps) {
  const [exam, setExam] = useState<Exam | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<ScoreMatrix>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (examId) {
      loadData();
    }
  }, [examId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [examData, questionsData] = await Promise.all([
        examApi.getById(examId),
        questionApi.getByExam(examId),
      ]);

      setExam(examData);
      setQuestions(questionsData.sort((a, b) => a.number - b.number));

      // Load course and students
      const courseData = await courseApi.getById(examData.courseId);
      setCourse(courseData);

      // Get students from course
      const courseStudents = courseData.students || [];
      const studentNumbers = courseStudents.map((s) => s.studentNumber);
      const allStudents = await studentApi.getAll();
      const relevantStudents = allStudents
        .filter((s) => studentNumbers.includes(s.studentNumber))
        .sort((a, b) => a.studentNumber.localeCompare(b.studentNumber));
      setStudents(relevantStudents);

      // Load existing scores
      const existingScores = await scoreApi.getByExam(examId);
      const scoreMatrix: ScoreMatrix = {};
      
      relevantStudents.forEach((student) => {
        scoreMatrix[student._id] = {};
        questionsData.forEach((question) => {
          const existingScore = existingScores.find(
            (s) =>
              (typeof s.studentId === "string"
                ? s.studentId
                : s.studentId._id) === student._id &&
              (typeof s.questionId === "string"
                ? s.questionId
                : s.questionId._id) === question._id
          );
          scoreMatrix[student._id][question._id] = existingScore
            ? existingScore.scoreValue
            : "";
        });
      });

      setScores(scoreMatrix);
    } catch (error: any) {
      toast.error("Veriler yüklenirken hata oluştu");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleScoreChange = (
    studentId: string,
    questionId: string,
    value: string
  ) => {
    setHasChanges(true);
    setScores((prev) => {
      const newScores = { ...prev };
      if (!newScores[studentId]) {
        newScores[studentId] = {};
      }
      const numValue = value === "" ? "" : parseFloat(value);
      newScores[studentId][questionId] =
        numValue === "" ? "" : isNaN(numValue as number) ? "" : numValue;
      return newScores;
    });
  };

  const getQuestionMaxScore = (questionId: string): number => {
    const question = questions.find((q) => q._id === questionId);
    return question?.maxScore || exam?.maxScorePerQuestion || 0;
  };

  const validateScores = (): boolean => {
    for (const studentId of Object.keys(scores)) {
      for (const questionId of Object.keys(scores[studentId])) {
        const score = scores[studentId][questionId];
        if (score !== "") {
          const numScore = score as number;
          const maxScore = getQuestionMaxScore(questionId);
          if (numScore < 0 || numScore > maxScore) {
            toast.error(
              `Geçersiz puan: Soru ${questions.find((q) => q._id === questionId)?.number} için maksimum ${maxScore} olabilir`
            );
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateScores()) return;

    setIsSaving(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      const savePromises: Promise<void>[] = [];

      for (const studentId of Object.keys(scores)) {
        for (const questionId of Object.keys(scores[studentId])) {
          const score = scores[studentId][questionId];
          if (score !== "") {
            const savePromise = scoreApi
              .submit({
                studentId,
                examId,
                questionId,
                scoreValue: score as number,
              } as SubmitScoreDto)
              .then(() => {
                successCount++;
              })
              .catch((error) => {
                errorCount++;
                console.error("Puan kaydedilemedi:", error);
              });
            savePromises.push(savePromise);
          }
        }
      }

      await Promise.all(savePromises);

      if (errorCount === 0) {
        toast.success(`${successCount} puan başarıyla kaydedildi`);
        setHasChanges(false);
        onUpdate?.();
      } else {
        toast.warning(
          `${successCount} puan kaydedildi, ${errorCount} puan kaydedilemedi`
        );
      }
    } catch (error: any) {
      toast.error("Puanlar kaydedilirken hata oluştu");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0a294e] mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Veriler yükleniyor...</p>
        </CardContent>
      </Card>
    );
  }

  if (!exam || questions.length === 0 || students.length === 0) {
    return (
      <Card className="border-yellow-200">
        <CardContent className="p-8 text-center">
          <p className="text-lg text-muted-foreground">
            Bu sınav için soru veya öğrenci bulunamadı.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-[#0a294e]/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Grid3x3 className="h-6 w-6 text-[#0a294e]" />
            <div>
              <CardTitle className="text-2xl">Toplu Puan Girişi</CardTitle>
              <CardDescription className="text-base mt-1">
                {students.length} öğrenci × {questions.length} soru matrisi
              </CardDescription>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className="h-11 px-5 bg-green-600 hover:bg-green-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Tümünü Kaydet
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="border-2 border-gray-200">
            <TableHeader>
              <TableRow className="bg-[#0a294e] text-white">
                <TableHead className="sticky left-0 z-10 bg-[#0a294e] text-white font-semibold min-w-[200px]">
                  Öğrenci
                </TableHead>
                {questions.map((question) => (
                  <TableHead
                    key={question._id}
                    className="text-center font-semibold min-w-[120px]"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <span>Soru {question.number}</span>
                      <Badge variant="outline" className="bg-white text-xs">
                        Max: {question.maxScore}
                      </Badge>
                    </div>
                  </TableHead>
                ))}
                <TableHead className="text-center font-semibold min-w-[100px]">
                  Toplam
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => {
                const studentScores = scores[student._id] || {};
                const totalScore = Object.values(studentScores).reduce(
                  (sum, score) => {
                    if (typeof score === "number") {
                      return sum + score;
                    }
                    return sum;
                  },
                  0
                );
                const maxTotal = questions.reduce(
                  (sum, q) => sum + q.maxScore,
                  0
                );

                return (
                  <TableRow key={student._id} className="hover:bg-gray-50">
                    <TableCell className="sticky left-0 z-10 bg-white font-semibold border-r-2 border-gray-200">
                      <div>
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.studentNumber}
                        </p>
                      </div>
                    </TableCell>
                    {questions.map((question) => {
                      const score = studentScores[question._id] || "";
                      const maxScore = question.maxScore;
                      const isValid =
                        score === "" ||
                        (typeof score === "number" &&
                          score >= 0 &&
                          score <= maxScore);

                      return (
                        <TableCell key={question._id} className="p-2">
                          <Input
                            type="number"
                            step="0.1"
                            min="0"
                            max={maxScore}
                            value={score}
                            onChange={(e) =>
                              handleScoreChange(
                                student._id,
                                question._id,
                                e.target.value
                              )
                            }
                            className={`h-10 text-center text-sm ${
                              isValid
                                ? "border-gray-300"
                                : "border-red-500 bg-red-50"
                            }`}
                            placeholder="0"
                          />
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center font-semibold border-l-2 border-gray-200">
                      <div>
                        <p
                          className={`text-lg ${
                            totalScore > 0 ? "text-green-600" : "text-gray-400"
                          }`}
                        >
                          {totalScore.toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          / {maxTotal}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Kullanım:</strong> Her hücreye öğrencinin ilgili sorudan aldığı puanı girin.
            Maksimum puanlar soru başlıklarında gösterilir. Değişiklikleri kaydetmek için "Tümünü Kaydet" butonuna tıklayın.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

