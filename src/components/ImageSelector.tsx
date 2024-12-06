import React, { ChangeEvent, useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";

interface MediaUploaderProps {
  isDisabled?: boolean;
  title: string;
  selectedMedia: File[];
  previewMedia: string[];
  onChange: (media: File[], previews: string[]) => void;
}

const DraggableMedia = ({
  id,
  src,
  index,
  moveMedia,
  removeMedia,
  type,
}: any) => {
  const [, ref] = useDrag({
    type: "MEDIA",
    item: { id, index },
  });

  const [, drop] = useDrop({
    accept: "MEDIA",
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveMedia(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const combinedRef = (node: HTMLDivElement | null) => {
    ref(node);
    drop(node);
  };

  return (
    <div ref={combinedRef} className="relative">
      {type === "video" ? (
        <video
          src={src}
          className="w-20 h-20 object-cover rounded-lg"
          muted
          autoPlay
          loop
        />
      ) : (
        <img
          src={src}
          alt="Preview"
          className="w-20 h-20 object-cover rounded-lg"
        />
      )}
      <button
        onClick={() => removeMedia(index)}
        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
      >
        x
      </button>
    </div>
  );
};

const ImageSelector: React.FC<MediaUploaderProps> = ({
  isDisabled = false,
  title,
  selectedMedia,
  previewMedia,
  onChange,
}) => {
  const handleMediaChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const isVideo = file.type.startsWith("video/");

      // Check if a video is already selected
      const videoExists = selectedMedia.some((media) =>
        media.type.startsWith("video/")
      );

      // Check the number of images already selected
      const imageCount = selectedMedia.filter((media) =>
        media.type.startsWith("image/")
      ).length;

      if (isVideo && videoExists) {
        alert("You can only upload one video file.");
        return;
      }

      if (!isVideo && imageCount >= 5) {
        alert("You can only upload up to 5 images.");
        return;
      }

      if (isVideo) {
        const videoElement = document.createElement("video");
        videoElement.src = URL.createObjectURL(file);
        videoElement.onloadedmetadata = () => {
          if (videoElement.duration < 12 || videoElement.duration > 15) {
            alert("The video duration should be between 12 and 15 seconds.");
            return;
          } else {
            const newMedia = [...selectedMedia, file];
            const newPreviews = [...previewMedia, videoElement.src];
            onChange(newMedia, newPreviews);
          }
        };
      } else {
        const newMedia = [...selectedMedia, file];
        const newPreviews = [...previewMedia, URL.createObjectURL(file)];
        onChange(newMedia, newPreviews);
      }
    }
  };

  const removeMedia = (index: number) => {
    const newMedia = selectedMedia.filter((_, i) => i !== index);
    const newPreviews = previewMedia.filter((_, i) => i !== index);
    onChange(newMedia, newPreviews);
  };

  const moveMedia = (fromIndex: number, toIndex: number) => {
    const newMedia = [...selectedMedia];
    const newPreviews = [...previewMedia];
    const [movedMedia] = newMedia.splice(fromIndex, 1);
    const [movedPreview] = newPreviews.splice(fromIndex, 1);
    newMedia.splice(toIndex, 0, movedMedia);
    newPreviews.splice(toIndex, 0, movedPreview);
    onChange(newMedia, newPreviews);
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent =
        typeof window !== "undefined" ? window.navigator.userAgent : "";
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      );
    };

    setIsMobile(checkIfMobile());
  }, []);

  const backend = isMobile ? TouchBackend : HTML5Backend;

  return (
    <DndProvider backend={backend}>
      <div className="flex flex-col gap-2">
        <label className="text-blue-700 hidden">{title}</label>
        <div className="overflow-x-auto">
          <div className="flex gap-2 w-max">
            {previewMedia?.map((preview, index) => (
              <DraggableMedia
                key={index}
                id={index}
                src={preview}
                index={index}
                moveMedia={moveMedia}
                removeMedia={removeMedia}
                type={
                  selectedMedia[index].type.startsWith("video/")
                    ? "video"
                    : "image"
                }
              />
            ))}
            {previewMedia?.length < 6 && (
              <div className="flex items-center justify-center gap-3">
                <label
                  className={`flex-shrink-0 w-20 h-20 flex flex-col items-center px-4 py-6 bg-gray-200 text-blue rounded-lg tracking-wide uppercase border border-blue hover:bg-blue hover:text-white ${
                    !isDisabled && "cursor-pointer"
                  }`}
                >
                  <div className="h-full w-full flex items-center justify-center">
                    <img
                      src="/gallery.svg"
                      alt="Add"
                      className="rounded-lg h-12 w-12 object-cover"
                    />
                  </div>
                  <input
                    disabled={isDisabled}
                    type="file"
                    className="hidden"
                    accept="image/jpeg, image/png, video/mp4"
                    onChange={handleMediaChange}
                  />
                </label>
                <label
                  className={`flex-shrink-0 w-20 h-20 flex flex-col items-center px-4 py-6 bg-gray-200 text-blue rounded-lg tracking-wide uppercase border border-blue hover:bg-blue hover:text-white ${
                    !isDisabled && "cursor-pointer"
                  } ${!isMobile && "hidden"}`}
                >
                  <div className="h-full w-full flex items-center justify-center">
                    <img
                      src="/add_photo.svg"
                      alt="Capture"
                      className="rounded-lg h-12 w-12 object-cover"
                    />
                  </div>
                  <input
                    disabled={isDisabled}
                    type="file"
                    className="hidden"
                    accept="image/jpeg, image/png, video/mp4"
                    capture="environment"
                    onChange={handleMediaChange}
                  />
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

export default ImageSelector;
