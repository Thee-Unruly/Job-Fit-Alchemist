
import React, { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FileText, X } from 'lucide-react';

interface FileUploadProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onFileSelect: (file: File | null) => void;
  label?: string;
  accept?: string;
  selectedFile: File | null;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  label = 'Upload file',
  accept = '.pdf,.doc,.docx,.txt',
  selectedFile,
  className,
  ...props
}: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const file = e.dataTransfer.files?.[0] || null;
    if (file) {
      onFileSelect(file);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
          isDragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
          selectedFile ? "bg-background" : "bg-muted/30"
        )}
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {selectedFile ? (
          <div className="flex items-center justify-between p-2">
            <div className="flex items-center space-x-3">
              <FileText className="h-8 w-8 text-primary" />
              <div className="text-left">
                <p className="text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={removeFile}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="text-sm">
              <label
                htmlFor="file-upload"
                className="relative font-medium text-primary hover:text-primary cursor-pointer"
              >
                {label}
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Drag and drop or click to browse
              </p>
            </div>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        id="file-upload"
        type="file"
        className="sr-only"
        accept={accept}
        onChange={handleFileChange}
        {...props}
      />
    </div>
  );
}
