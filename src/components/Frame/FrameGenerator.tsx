import React, { useState, useRef, useCallback, useEffect } from "react";
import { Upload, Download, RotateCcw, Info, ZoomIn, ZoomOut } from "lucide-react";
import html2canvas from "html2canvas";
import toast from "react-hot-toast";
import Bg from "../../assets/images/png.png";

interface ImagePosition {
  x: number;
  y: number;
}

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  startImageX: number;
  startImageY: number;
}

const FrameGenerator = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imagePosition, setImagePosition] = useState<ImagePosition>({
    x: 0,
    y: 0,
  });
  const [imageScale, setImageScale] = useState<number>(1);
  const [initialPinchDistance, setInitialPinchDistance] = useState<number | null>(null);
  const [initialScale, setInitialScale] = useState(1);

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    startImageX: 0,
    startImageY: 0,
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [containerSize, setContainerSize] = useState(400);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Responsive sizes
  const FRAME_SIZE = containerSize;
  const PLACEHOLDER_URL = Bg;

  // Update container size on resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const size = Math.min(600, Math.max(300, window.innerWidth - 40));
        setContainerSize(size);
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const handleImageUpload = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      if (file && file.type.startsWith("image/")) {
        if (file.size > 10 * 1024 * 1024) {
          toast("Please select an image smaller than 10MB");
          return;
        }

        const reader = new FileReader();

        reader.onload = (e) => {
          setUploadedImage(e.target?.result as string);
          setImagePosition({ x: 0, y: 0 });
          setImageScale(1);
          toast("Image uploaded successfully");
        };
        reader.onerror = () => {
          toast("Upload failed");
        };
        reader.readAsDataURL(file);
      } else {
        toast("Invalid file type");
      }
    },
    []
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!uploadedImage) return;
      e.preventDefault();

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      setDragState({
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY,
        startImageX: imagePosition.x,
        startImageY: imagePosition.y,
      });
    },
    [uploadedImage, imagePosition]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      if (!uploadedImage) return;
      e.preventDefault();

      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      if (e.touches.length === 1) {
        const touch = e.touches[0];
        setDragState({
          isDragging: true,
          startX: touch.clientX,
          startY: touch.clientY,
          startImageX: imagePosition.x,
          startImageY: imagePosition.y,
        });
      } else if (e.touches.length === 2) {
        // Initialize pinch zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        setInitialPinchDistance(distance);
        setInitialScale(imageScale);
      }
    },
    [uploadedImage, imagePosition, imageScale]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging || !containerRef.current) return;

      const deltaX = e.clientX - dragState.startX;
      const deltaY = e.clientY - dragState.startY;

      const newX = dragState.startImageX + deltaX;
      const newY = dragState.startImageY + deltaY;

      // Adjust boundaries based on zoom level
      const maxBounds = containerSize * 0.2 * imageScale;
      const boundedX = Math.max(-maxBounds, Math.min(maxBounds, newX));
      const boundedY = Math.max(-maxBounds, Math.min(maxBounds, newY));

      setImagePosition({ x: boundedX, y: boundedY });
    },
    [dragState, containerSize, imageScale]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!containerRef.current || !e.touches[0]) return;

      if (dragState.isDragging && e.touches.length === 1) {
        const touch = e.touches[0];
        const deltaX = touch.clientX - dragState.startX;
        const deltaY = touch.clientY - dragState.startY;

        const newX = dragState.startImageX + deltaX;
        const newY = dragState.startImageY + deltaY;

        const maxBounds = containerSize * 0.2 * imageScale;
        const boundedX = Math.max(-maxBounds, Math.min(maxBounds, newX));
        const boundedY = Math.max(-maxBounds, Math.min(maxBounds, newY));

        setImagePosition({ x: boundedX, y: boundedY });
      } else if (e.touches.length === 2 && initialPinchDistance !== null) {
        // Handle pinch zoom
        e.preventDefault();
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        const distance = Math.hypot(
          touch2.clientX - touch1.clientX,
          touch2.clientY - touch1.clientY
        );
        
        const scale = initialScale * (distance / initialPinchDistance);
        setImageScale(Math.max(0.5, Math.min(3, scale)));
      }
    },
    [dragState, containerSize, imageScale, initialPinchDistance, initialScale]
  );

  const handleMouseUp = useCallback(() => {
    setDragState((prev) => ({ ...prev, isDragging: false }));
  }, []);

  const handleTouchEnd = useCallback(() => {
    setDragState((prev) => ({ ...prev, isDragging: false }));
    setInitialPinchDistance(null);
  }, []);

  useEffect(() => {
    const mouseMoveHandler = (e: MouseEvent) => handleMouseMove(e);
    const touchMoveHandler = (e: TouchEvent) => handleTouchMove(e);
    
    if (dragState.isDragging) {
      document.addEventListener("mousemove", mouseMoveHandler);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", touchMoveHandler);
      document.addEventListener("touchend", handleTouchEnd);
      return () => {
        document.removeEventListener("mousemove", mouseMoveHandler);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", touchMoveHandler);
        document.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  const downloadBanner = useCallback(async () => {
    if (!uploadedImage || !containerRef.current) {
      toast("No image to download");
      return;
    }

    setIsProcessing(true);

    try {
      const canvas = await html2canvas(containerRef.current, {
        allowTaint: true,
        useCORS: true,
        scale: 2,
        width: FRAME_SIZE,
        height: FRAME_SIZE,
        backgroundColor: null,
      });

      // Create download link
      const link = document.createElement("a");
      link.download = `banner-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png", 1.0);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast("Download successful");
    } catch (error) {
      console.error("Download failed:", error);
      toast("Download failed");
    } finally {
      setIsProcessing(false);
    }
  }, [uploadedImage, FRAME_SIZE]);

  const resetImage = useCallback(() => {
    setImagePosition({ x: 0, y: 0 });
    setImageScale(1);
  }, []);

  const zoomIn = useCallback(() => {
    setImageScale(prev => Math.min(3, prev + 0.2));
  }, []);

  const zoomOut = useCallback(() => {
    setImageScale(prev => Math.max(0.5, prev - 0.2));
  }, []);

  // Keyboard shortcuts for positioning and zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!uploadedImage) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          setImagePosition((prev) => ({ ...prev, x: prev.x - 10 }));
          break;
        case "ArrowRight":
          e.preventDefault();
          setImagePosition((prev) => ({ ...prev, x: prev.x + 10 }));
          break;
        case "ArrowUp":
          e.preventDefault();
          setImagePosition((prev) => ({ ...prev, y: prev.y - 10 }));
          break;
        case "ArrowDown":
          e.preventDefault();
          setImagePosition((prev) => ({ ...prev, y: prev.y + 10 }));
          break;
        case "+":
        case "=":
          e.preventDefault();
          zoomIn();
          break;
        case "-":
          e.preventDefault();
          zoomOut();
          break;
        case "r":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            resetImage();
          }
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [uploadedImage, resetImage, zoomIn, zoomOut]);

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-5 md:p-4 bg-white rounded-lg md:shadow-lg mt-2">
      <div className="">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          aria-label="Upload image file"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#dc143c] text-white rounded-lg hover:bg-[#dc143c]/80 transition-colors cursor-pointer text-sm sm:text-base"
        >
          <Upload size={18} />
          Upload Your Image
        </button>
      </div>

      {/* Mobile preview notice */}
      {uploadedImage && window.innerWidth < 640 && (
        <div className="p-2 bg-blue-50 text-blue-800 rounded-md flex items-center gap-2 text-xs">
          <Info size={16} />
          <span>Pinch to zoom • Drag to reposition</span>
        </div>
      )}

      <div className="flex justify-center">
        <div
          ref={containerRef}
          className="relative rounded-xl overflow-hidden shadow-glow"
          style={{
            width: containerSize,
            height: containerSize,
            backgroundColor: "#f0f0f0",
            cursor: uploadedImage ? (dragState.isDragging ? "grabbing" : "grab") : "default",
            touchAction: uploadedImage ? "none" : "auto",
          }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          role="button"
          tabIndex={uploadedImage ? 0 : -1}
          aria-label={
            uploadedImage
              ? "Drag to reposition image"
              : "Upload an image to start editing"
          }
        >
          {/* Uploaded image layer - behind the frame */}
          {uploadedImage && (
            <div
              className="absolute inset-0 flex items-center justify-center z-0 origin-center"
              style={{
                transform: `translate(${imagePosition.x}px, ${imagePosition.y}px) scale(${imageScale})`,
                transition: dragState.isDragging ? "none" : "transform 0.2s ease",
              }}
            >
              <img
                ref={imageRef}
                src={uploadedImage}
                alt="Your uploaded image"
                className="max-w-none object-contain touch-callout-none"
                draggable="false"
                style={{
                  maxWidth: "80%",
                  maxHeight: "80%",
                }}
              />
            </div>
          )}

          {/* Frame layer - on top with transparent center */}
          <img
            src={PLACEHOLDER_URL}
            alt="Banner frame"
            className="absolute inset-0 w-full h-full z-10 pointer-events-none"
            draggable="false"
            style={{
              width: FRAME_SIZE,
              height: FRAME_SIZE,
            }}
          />

          {/* Drop instruction overlay */}
          {!uploadedImage && (
            <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/20">
              <div className="text-center text-white/80">
                <Upload size={35} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">Upload an image to start</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {uploadedImage ? (
        <div className="">
          <div className="w-full flex justify-between flex-col sm:flex-row gap-3 mb-3">
            <div className="flex items-center justify-between gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={zoomOut}
                className="p-2 rounded-md hover:bg-gray-200"
                aria-label="Zoom out"
              >
                <ZoomOut size={20} />
              </button>
              <span className="text-sm font-medium w-16 text-center">
                {Math.round(imageScale * 100)}%
              </span>
              <button
                onClick={zoomIn}
                className="p-2 rounded-md hover:bg-gray-200"
                aria-label="Zoom in"
              >
                <ZoomIn size={20} />
              </button>
            </div>
            
            <button
              onClick={resetImage}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base"
            >
              <RotateCcw size={20} />
              Reset
            </button>
          </div>
          
          <div className="w-full">
            <button
              onClick={downloadBanner}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm sm:text-base"
              disabled={isProcessing}
            >
              <Download size={20} />
              {isProcessing ? "Processing..." : "Download Banner"}
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-500 mt-2">
            {window.innerWidth > 640 && (
              <>
                Drag to reposition • 
                Arrow keys to nudge • 
                +/- to zoom • 
                Ctrl+R to reset
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-400 text-xs">
          Upload an image to start editing your banner
        </div>
      )}
    </div>
  );
};

export default FrameGenerator;