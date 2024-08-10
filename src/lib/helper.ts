import JSZip from "jszip";

/**
 * Converts a File object to a Blob.
 *
 * @param file - The File object to convert.
 * @returns A Promise that resolves to a Blob.
 */
export async function fileToBlob(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (reader.result) {
        resolve(new Blob([reader.result]));
      } else {
        reject(new Error("Failed to convert file to Blob."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading file."));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Downloads a Blob as an image file.
 *
 * @param blob - The Blob to download.
 * @param filename - The desired filename for the download.
 */
export function downloadBlobAsImage(imageSrc: string, filename: string) {
  const a = document.createElement("a");
  a.href = imageSrc;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(imageSrc);
}

/**
 * Zips multiple Blob objects and triggers a download of the ZIP file.
 *
 * @param files - An array of objects containing the Blob and its corresponding filename.
 * @param zipFilename - The desired name for the downloaded ZIP file.
 */
export async function downloadBlobsAsZip(files: Blob[], filetype: string) {
  const zip = new JSZip();

  // Add each Blob to the ZIP file
  // files.forEach((file) => {
  //   zip.file(file.filename, file.blob);
  // });
  for (let i = 0; i < files.length; i++) {
    zip.file(`optimized-image${i}.${filetype}`, files[i]!);
  }

  try {
    // Generate the ZIP file as a Blob
    const content = await zip.generateAsync({ type: "blob" });

    // Create a temporary URL for the ZIP file
    const url = URL.createObjectURL(content);

    // Create a temporary anchor element to trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = "optimized-images.zip";
    document.body.appendChild(a);
    a.click();

    // Clean up by revoking the object URL and removing the anchor
    setTimeout(() => {
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 300);
  } catch (error) {
    console.error("Error generating ZIP file:", error);
  }
}

export async function blobUrlToBlob(blobUrl: string): Promise<Blob> {
  const response = await fetch(blobUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch the Blob from the URL.");
  }
  const blob = await response.blob();
  return blob;
}

export function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    // Load the image file as a data URL
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      // Wait for the image to load and get its dimensions
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = (error) => {
        reject(error);
      };
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsDataURL(file);
  });
}
