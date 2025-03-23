import { useState, useRef } from "react";
import { Button } from "../ui/button";
import { ScreenRecorderState } from "../../types";
import { blobToBase64DataUrl } from "./utils";
import fixWebmDuration from "webm-duration-fix";
import toast from "react-hot-toast";

interface Props {
  screenRecorderState: ScreenRecorderState;
  setScreenRecorderState: (state: ScreenRecorderState) => void;
  generateCode: (
    referenceImages: string[],
    inputMode: "image" | "video"
  ) => void;
}

function ScreenRecorder({
  screenRecorderState,
  setScreenRecorderState,
  generateCode,
}: Props) {
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [screenRecordingDataUrl, setScreenRecordingDataUrl] = useState<string | null>(null);

  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas size to match video dimensions
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw current video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to data URL and generate code
      const frameDataUrl = canvas.toDataURL('image/jpeg', 0.85);
      generateCode([frameDataUrl], "image");
    }
  };

  const startScreenRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      setMediaStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      const options = { mimeType: "video/webm" };
      const mediaRecorder = new MediaRecorder(stream, options);
      setMediaRecorder(mediaRecorder);

      const chunks: BlobPart[] = [];

      // Set up continuous generation
      const generateInterval = setInterval(() => {
        captureFrame();
      }, 1000); // Generate every second

      mediaRecorder.ondataavailable = (e: BlobEvent) => {
        chunks.push(e.data);
      };

      mediaRecorder.start(500);

      mediaRecorder.onstop = async () => {
        // Clear the generation interval when stopping
        clearInterval(generateInterval);
        
        const completeBlob = await fixWebmDuration(
          new Blob(chunks, { type: options.mimeType })
        );
        
        if (videoRef.current) {
          videoRef.current.srcObject = null;
        }
        
        const dataUrl = await blobToBase64DataUrl(completeBlob);
        setScreenRecordingDataUrl(dataUrl);
        setScreenRecorderState(ScreenRecorderState.FINISHED);
      };

      setScreenRecorderState(ScreenRecorderState.RECORDING);
    } catch (error) {
      toast.error("Could not start screen recording");
      throw error;
    }
  };

  const stopScreenRecording = () => {
    // Stop the recorder
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }

    // Stop the screen sharing stream
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  };

  const kickoffGeneration = () => {
    if (screenRecordingDataUrl) {
      generateCode([screenRecordingDataUrl], "video");
    } else {
      toast.error("Screen recording does not exist. Please try again.");
      throw new Error("No screen recording data url");
    }
  };

  return (
    <>
      <video ref={videoRef} style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <div className="flex items-center justify-center my-3">
        {screenRecorderState === ScreenRecorderState.INITIAL && (
          <Button onClick={startScreenRecording}>Record Screen</Button>
        )}

        {screenRecorderState === ScreenRecorderState.RECORDING && (
          <div className="flex items-center flex-col gap-y-4">
            <div className="flex items-center mr-2 text-xl gap-x-1">
              <span className="block h-10 w-10 bg-red-600 rounded-full mr-1 animate-pulse"></span>
              <span>Recording...</span>
            </div>
            <Button onClick={stopScreenRecording}>Finish Recording</Button>
          </div>
        )}

        {screenRecorderState === ScreenRecorderState.FINISHED && (
          <div className="flex items-center flex-col gap-y-4">
            <div className="flex items-center mr-2 text-xl gap-x-1">
              <span>Screen Recording Captured.</span>
            </div>
            {screenRecordingDataUrl && (
              <video
                muted
                autoPlay
                loop
                className="w-[340px] border border-gray-200 rounded-md"
                src={screenRecordingDataUrl}
              />
            )}
            <div className="flex gap-x-2">
              <Button
                variant="secondary"
                onClick={() =>
                  setScreenRecorderState(ScreenRecorderState.INITIAL)
                }
              >
                Re-record
              </Button>
              <Button onClick={kickoffGeneration}>Generate</Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default ScreenRecorder;
