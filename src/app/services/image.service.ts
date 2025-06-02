import { Injectable } from '@angular/core';

/**
 * Interface for image information in the viewer
 */
export interface ViewerImageInfo {
  url: string;
  name: string;
  size: number;
}

/**
 * Service for handling image processing operations
 *
 * @class ImageService
 * @description Provides functionality for image compression and processing
 */
@Injectable({
  providedIn: 'root',
})
export class ImageService {
  /**
   * Compresses an image file by resizing and quality reduction
   *
   * @param {File} file - The image file to compress
   * @param {number} [maxWidth=800] - Maximum width of the compressed image
   * @param {number} [maxHeight=800] - Maximum height of the compressed image
   * @param {number} [quality=0.8] - JPEG quality (0 to 1)
   * @returns {Promise<string>} Base64 encoded compressed image
   * @throws {Error} If canvas context cannot be obtained or image processing fails
   */
  compressImage(
    file: File,
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.8
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject('Failed to get canvas context');
            return;
          }

          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            } else {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          const mimeType = file.type || 'image/jpeg';
          const compressedBase64 = canvas.toDataURL(mimeType, quality);
          resolve(compressedBase64);
        };
        img.onerror = () => reject('Error loading image');
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject('Error reading file');
      reader.readAsDataURL(file);
    });
  }

  /**
   * Convert task files to viewer image info format
   * @param files - Array of task files
   * @returns Array of ViewerImageInfo objects
   */
  convertFilesToViewerImages(
    files: { data: string; name: string }[]
  ): ViewerImageInfo[] {
    return files.map((file) => ({
      url: file.data,
      name: file.name,
      size: this.getBase64Size(file.data),
    }));
  }
  
  /**
   * Calculate the size of a base64 string in bytes
   * @param {string} base64String - The base64 string to calculate size for
   * @returns {number} Size in bytes
   */
  getBase64Size(base64String: string): number {
    const padding = this.calculateBase64Padding(base64String);
    return (base64String.length * 3) / 4 - padding;
  }

  /**
   * Calculate padding for base64 string
   * @param {string} base64String - The base64 string
   * @returns {number} The padding size
   */
  private calculateBase64Padding(base64String: string): number {
    return base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0;
  }
}
