"use client";

import { useRef, useState, useEffect } from "react";

interface Video360ViewerProps {
  videoSrc: string;
}

export default function Video360Viewer({ videoSrc }: Video360ViewerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);

  // Handle mouse/touch start (start dragging)
  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const clientX =
      e.type === "touchstart"
        ? (e as React.TouchEvent).touches[0].clientX
        : (e as React.MouseEvent).clientX;
    setDragStartX(clientX);
  };

  // Handle mouse/touch end (stop dragging)
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Handle mouse/touch move (drag to scrub through video)
  const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (isDragging && videoRef.current) {
      const clientX =
        e.type === "touchmove"
          ? (e as React.TouchEvent).touches[0].clientX
          : (e as React.MouseEvent).clientX;
      const dragDelta = clientX - dragStartX;
      const videoDuration = videoRef.current.duration;
      const videoWidth = videoRef.current.clientWidth; // More precise than window.innerWidth

      // Calculate the scrub position based on drag distance and video width
      const scrubTime = (dragDelta / videoWidth) * videoDuration;

      // Update video current time, ensuring it loops within the duration
      const newTime =
        (videoCurrentTime + scrubTime + videoDuration) % videoDuration;
      videoRef.current.currentTime = newTime;
      setVideoCurrentTime(newTime);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.loop = true; // Ensure the video loops seamlessly
      videoRef.current.pause(); // Ensure the video starts paused
    }
  }, [videoSrc]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        cursor: "grab",
        touchAction: "none", // Prevent default scroll behavior on touch
      }}
      onMouseDown={handleDragStart}
      onMouseUp={handleDragEnd}
      onMouseMove={handleDragMove}
      onTouchStart={handleDragStart}
      onTouchMove={handleDragMove}
      onTouchEnd={handleDragEnd}
      onMouseLeave={handleDragEnd} // Ensure drag stops if mouse leaves the window
    >
      <video
        ref={videoRef}
        src={videoSrc}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
        muted
        playsInline
        controls={false} // Disable built-in controls
      />
    </div>
  );
}
