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
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.src = videoUrl;
    video.crossOrigin = "anonymous";
    video.currentTime = 1;

    const timeoutId = setTimeout(() => {
      reject(new Error("Thumbnail generation timed out"));
    }, 10000); // 10 second timeout

    video.addEventListener("error", (e) => {
      clearTimeout(timeoutId);
      reject(new Error(`Video load error: ${e}`));
    });

    video.addEventListener("loadeddata", () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const context = canvas.getContext("2d");
        if (!context) throw new Error("Could not get canvas context");

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        clearTimeout(timeoutId);
        resolve(canvas.toDataURL("image/png"));
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  });
};
