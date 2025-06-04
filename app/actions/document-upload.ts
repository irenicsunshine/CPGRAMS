"use server";

interface UploadedFile {
  fileName: string;
  fileUrl: string;
  fileSize: number;
}

export async function uploadDocument(files: File[]): Promise<{
  success: boolean;
  message: string;
  fileCount?: number;
  uploadedFiles?: UploadedFile[];
}> {
  try {
    const CLOUDFLARE_API_URL = process.env.CLOUDFLARE_API_URL;
    const CLOUDFLARE_CDN_URL = process.env.CLOUDFLARE_CDN_URL;
    
    if (!CLOUDFLARE_API_URL || !CLOUDFLARE_CDN_URL) {
      throw new Error("Cloudflare configuration is missing");
    }
    
    const uploadedFiles: UploadedFile[] = [];
    
    // Process each file upload
    for (const file of files) {
      // Generate a unique file name with timestamp
      const timestamp = Date.now();
      const fileName = `${timestamp}-${file.name.replace(/\s+/g, '-')}`;
      
      // Convert File to ArrayBuffer for upload
      const arrayBuffer = await file.arrayBuffer();
      
      // Upload to Cloudflare R2
      const response = await fetch(`${CLOUDFLARE_API_URL}${fileName}`, {
        method: 'PUT',
        body: arrayBuffer,
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to upload ${file.name}: ${response.statusText}`);
      }
      
      // Add to uploaded files list
      uploadedFiles.push({
        fileName: file.name,
        fileUrl: `${CLOUDFLARE_CDN_URL}/${fileName}`,
        fileSize: file.size,
      });
    }
    
    return {
      success: true,
      message: `Successfully uploaded ${files.length} document(s)`,
      fileCount: files.length,
      uploadedFiles,
    };
  } catch (error) {
    console.error("Error uploading documents:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to upload documents",
    };
  }
}
