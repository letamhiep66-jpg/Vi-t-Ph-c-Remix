/**
 * Utility functions for safe client-side file reading, image compression,
 * MIME type detection, and Base64 encoding for multimodal AI payloads.
 */

export interface Base64ImageResult {
  base64: string; // Pure Base64 without data URL prefix (ready for inlineData.data)
  dataUrl: string; // Complete data URL: data:image/jpeg;base64,...
  mimeType: string;
  filename: string;
  fileSizeBytes: number;
  width?: number;
  height?: number;
}

/**
 * Validates that a file is an acceptable image format and within reasonable size limits.
 */
export function validateImageFile(file: File, maxSizeBytes = 25 * 1024 * 1024): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'Không tìm thấy tệp tải lên.' };
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/heic', 'image/heif'];
  if (!validTypes.includes(file.type.toLowerCase()) && !file.type.startsWith('image/')) {
    return {
      valid: false,
      error: `Định dạng tệp không được hỗ trợ (${file.type || 'không rõ'}). Vui lòng chọn ảnh JPG, PNG hoặc WebP.`
    };
  }

  if (file.size > maxSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    const maxMb = (maxSizeBytes / (1024 * 1024)).toFixed(0);
    return {
      valid: false,
      error: `Dung lượng ảnh quá lớn (${sizeMb}MB). Vui lòng chọn ảnh dưới ${maxMb}MB để đảm bảo tốc độ xử lý.`
    };
  }

  return { valid: true };
}

/**
 * Strips the data URI prefix (e.g. "data:image/jpeg;base64,") and returns clean Base64.
 */
export function stripDataUrlPrefix(dataUrl: string): { cleanBase64: string; mimeType: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (match) {
    return {
      mimeType: match[1],
      cleanBase64: match[2]
    };
  }
  return {
    mimeType: 'image/jpeg',
    cleanBase64: dataUrl
  };
}

/**
 * Safely converts an HTML File or Blob to a clean Base64 string and data URL.
 * Automatically downscales extremely huge images (e.g. > 2500px) to prevent memory crashes.
 */
export async function fileToBase64(file: File, maxDimension = 2048): Promise<Base64ImageResult> {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => {
      reject(new Error('Lỗi khi đọc tệp ảnh từ máy. Vui lòng thử lại.'));
    };

    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) {
        reject(new Error('Dữ liệu ảnh trống.'));
        return;
      }

      // Load into Image to check dimensions and optionally resize to optimize payload size
      const img = new Image();
      img.onerror = () => {
        // Fallback to raw data url if browser cannot render img element
        const { cleanBase64, mimeType } = stripDataUrlPrefix(rawDataUrl);
        resolve({
          base64: cleanBase64,
          dataUrl: rawDataUrl,
          mimeType: mimeType || file.type || 'image/jpeg',
          filename: file.name,
          fileSizeBytes: file.size
        });
      };

      img.onload = () => {
        let targetWidth = img.naturalWidth || img.width;
        let targetHeight = img.naturalHeight || img.height;

        // If the image is excessively large, scale it down proportionally
        const maxSide = Math.max(targetWidth, targetHeight);
        if (maxSide > maxDimension) {
          const ratio = maxDimension / maxSide;
          targetWidth = Math.round(targetWidth * ratio);
          targetHeight = Math.round(targetHeight * ratio);

          try {
            const canvas = document.createElement('canvas');
            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
              const outputMime = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
              const optimizedDataUrl = canvas.toDataURL(outputMime, 0.92);
              const { cleanBase64 } = stripDataUrlPrefix(optimizedDataUrl);

              resolve({
                base64: cleanBase64,
                dataUrl: optimizedDataUrl,
                mimeType: outputMime,
                filename: file.name,
                fileSizeBytes: Math.round(cleanBase64.length * 0.75),
                width: targetWidth,
                height: targetHeight
              });
              return;
            }
          } catch (scaleErr) {
            console.warn('[FileUtils] Canvas resize warning, using original data:', scaleErr);
          }
        }

        // Return original image data URL
        const { cleanBase64, mimeType } = stripDataUrlPrefix(rawDataUrl);
        resolve({
          base64: cleanBase64,
          dataUrl: rawDataUrl,
          mimeType: mimeType || file.type || 'image/jpeg',
          filename: file.name,
          fileSizeBytes: file.size,
          width: targetWidth,
          height: targetHeight
        });
      };

      img.src = rawDataUrl;
    };

    reader.readAsDataURL(file);
  });
}
