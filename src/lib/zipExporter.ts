import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import { PRODUCTION_PROJECT_FILES } from '../data/zipFiles';

export async function downloadProjectZip(onProgress?: (filename: string, percent: number) => void): Promise<void> {
  const zip = new JSZip();

  // Root folder inside the zip
  const root = zip.folder('magic-platform') || zip;

  const totalFiles = PRODUCTION_PROJECT_FILES.length;

  // Add each file to the zip archive
  PRODUCTION_PROJECT_FILES.forEach((file, index) => {
    root.file(file.path, file.content);
    if (onProgress) {
      const percent = Math.round(((index + 1) / totalFiles) * 100);
      onProgress(file.path, percent);
    }
  });

  // Generate binary zip
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  // Trigger browser download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'magic-platform.zip';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // Trigger celebratory confetti
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  } catch {
    // Ignore if canvas-confetti fails in restricted environments
  }
}
