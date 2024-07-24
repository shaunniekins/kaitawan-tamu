// ImageSelector.tsx
import React, { ChangeEvent, useEffect, useState } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";

interface ImageUploaderProps {
  isDisabled?: boolean;
  title: string;
  selectedImages: File[];
  previewImages: string[];
  onChange: (images: File[], previews: string[]) => void;
}

const DraggableImage = ({ id, src, index, moveImage, removeImage }: any) => {
  const [, ref] = useDrag({
    type: "IMAGE",
    item: { id, index },
  });

  const [, drop] = useDrop({
    accept: "IMAGE",
    hover: (draggedItem: { index: number }) => {
      if (draggedItem.index !== index) {
        moveImage(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div ref={(node) => ref(drop(node))} className="relative">
      <img
        src={src}
        alt="Preview"
        className="w-20 h-20 object-cover rounded-lg"
      />
      <button
        onClick={() => removeImage(index)}
        className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
      >
        x
      </button>
    </div>
  );
};

const ImageSelector: React.FC<ImageUploaderProps> = ({
  isDisabled = false,
  title,
  selectedImages,
  previewImages,
  onChange,
}) => {
  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const newImages = [...selectedImages, e.target.files[0]];
      const newPreviews = [
        ...previewImages,
        URL.createObjectURL(e.target.files[0]),
      ];
      onChange(newImages.slice(0, 5), newPreviews.slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    const newPreviews = previewImages.filter((_, i) => i !== index);
    onChange(newImages, newPreviews);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...selectedImages];
    const newPreviews = [...previewImages];
    const [movedImage] = newImages.splice(fromIndex, 1);
    const [movedPreview] = newPreviews.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    newPreviews.splice(toIndex, 0, movedPreview);
    onChange(newImages, newPreviews);
  };

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : "";
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    };

    setIsMobile(checkIfMobile());
  console.log("mobile:", checkIfMobile());

  }, []);


  const backend = isMobile ? TouchBackend : HTML5Backend;


  return (
    <DndProvider backend={backend}>
      <div className="flex flex-col gap-2">
        <label className="text-blue-700 hidden">{title}</label>
        <div className="overflow-x-auto">
          <div className="flex gap-2 w-max">
            {previewImages.map((preview, index) => (
              <DraggableImage
                key={index}
                id={index}
                src={preview}
                index={index}
                moveImage={moveImage}
                removeImage={removeImage}
              />
            ))}
            {previewImages.length < 5 && (
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
                    accept="image/jpeg, image/png"
                    onChange={handleImageChange}
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
                    accept="image/jpeg, image/png"
                    capture="environment"
                    onChange={handleImageChange}
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
