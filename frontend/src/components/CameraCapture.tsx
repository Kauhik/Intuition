// import React, { useState, useRef, useEffect } from "react";
// import { Button } from "./ui/button";
// import { toast } from "react-hot-toast";

// interface Props {
//   onCapture: (imageDataUrl: string) => void;
// }

// const CameraCapture: React.FC<Props> = ({ onCapture }) => {
//   const [isStreaming, setIsStreaming] = useState(false);
//   const [isCapturing, setIsCapturing] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [capturedImage, setCapturedImage] = useState<string | null>(null);
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const streamRef = useRef<MediaStream | null>(null);

//   // Function to detect Safari browser
//   const isSafari = () => {
//     return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
//   };

//   const startCamera = async () => {
//     try {
//       setError(null);
//       setIsCapturing(false);
//       setCapturedImage(null);
//       toast.loading('Initializing camera...', { id: 'camera-loading' });

//       // Clean up any existing streams
//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach(track => track.stop());
//         streamRef.current = null;
//       }

//       // Check for browser support
//       if (!navigator.mediaDevices?.getUserMedia) {
//         throw new Error('Camera API is not supported in your browser');
//       }

//       console.log('Browser detected:', isSafari() ? 'Safari' : 'Other browser');

//       // Safari-specific workaround for HTTPS requirement
//       if (isSafari() && window.location.protocol !== 'https:' && !window.location.hostname.includes('localhost')) {
//         throw new Error('Safari requires HTTPS for camera access. Please use HTTPS or try another browser.');
//       }

//       // Start with very basic constraints
//       const constraints: MediaStreamConstraints = {
//         video: {
//           facingMode: 'user',
//           width: { ideal: 640 },
//           height: { ideal: 480 }
//         },
//         audio: false
//       };

//       console.log('Requesting camera with constraints:', constraints);
      
//       // Use a timeout to give browsers more time to initialize the camera
//       setTimeout(async () => {
//         try {
//           const stream = await navigator.mediaDevices.getUserMedia(constraints);
//           console.log('Stream obtained successfully');
          
//           // Store the stream reference
//           streamRef.current = stream;
          
//           // Ensure video element exists
//           if (!videoRef.current) {
//             throw new Error('Video element not initialized');
//           }
          
//           // Special handling for Safari
//           if (isSafari()) {
//             // Force cleanup first
//             videoRef.current.srcObject = null;
//             videoRef.current.load();
            
//             // Small delay before setting the stream in Safari
//             setTimeout(() => {
//               if (videoRef.current) {
//                 videoRef.current.srcObject = stream;
//                 videoRef.current.muted = true;
//                 videoRef.current.playsInline = true;
                
//                 videoRef.current.play()
//                   .then(() => {
//                     setIsStreaming(true);
//                     toast.dismiss('camera-loading');
//                     toast.success('Camera ready!');
//                   })
//                   .catch(playError => {
//                     console.error('Video play failed:', playError);
//                     toast.dismiss('camera-loading');
//                     toast.error('Failed to start video playback');
//                     setError('Failed to start video playback. Please ensure camera permissions are enabled and refresh the page.');
//                   });
//               }
//             }, 500);
//           } else {
//             // Non-Safari browsers
//             videoRef.current.srcObject = stream;
//             videoRef.current.muted = true;
//             videoRef.current.playsInline = true;
            
//             try {
//               await videoRef.current.play();
//               setIsStreaming(true);
//               toast.dismiss('camera-loading');
//               toast.success('Camera ready!');
//             } catch (playError) {
//               console.error('Video play failed:', playError);
//               toast.dismiss('camera-loading');
//               toast.error('Failed to start video playback');
//               setError('Failed to start video playback. Please ensure camera permissions are enabled.');
//             }
//           }
//         } catch (error) {
//           console.error("Camera access error:", error);
//           toast.dismiss('camera-loading');
//           const errorMessage = error instanceof Error ? error.message : String(error);
//           toast.error(`Camera error: ${errorMessage}`);
          
