"use client";

import { useState, useRef } from "react";
import { Upload, FileText, X, Image as ImageIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FileUploadCardProps {
  onFileSelect: (file: File) => void;
  acceptedFormats?: string[];
}

export function FileUploadCard({
  onFileSelect,
  acceptedFormats = [".pdf", ".png", ".jpg", ".jpeg"],
}: FileUploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    const extension = selectedFile.name
      .substring(selectedFile.name.lastIndexOf("."))
      .toLowerCase();
    
    if (!acceptedFormats.includes(extension)) {
      alert(`Desteklenmeyen dosya formatı. Lütfen şunları kullanın: ${acceptedFormats.join(", ")}`);
      return;
    }

    setFile(selectedFile);
    onFileSelect(selectedFile);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".pdf")) {
      return <FileText className="h-12 w-12 text-red-500" />;
    }
    return <ImageIcon className="h-12 w-12 text-blue-500" />;
  };

  return (
    <Card className="rounded-xl shadow-sm">
      <CardHeader>
        <CardTitle>Sınav Belgesi Yükle</CardTitle>
        <CardDescription>
          Öğrenci sınav cevaplarını içeren PDF veya resim dosyası yükleyin
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${
            isDragging
              ? "border-primary bg-primary/5"
              : "border-gray-300 hover:border-primary/50 hover:bg-muted/50"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptedFormats.join(",")}
            className="hidden"
            onChange={(e) => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) {
                handleFileSelect(selectedFile);
              }
            }}
          />

          {!file ? (
            <div className="space-y-4">
              <Upload className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <p className="text-lg font-medium">Dosyayı buraya sürükleyin veya yüklemek için tıklayın</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Desteklenen formatlar: {acceptedFormats.join(", ")}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-4">
              {getFileIcon(file.name)}
              <div className="text-left">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRemove}
                className="ml-4"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

