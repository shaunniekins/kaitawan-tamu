import Resizer from "react-image-file-resizer";

// Function to extract ID from pathname
export const getIdFromPathname = (pathname: string) => {
  const segments = pathname.split("/");
  return segments[segments.length - 1];
};

export const resizeImage = (file: File) => {
  return new Promise((resolve, reject) => {
    // Check if the file is an image
    if (!file.type.startsWith("image/")) {
      resolve(file); // Return the original file if it's not an image
      return;
    }

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

export const generateVideoThumbnail = (videoUrl: string): Promise<string> => {
  return new Promise((resolve) => {
    const video = document.createElement("video");
    video.src = videoUrl;
    video.crossOrigin = "anonymous";
    video.currentTime = 1; // Capture the thumbnail at 1 second

    video.addEventListener("loadeddata", () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/png"));
    });
  });
};
