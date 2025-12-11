"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, GraduationCap, Info, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { programOutcomeApi, type ProgramOutcome } from "@/lib/api/programOutcomeApi";
import { cn } from "@/lib/utils";

export interface LearningOutcome {
  code: string;
  description: string;
  programOutcomes?: string[]; // PÇ codes (e.g., ["PÇ1", "PÇ2"])
}

interface OutcomeEditorProps {
  outcomes: LearningOutcome[];
  onChange: (outcomes: LearningOutcome[]) => void;
  departmentId?: string; // Department ID to fetch PÇ list
  errors?: Record<string, string>;
  disabled?: boolean;
}

export function OutcomeEditor({
  outcomes,
  onChange,
  departmentId,
  errors = {},
  disabled = false,
}: OutcomeEditorProps) {
  const router = useRouter();
  const [programOutcomes, setProgramOutcomes] = useState<ProgramOutcome[]>([]);
  const [loadingPOs, setLoadingPOs] = useState(false);

  // Load program outcomes when departmentId changes
  useEffect(() => {
    if (departmentId) {
      loadProgramOutcomes();
    } else {
      setProgramOutcomes([]);
    }
  }, [departmentId]);

  const loadProgramOutcomes = async () => {
    if (!departmentId) return;
    try {
      setLoadingPOs(true);
      const data = await programOutcomeApi.getByDepartment(departmentId);
      setProgramOutcomes(data || []);
      
      // Clean up invalid PÇ references (PÇs that were deleted but still referenced in outcomes)
      if (data && data.length > 0 && outcomes.length > 0) {
        const validPCCodes = new Set(data.map(po => po.code));
        let needsUpdate = false;
        
        const cleanedOutcomes = outcomes.map(outcome => {
          const validPOs = (outcome.programOutcomes || []).filter(poCode => 
            validPCCodes.has(poCode)
          );
          
          if (validPOs.length !== (outcome.programOutcomes || []).length) {
            needsUpdate = true;
            return { ...outcome, programOutcomes: validPOs };
          }
          return outcome;
        });
        
        if (needsUpdate) {
          onChange(cleanedOutcomes);
        }
      }
    } catch (error: any) {
      console.error("Program çıktıları yüklenirken hata:", error);
      setProgramOutcomes([]);
    } finally {
      setLoadingPOs(false);
    }
  };

  // Auto-suggest ÖÇ codes: ÖÇ1, ÖÇ2, ÖÇ3...
  const getSuggestedCode = (index: number): string => {
    return `ÖÇ${index + 1}`;
  };

  const addOutcome = () => {
    const newIndex = outcomes.length;
    const suggestedCode = getSuggestedCode(newIndex);
    onChange([...outcomes, { code: suggestedCode, description: "", programOutcomes: [] }]);
  };

  const removeOutcome = (index: number) => {
    if (outcomes.length > 1) {
      const updated = outcomes.filter((_, i) => i !== index);
      // Re-number remaining outcomes if they follow the pattern
      const renumbered = updated.map((outcome, idx) => {
        // If code is empty or matches the pattern ÖÇ{N}, suggest new code
        if (!outcome.code || /^ÖÇ\d+$/.test(outcome.code)) {
          return { ...outcome, code: getSuggestedCode(idx) };
        }
        return outcome;
      });
      onChange(renumbered);
    }
  };

  const updateOutcome = (
    index: number,
    field: "code" | "description" | "programOutcomes",
    value: string | string[]
  ) => {
    const updated = [...outcomes];
    updated[index][field] = value as any;
    onChange(updated);
  };

  const toggleProgramOutcome = (outcomeIndex: number, poCode: string) => {
    const outcome = outcomes[outcomeIndex];
    const currentPOs = outcome.programOutcomes || [];
    const updatedPOs = currentPOs.includes(poCode)
      ? currentPOs.filter((code) => code !== poCode)
      : [...currentPOs, poCode];
    updateOutcome(outcomeIndex, "programOutcomes", updatedPOs);
  };


  // Auto-fill code on focus if empty
  const handleCodeFocus = (index: number) => {
    if (!outcomes[index].code.trim()) {
      const suggestedCode = getSuggestedCode(index);
      updateOutcome(index, "code", suggestedCode);
    }
  };

  return (
    <div className="space-y-4">
      {errors.learningOutcomes && (
        <p className="text-base text-destructive font-medium">
          {errors.learningOutcomes}
        </p>
      )}

      <div className="space-y-4">
        {outcomes.map((outcome, index) => (
          <div
            key={index}
            className="flex flex-col gap-3 p-4 border border-slate-200 rounded-lg bg-white shadow-sm"
          >
            {/* ÖÇ Kodu ve Açıklama */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label
                  htmlFor={`outcome-code-${index}`}
                  className="text-sm font-medium text-slate-700"
                >
                  ÖÇ Kodu <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`outcome-code-${index}`}
                  value={outcome.code}
                  onChange={(e) => updateOutcome(index, "code", e.target.value)}
                  onFocus={() => handleCodeFocus(index)}
                  placeholder={`Örn: ${getSuggestedCode(index)}`}
                  disabled={disabled}
                  className={cn(
                    "h-10 text-sm",
                    errors[`lo_${index}_code`] 
                      ? "border-red-400 focus:border-red-500" 
                      : "border-slate-200 focus:border-slate-400"
                  )}
                />
                {errors[`lo_${index}_code`] && (
                  <p className="text-xs text-red-600 bg-red-50 p-1.5 rounded">
                    {errors[`lo_${index}_code`]}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor={`outcome-desc-${index}`}
                  className="text-sm font-medium text-slate-700"
                >
                  Açıklama <span className="text-red-500">*</span>
                </Label>
                <Input
                  id={`outcome-desc-${index}`}
                  value={outcome.description}
                  onChange={(e) =>
                    updateOutcome(index, "description", e.target.value)
                  }
                  placeholder="Örn: Algoritma analizini anlama"
                  disabled={disabled}
                  className={cn(
                    "h-10 text-sm",
                    errors[`lo_${index}_description`] 
                      ? "border-red-400 focus:border-red-500" 
                      : "border-slate-200 focus:border-slate-400"
                  )}
                />
                {errors[`lo_${index}_description`] && (
                  <p className="text-xs text-red-600 bg-red-50 p-1.5 rounded">
                    {errors[`lo_${index}_description`]}
                  </p>
                )}
              </div>
            </div>

            {/* Program Çıktıları (PÇ) Seçimi */}
            {departmentId && (
              <div className="space-y-2 pt-3 border-t border-slate-200">
                <div className="flex items-start gap-2">
                  <GraduationCap className="h-4 w-4 text-slate-600 mt-0.5" />
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-slate-700">
                      Bu ÖÇ hangi Program Çıktılarına (PÇ) katkıda bulunur?
                      <span className="text-slate-400 font-normal ml-1">(İsteğe bağlı)</span>
                    </Label>
                    {loadingPOs ? (
                      <p className="text-xs text-slate-500 mt-1.5">PÇ listesi yükleniyor...</p>
                    ) : programOutcomes.length === 0 ? (
                      <div className="mt-1.5 p-2 bg-amber-50 rounded border border-amber-200">
                        <p className="text-xs text-amber-800 mb-1.5">
                          <strong>Önemli:</strong> Bu bölüm için henüz program çıktısı tanımlanmamış.
                        </p>
                        <p className="text-xs text-amber-700 mb-2">
                          ÖÇ → PÇ eşleştirmesi yapabilmek için önce bu bölüm için program çıktıları eklemeniz gerekmektedir.
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => router.push("/dashboard/program-outcomes")}
                          className="h-7 text-xs bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-900"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Program Çıktıları Sayfasına Git
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-1.5 p-2 bg-slate-50 rounded border border-slate-200">
                        <div className="flex items-start gap-2 text-xs text-slate-600">
                          <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium mb-0.5">MÜDEK Mantığı:</p>
                            <p>Her Öğrenme Çıktısı (ÖÇ), bir veya daha fazla Program Çıktısına (PÇ) katkıda bulunur. Sorular sadece ÖÇ'ye eşlenir, PÇ otomatik olarak ÖÇ'den türetilir.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {programOutcomes.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {programOutcomes.map((po) => {
                      const isSelected = (outcome.programOutcomes || []).includes(po.code);
                      return (
                        <Badge
                          key={po.code}
                          variant={isSelected ? "default" : "outline"}
                          className={`cursor-pointer text-xs px-2 py-1 rounded font-medium transition-all duration-200 flex items-center gap-1.5 ${
                            isSelected
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : "border border-slate-300 text-slate-700 hover:bg-green-50 hover:border-green-400"
                          }`}
                          onClick={() => !disabled && toggleProgramOutcome(index, po.code)}
                        >
                          <span className={`w-3 h-3 rounded border flex items-center justify-center ${
                            isSelected ? "bg-white border-white" : "border-slate-400"
                          }`}>
                            {isSelected && <span className="text-green-600 text-[10px]">✓</span>}
                          </span>
                          {po.code} - {po.description}
                        </Badge>
                      );
                    })}
                  </div>
                )}
                {(outcome.programOutcomes || []).length > 0 && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-1.5 rounded">
                    💡 {outcome.programOutcomes?.length} program çıktısı seçildi: {outcome.programOutcomes?.join(", ")}
                  </p>
                )}
              </div>
            )}

            {/* Sil Butonu */}
            {outcomes.length > 1 && (
              <div className="flex justify-end pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOutcome(index)}
                  disabled={disabled}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 text-xs"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Bu ÖÇ'yi Sil
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="default"
        onClick={addOutcome}
        disabled={disabled}
        className="w-full h-10 text-sm"
      >
        <Plus className="h-4 w-4 mr-2" />
        ÖÇ Ekle
      </Button>
    </div>
  );
}

