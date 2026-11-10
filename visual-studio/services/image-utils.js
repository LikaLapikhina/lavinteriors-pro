// LAV Visual Studio — client-side image preparation.
// Phone photos are often 4000px+ and several MB; we downscale before upload
// so mobile users upload faster. Output stays well above the 1k generation size.

const MAX_SIDE = 2048;
const MAX_BYTES = 4 * 1024 * 1024;
export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function prepareImage(file) {
  if (!file) return null;
  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return { blob: file, width: 0, height: 0 };
  }
  const { width, height } = bitmap;
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  if (scale === 1 && file.size <= MAX_BYTES && ACCEPTED_TYPES.includes(file.type)) {
    bitmap.close?.();
    return { blob: file, width, height };
  }
  const w = Math.round(width * scale), h = Math.round(height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  canvas.getContext("2d").drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  return { blob: blob || file, width: w, height: h };
}

export function readImageSize(url) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => resolve({ width: 1, height: 1 });
    image.src = url;
  });
}

export function blobToDataURL(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("read_failed"));
    reader.readAsDataURL(blob);
  });
}

export async function urlToBlob(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("fetch_failed");
  const blob = await response.blob();
  if (blob.type.startsWith("image/")) return blob;
  const ext = (String(url).split("?")[0].split(".").pop() || "").toLowerCase();
  const type = { webp: "image/webp", png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg" }[ext] || "image/jpeg";
  return new Blob([blob], { type });
}
