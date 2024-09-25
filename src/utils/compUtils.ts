import Resizer from "react-image-file-resizer";

// Function to extract ID from pathname
export const getIdFromPathname = (pathname: string) => {
  const segments = pathname.split("/");
  return segments[segments.length - 1];
};

export const resizeImage = (file: File) => {
  return new Promise((resolve) => {
    Resizer.imageFileResizer(
      file,
      500, // Max width
      500, // Max height
      "JPEG", // Output format
      80, // Quality
      0, // Rotation
      (uri) => {
        resolve(uri); // Return resized image
      },
      "file" // Output type (can also be base64)
    );
  });
};
