"use client";
import { useRef, useCallback, useEffect } from "react";
import { useLucy } from "@/context/LucyContext";

export default function useVision() {
  const { setVisionStatus, visionEnabled } = useLucy();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const streamRef = useRef(null);
  const consecutiveNoFace = useRef(0);

  const startVision = useCallback(async (videoEl) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 } },
      });
      streamRef.current = stream;
      if (videoEl) {
        videoEl.srcObject = stream;
        videoEl.play();
        videoRef.current = videoEl;
      }

      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 240;
      canvasRef.current = canvas;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });

      let prevPixels = null;

      intervalRef.current = setInterval(() => {
        if (!videoRef.current) return;
        ctx.drawImage(videoRef.current, 0, 0, 320, 240);
        const imageData = ctx.getImageData(0, 0, 320, 240);
        const pixels = imageData.data;

        if (prevPixels) {
          let motionScore = 0;
          const csx = 80, cex = 240, csy = 40, cey = 200;

          for (let y = csy; y < cey; y += 4) {
            for (let x = csx; x < cex; x += 4) {
              const idx = (y * 320 + x) * 4;
              const diff = Math.abs(pixels[idx] - prevPixels[idx]) +
                Math.abs(pixels[idx + 1] - prevPixels[idx + 1]) +
                Math.abs(pixels[idx + 2] - prevPixels[idx + 2]);
              if (diff > 40) motionScore++;
            }
          }

          let brightness = 0, count = 0;
          for (let y = csy; y < cey; y += 4) {
            for (let x = csx; x < cex; x += 4) {
              const idx = (y * 320 + x) * 4;
              brightness += (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
              count++;
            }
          }
          brightness /= count;

          if (motionScore > 20 && brightness > 30) {
            consecutiveNoFace.current = 0;
            setVisionStatus(motionScore > 200 ? "distracted" : "focused");
          } else {
            consecutiveNoFace.current++;
            if (consecutiveNoFace.current > 10) {
              setVisionStatus("absent");
            }
          }
        }

        prevPixels = new Uint8ClampedArray(pixels);
      }, 500);
    } catch (err) {
      console.warn("Vision not available:", err);
    }
  }, [visionEnabled, setVisionStatus]);

  const stopVision = useCallback(() => {
    clearInterval(intervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
  }, []);

  useEffect(() => {
    return () => stopVision();
  }, [stopVision]);

  return { startVision, stopVision };
}
