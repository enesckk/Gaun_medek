"use client";

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
import { type ProgramOutcome } from "@/lib/api/programOutcomeApi";
import { DeleteProgramOutcomeDialog } from "./DeleteProgramOutcomeDialog";
import { EditProgramOutcomeDialog } from "./EditProgramOutcomeDialog";
import { useState } from "react";

interface ProgramOutcomeTableProps {
  programOutcomes: ProgramOutcome[];
  learningOutcomeCounts: Record<string, number>;
  departmentId?: string;
  onDelete?: () => void;
}

export function ProgramOutcomeTable({
  programOutcomes,
  learningOutcomeCounts,
  departmentId,
  onDelete,
}: ProgramOutcomeTableProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedProgramOutcome, setSelectedProgramOutcome] = useState<ProgramOutcome | null>(null);

  const handleDeleteClick = (programOutcome: ProgramOutcome) => {
    setSelectedProgramOutcome(programOutcome);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (programOutcome: ProgramOutcome) => {
    setSelectedProgramOutcome(programOutcome);
    setEditDialogOpen(true);
  };

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    setSelectedProgramOutcome(null);
    onDelete?.();
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setSelectedProgramOutcome(null);
    onDelete?.();
  };

  if (programOutcomes.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Program çıktısı bulunamadı
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">PÇ Kodu</TableHead>
              <TableHead>Açıklama</TableHead>
              <TableHead className="text-center w-[150px]">Öğrenme Çıktıları</TableHead>
              <TableHead className="text-right w-[100px]">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {programOutcomes.map((programOutcome, index) => (
              <TableRow
                key={`${programOutcome.code}-${index}`}
                className={index % 2 === 0 ? "bg-background" : "bg-muted/50"}
              >
                <TableCell className="font-semibold">
                  <Badge variant="default" className="bg-[#0a294e] text-white">
                    {programOutcome.code}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-md">
                  <p className="text-sm">{programOutcome.description}</p>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline" className="font-medium">
                    {learningOutcomeCounts[programOutcome.code] || 0} ÖÇ
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditClick(programOutcome)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDeleteClick(programOutcome)}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedProgramOutcome && departmentId && (
        <>
          <EditProgramOutcomeDialog
            departmentId={departmentId}
            programOutcome={selectedProgramOutcome}
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            onSuccess={handleEditSuccess}
          />
          <DeleteProgramOutcomeDialog
            departmentId={departmentId}
            programOutcomeCode={selectedProgramOutcome.code}
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onSuccess={handleDeleteSuccess}
          />
        </>
      )}
    </>
  );
}

