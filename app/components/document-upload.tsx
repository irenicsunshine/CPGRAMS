"use client";
import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface UploadedFile {
  originalName: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

interface DocumentUploadProps {
  toolCallId: string;
  onComplete: (files: UploadedFile[], toolCallId: string) => void;
  onCancel: () => void;
}

const CLOUDFLARE_API_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_API_URL;
const CLOUDFLARE_CDN_URL = process.env.NEXT_PUBLIC_CLOUDFLARE_CDN_URL;

export function DocumentUpload({
  toolCallId,
  onComplete,
  onCancel,
}: DocumentUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      setError(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
      setError(null);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeFile = (index: number) => {
    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (files.length === 0) {
      setError("Please select at least one file to upload");
      return;
    }

    if (!CLOUDFLARE_API_URL || !CLOUDFLARE_CDN_URL) {
      setError("Upload configuration is missing");
      return;
    }

    setUploading(true);
    try {
      const uploadedFiles: UploadedFile[] = [];

      for (const file of files) {
        // Generate unique filename to avoid conflicts
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExtension = file.name.split(".").pop();
        const fileName = `${timestamp}-${randomString}.${fileExtension}`;

        // Convert file to array buffer
        const arrayBuffer = await file.arrayBuffer();

        // Upload to Cloudflare R2
        const response = await fetch(`${CLOUDFLARE_API_URL}${fileName}`, {
          method: "PUT",
          body: arrayBuffer,
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to upload ${file.name}: ${response.statusText}`
          );
        }

        // Add to uploaded files list
        uploadedFiles.push({
          originalName: file.name,
          fileName: fileName,
          fileUrl: `${CLOUDFLARE_CDN_URL}/${fileName}`,
          fileSize: file.size,
          fileType: file.type,
          uploadedAt: new Date().toISOString(),
        });
      }

      // Pass the uploaded file information back to the parent
      onComplete(uploadedFiles, toolCallId);
    } catch (err) {
      console.error("Upload error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload documents. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-4">
      <CardHeader>
        <CardTitle className="text-lg font-medium">Upload Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
          <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <p className="text-sm font-medium">
            Click to browse or drag and drop files here
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supported formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB)
          </p>
        </div>

        {files.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Selected Files:</h4>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                >
                  <div className="flex items-center">
                    <FileText className="h-4 w-4 text-gray-500 mr-2" />
                    <span className="text-sm truncate max-w-[200px]">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500 ml-2">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={uploading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={uploading} className="bg-gray-200 hover:bg-gray-600">
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            "Upload Documents"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
