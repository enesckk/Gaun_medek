"use client";

import Link from "next/link";
import { Edit, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type LearningOutcome } from "@/lib/api/learningOutcomeApi";
import { DeleteOutcomeDialog } from "./DeleteOutcomeDialog";
import { useState } from "react";

interface OutcomeTableProps {
  outcomes: (LearningOutcome & { course?: any; department?: any })[];
  onDelete?: () => void;
}

export function OutcomeTable({ outcomes, onDelete }: OutcomeTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedOutcome, setSelectedOutcome] = useState<LearningOutcome | null>(null);

  const handleDeleteClick = (outcome: LearningOutcome) => {
    setSelectedOutcome(outcome);
    setDeleteDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    setSelectedOutcome(null);
    onDelete?.();
  };

  if (outcomes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Öğrenme çıktısı bulunamadı
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">ÖÇ Kodu</TableHead>
              <TableHead>Açıklama</TableHead>
              <TableHead className="w-[200px]">Ders</TableHead>
              <TableHead className="w-[200px]">Bölüm</TableHead>
              <TableHead className="text-center w-[120px]">Program Çıktıları</TableHead>
              <TableHead className="text-right w-[100px]">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {outcomes.map((outcome, index) => {
              const courseName = outcome.course?.name || "Bilinmeyen Ders";
              const departmentName = outcome.department?.name || 
                (typeof outcome.department === 'string' ? outcome.department : "Bilinmeyen Bölüm") ||
                "Bilinmeyen Bölüm";
              
              return (
                <TableRow
                  key={outcome._id}
                  className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}
                >
                  <TableCell className="font-semibold">
                    <Badge variant="default" className="bg-[#0a294e] text-white">
                      {outcome.code}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md">
                    <p className="text-sm">{outcome.description}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-slate-700">{courseName}</p>
                    {outcome.course?.code && (
                      <p className="text-xs text-muted-foreground">{outcome.course.code}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-slate-600">{departmentName}</p>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-medium">
                      {(outcome.mappedProgramOutcomes?.length || 
                        (outcome as any).programOutcomes?.length || 
                        0)} PÇ
                    </Badge>
                    {((outcome.mappedProgramOutcomes?.length || 0) === 0 && 
                      ((outcome as any).programOutcomes?.length || 0) === 0) && (
                      <p className="text-xs text-amber-600 mt-1">Eşleştirme yok</p>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        asChild
                        className="h-8 w-8"
                      >
                        <Link href={`/outcomes/${outcome._id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => handleDeleteClick(outcome)}
                        className="h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {selectedOutcome && (
        <DeleteOutcomeDialog
          outcomeId={selectedOutcome._id}
          outcomeCode={selectedOutcome.code}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}






