"use client";

import { useState, useEffect } from "react";
import { User, AlertCircle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { studentApi, type Student } from "@/lib/api/studentApi";
import { examApi, type Exam } from "@/lib/api/examApi";

interface StudentDetectionCardProps {
  studentNumber: string;
  examId: string;
  onStudentChange?: (studentId: string) => void;
  onExamChange?: (examId: string) => void;
}

export function StudentDetectionCard({
  studentNumber,
  examId,
  onStudentChange,
  onExamChange,
}: StudentDetectionCardProps) {
  const [student, setStudent] = useState<Student | null>(null);
  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [studentNotFound, setStudentNotFound] = useState(false);
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [showStudentSelect, setShowStudentSelect] = useState(false);

  useEffect(() => {
    fetchData();
  }, [studentNumber, examId]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch student
      try {
        const studentData = await studentApi.getByNumber(studentNumber);
        setStudent(studentData);
        setStudentNotFound(false);
        onStudentChange?.(studentData._id);
      } catch (error) {
        setStudent(null);
        setStudentNotFound(true);
        // Fetch all students for manual selection
        const students = await studentApi.getAll();
        setAllStudents(students);
      }

      // Fetch exam
      try {
        const examData = await examApi.getById(examId);
        setExam(examData);
        onExamChange?.(examId);
      } catch (error) {
        setExam(null);
      }
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentSelect = (selectedStudent: Student) => {
    setStudent(selectedStudent);
    setStudentNotFound(false);
    setShowStudentSelect(false);
    onStudentChange?.(selectedStudent._id);
  };

  if (isLoading) {
    return (
      <Card className="rounded-xl shadow-sm">
        <CardHeader>
          <CardTitle>Student Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Student Information
        </CardTitle>
        <CardDescription>Detected student and exam information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Student Number</span>
            {studentNotFound ? (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Not found
              </Badge>
            ) : student ? (
              <Badge variant="default" className="flex items-center gap-1 bg-green-500">
                <CheckCircle2 className="h-3 w-3" />
                Verified
              </Badge>
            ) : null}
          </div>
          <p className="text-lg font-semibold">{studentNumber}</p>
        </div>

        {student ? (
          <div className="space-y-2">
            <span className="text-sm font-medium">Student Name</span>
            <p className="text-lg">{student.name}</p>
            {student.department && (
              <p className="text-sm text-muted-foreground">{student.department}</p>
            )}
          </div>
        ) : studentNotFound ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Student not found in database. Please select manually:
            </p>
            {!showStudentSelect ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStudentSelect(true)}
              >
                Select Student
              </Button>
            ) : (
              <div className="space-y-2">
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  onChange={(e) => {
                    const selected = allStudents.find((s) => s._id === e.target.value);
                    if (selected) {
                      handleStudentSelect(selected);
                    }
                  }}
                >
                  <option value="">Select a student...</option>
                  {allStudents.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.studentNumber} - {s.name}
                    </option>
                  ))}
                </select>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowStudentSelect(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        ) : null}

        <div className="pt-4 border-t">
          <div className="space-y-2">
            <span className="text-sm font-medium">Exam</span>
            {exam ? (
              <div>
                <p className="text-lg font-semibold">{exam.title}</p>
                <p className="text-sm text-muted-foreground capitalize">{exam.type}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Exam ID: {examId.substring(0, 8)}...</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

