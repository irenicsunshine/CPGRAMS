"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, CheckCircle2 } from "lucide-react";
import { uploadDocument } from "@/app/actions/document-upload";

interface UploadedFile {
  fileName: string;
  fileUrl: string;
  fileSize: number;
}

interface DocumentUploadProps {
  message: string;
  toolCallId: string;
  onComplete: (toolCallId: string, result: unknown) => void;
  onCancel: () => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  message,
  toolCallId,
  onComplete,
  onCancel,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setIsUploading(true);
    try {
      const result = await uploadDocument(files);
      if (result.success && result.uploadedFiles) {
        setUploadedFiles(result.uploadedFiles);
        setFiles([]);
      }
    } catch (error) {
      console.error("Error uploading documents:", error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleComplete = () => {
    onComplete(toolCallId, {
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} document(s)`,
      uploadedFiles: uploadedFiles
    });
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-white border border-purple-200 rounded-lg p-4 my-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-purple-700 mb-2">Document Upload</h3>
        <p className="text-gray-700">{message}</p>
      </div>

      <div className="space-y-4">
        {/* File input (hidden) */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          multiple
        />

        {/* Selected files list */}
        {files.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Selected files:</p>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200"
                >
                  <div className="flex items-center space-x-2">
                    <FileText size={16} className="text-purple-600" />
                    <span className="text-sm truncate max-w-[200px]">
                      {file.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                    className="h-6 w-6 p-0"
                  >
                    <X size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded files list */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2 mt-4 border-t pt-4 border-purple-100">
            <p className="text-sm font-medium text-green-700 flex items-center">
              <CheckCircle2 size={16} className="mr-1" />
              Uploaded files:
            </p>
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-green-50 p-2 rounded border border-green-100"
                >
                  <div className="flex items-center space-x-2">
                    <FileText size={16} className="text-green-600" />
                    <span className="text-sm truncate max-w-[200px]">
                      {file.fileName}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({(file.fileSize / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex space-x-3">
          {uploadedFiles.length === 0 ? (
            <>
              <Button
                variant="outline"
                onClick={handleBrowseClick}
                className="border-purple-200 hover:bg-purple-50 text-purple-700"
                disabled={isUploading}
              >
                <Upload size={16} className="mr-2" />
                Browse Files
              </Button>
              <Button
                onClick={handleUpload}
                className="bg-purple-600 hover:bg-purple-700 text-white"
                disabled={files.length === 0 || isUploading}
              >
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
              <Button
                variant="ghost"
                onClick={onCancel}
                className="text-gray-500"
                disabled={isUploading}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleBrowseClick}
                className="border-purple-200 hover:bg-purple-50 text-purple-700"
              >
                <Upload size={16} className="mr-2" />
                Upload More
              </Button>
              <Button
                onClick={handleComplete}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Done
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};