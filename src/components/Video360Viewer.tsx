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

      // Check if duration is valid
      if (!isFinite(videoDuration) || videoDuration <= 0) {
        return;
      }

      const videoWidth = videoRef.current.clientWidth;

      // Calculate the scrub position based on drag distance and video width
      const scrubTime = (dragDelta / videoWidth) * videoDuration;

      // Calculate new time ensuring it stays within valid bounds
      let newTime = videoCurrentTime + scrubTime;

      // Ensure the time loops within 0 to duration
      if (newTime < 0) {
        newTime = videoDuration + (newTime % videoDuration);
      } else {
        newTime = newTime % videoDuration;
      }

      // Final check to ensure we have a valid time
      if (isFinite(newTime) && newTime >= 0 && newTime <= videoDuration) {
        videoRef.current.currentTime = newTime;
        setVideoCurrentTime(newTime);
      }
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