//           if (isSafari()) {
//             setError(`Camera access failed in Safari. Try these steps:
//               1. Check that camera permissions are enabled in Safari settings
//               2. Refresh the page and try again
//               3. Consider using Chrome or Firefox if issues persist`);
//           } else {
//             setError(`Camera access failed: ${errorMessage}. Please ensure your browser has camera permissions enabled and try again.`);
//           }
//         }
//       }, 300); // Short delay before camera initialization
//     } catch (error) {
//       console.error("Camera setup error:", error);
//       toast.dismiss('camera-loading');
//       const errorMessage = error instanceof Error ? error.message : String(error);
//       toast.error(`Camera setup error: ${errorMessage}`);
//       setError(`Camera setup failed: ${errorMessage}`);
//     }
//   };

//   const stopCamera = () => {
//     console.log('Stopping camera...');
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(track => {
//         console.log('Stopping track:', track.label);
//         track.stop();
//       });
//       streamRef.current = null;
//     }
    
//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//       videoRef.current.load();
//     }
    
//     setIsStreaming(false);
//   };

//   const captureImage = () => {
//     if (!videoRef.current || !canvasRef.current || !streamRef.current) {
//       toast.error("Camera not ready");
//       return;
//     }

//     try {
//       setIsCapturing(true);
//       toast.loading('Capturing image...', { id: 'capture-loading' });

//       const video = videoRef.current;
//       const canvas = canvasRef.current;
      
//       // Get video dimensions
//       const videoWidth = video.videoWidth || 640;
//       const videoHeight = video.videoHeight || 480;
      
//       console.log(`Capturing image at ${videoWidth}x${videoHeight}`);
      
//       // Set canvas dimensions to match video
//       canvas.width = videoWidth;
//       canvas.height = videoHeight;
      
//       // Get canvas context
//       const context = canvas.getContext('2d');
//       if (!context) {
//         throw new Error("Could not create canvas context");
//       }

//       // Draw the current video frame to the canvas
//       context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
//       // Convert to data URL with lower quality for Safari compatibility
//       try {
//         const imageDataUrl = canvas.toDataURL("image/jpeg", 0.85);
//         console.log("Image captured successfully");
//         setCapturedImage(imageDataUrl);
//         onCapture(imageDataUrl);
//         stopCamera();
//         toast.dismiss('capture-loading');
//         toast.success("Image captured! Generating website...");
//       } catch (canvasErr) {
//         console.error("Canvas to data URL error:", canvasErr);
//         throw new Error("Failed to process captured image");
//       }
//     } catch (error) {
//       console.error("Capture error:", error);
//       toast.dismiss('capture-loading');
//       toast.error("Failed to capture image");
//     } finally {
//       setIsCapturing(false);
//     }
//   };

//   const resetCapture = () => {
//     setCapturedImage(null);
//     setError(null);
//   };

//   // Special useEffect for Safari to handle camera permission changes
//   useEffect(() => {
//     if (isSafari()) {
//       const checkCameraAccess = () => {
//         navigator.permissions?.query({ name: 'camera' as PermissionName })
//           .then(permissionStatus => {
//             permissionStatus.onchange = () => {
//               if (permissionStatus.state === 'granted' && !isStreaming && !capturedImage) {
//                 console.log('Permission granted, restarting camera');
//                 startCamera();
//               } else if (permissionStatus.state !== 'granted' && isStreaming) {
//                 console.log('Permission revoked, stopping camera');
//                 stopCamera();
//                 setError('Camera permission was revoked. Please enable camera access and try again.');
//               }
//             };
//           })
//           .catch(err => console.log('Permission query not supported:', err));
//       };
      
//       checkCameraAccess();
//     }
//   }, [isStreaming, capturedImage]);

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       stopCamera();
//     };
//   }, []);

//   return (
//     <div className="flex flex-col items-center gap-4 w-full max-w-md">
//       {error && (
//         <div className="text-red-500 text-sm mb-2 text-center max-w-md">
//           {error}
//         </div>
//       )}
      
//       <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-4 w-full">
//         {isStreaming ? (
//           <video
//             ref={videoRef}
//             autoPlay
//             playsInline
//             muted
//             className="w-full h-full object-cover"
//           />
//         ) : capturedImage ? (
//           <img 
//             src={capturedImage} 
//             alt="Captured image" 
//             className="w-full h-full object-contain"
//           />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center">
//             <p className="text-gray-500 dark:text-gray-400">No camera feed</p>
//           </div>
//         )}
        
//         {/* Camera controls */}
//         <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
//           {isStreaming && (
//             <Button
//               onClick={captureImage}
//               disabled={isCapturing}
//               className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full"
//             >
//               Capture
//             </Button>
//           )}
          
//           {capturedImage && (
//             <Button
//               onClick={resetCapture}
//               className="bg-gray-700 hover:bg-gray-800 text-white p-3 rounded-full"
//             >
//               Reset
//             </Button>
//           )}
//         </div>
//       </div>

//       <div className="flex gap-4 w-full justify-center">
//         {capturedImage ? (
//           <>
//             <Button 
//               onClick={startCamera}
//               className="bg-blue-500 hover:bg-blue-600 text-white"
//             >
//               Take New Photo
//             </Button>
//           </>
//         ) : (
//           <Button 
//             onClick={isStreaming ? stopCamera : startCamera}
//             className={`${
//               isStreaming ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
//             } text-white`}
//           >
//             {isStreaming ? 'Stop Camera' : 'Start Camera'}
//           </Button>
//         )}
//       </div>

//       <canvas ref={canvasRef} className="hidden" />
//     </div>
//   );
// };

// export default CameraCapture;












// WORKS BBUT NO VISUAL
import React, { useState, useRef, useEffect } from "react";
import { toast } from "react-hot-toast";
import { Button } from "./ui/button";
import { Camera, RotateCcw } from "lucide-react";

interface Props {
  onCapture: (imageDataUrl: string) => void;
}

const CameraCapture: React.FC<Props> = ({ onCapture }) => {
  // isCapturing indicates the camera is active (similar to the snippet’s usage)
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start the camera with basic constraints.
  const startCamera = async () => {
    try {
      toast.loading("Initializing camera...", { id: "camera-loading" });
      // Clean up any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera API is not supported in your browser");
      }
      const constraints: MediaStreamConstraints = {
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
        videoRef.current.playsInline = true;
        await videoRef.current.play();
      }
      setIsCapturing(true);
      toast.dismiss("camera-loading");
      toast.success("Camera ready!");
    } catch (error) {
      toast.dismiss("camera-loading");
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Camera error: ${errorMessage}`);
      setError(errorMessage);
    }
  };

  // Stop the camera and clean up resources.
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  // Capture the current video frame and process the image.
  const handleCaptureAndProcess = () => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error("Camera not ready");
      return;
    }
    setIsProcessing(true);
    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const context = canvas.getContext("2d");
      if (!context) {
        throw new Error("Unable to get canvas context");
      }
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageDataUrl = canvas.toDataURL("image/jpeg", 0.85);
      setCapturedImage(imageDataUrl);
      onCapture(imageDataUrl);
      stopCamera();
      toast.success("Image captured!");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      toast.error(`Capture error: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset the captured image and error states.
  const resetCapture = () => {
    setCapturedImage(null);
    setError(null);
  };

  // Clean up the camera when the component unmounts.
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      {error && (
        <div className="text-red-500 text-sm mb-2 text-center max-w-md">
          {error}
        </div>
      )}

      <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden mb-4 w-full">
        {isCapturing ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : capturedImage ? (
          <img
            src={capturedImage}
            alt="Captured sketch"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <p className="text-gray-500 dark:text-gray-400">No image captured</p>
          </div>
        )}

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
          {isCapturing && (
            <button
              onClick={handleCaptureAndProcess}
              className="bg-red-500 text-white p-3 rounded-full hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
              disabled={isProcessing}
            >
              <Camera size={24} />
            </button>
          )}

          {capturedImage && (
            <button
              onClick={resetCapture}
              className="bg-gray-700 text-white p-3 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              <RotateCcw size={24} />
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-4 w-full justify-center">
        {/* Only show the Start Camera button if the camera is off and no image is captured */}
        {!isCapturing && !capturedImage && (
          <Button
            onClick={startCamera}
            className="bg-blue-500 hover:bg-blue-600 text-white"
          >
            Start Camera
          </Button>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default CameraCapture;




