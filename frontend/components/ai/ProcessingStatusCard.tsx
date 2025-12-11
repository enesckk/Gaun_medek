"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { type ProcessingStep } from "@/lib/api/aiApi";

interface ProcessingStatusCardProps {
  steps: ProcessingStep[];
}

export function ProcessingStatusCard({ steps }: ProcessingStatusCardProps) {
  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle>Sınav Belgesi İşleniyor</CardTitle>
        <CardDescription>AI belgenizi analiz ediyor...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-4">
              <div className="flex-shrink-0">
                {step.status === "completed" ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : step.status === "processing" ? (
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                )}
              </div>
              <div className="flex-1">
                <p
                  className={`text-sm font-medium ${
                    step.status === "completed"
                      ? "text-green-600"
                      : step.status === "processing"
                      ? "text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
                {step.status === "processing" && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                    <div className="bg-primary h-1.5 rounded-full animate-pulse" style={{ width: "60%" }} />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center">
          <div className="flex gap-1">
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <div className="h-2 w-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

