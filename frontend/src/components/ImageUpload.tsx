import { useState, useEffect, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { toast } from "react-hot-toast";
import { URLS } from "../urls";
import ScreenRecorder from "./recording/ScreenRecorder";
import CameraCapture from "./CameraCapture";
import { ScreenRecorderState } from "../types";

const baseStyle = {
  flex: 1,
  width: "80%",
  margin: "0 auto",
  minHeight: "400px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  borderWidth: 2,
  borderRadius: 2,
  borderColor: "#eeeeee",
  borderStyle: "dashed",
  backgroundColor: "#fafafa",
  color: "#bdbdbd",
  outline: "none",
  transition: "border .24s ease-in-out",
};

const focusedStyle = {
  borderColor: "#2196f3",
};

const acceptStyle = {
  borderColor: "#00e676",
};

const rejectStyle = {
  borderColor: "#ff1744",
};

// TODO: Move to a separate file
function fileToDataURL(file: File) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

type FileWithPreview = {
  preview: string;
} & File;

interface Props {
  setReferenceImages: (
    referenceImages: string[],
    inputMode: "image" | "video"
  ) => void;
}

function ImageUpload({ setReferenceImages }: Props) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  // TODO: Switch to Zustand
  const [screenRecorderState, setScreenRecorderState] =
    useState<ScreenRecorderState>(ScreenRecorderState.INITIAL);

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
    useDropzone({
      maxFiles: 1,
      maxSize: 1024 * 1024 * 20, // 20 MB
      accept: {
        // Image formats
        "image/png": [".png"],
        "image/jpeg": [".jpeg"],
        "image/jpg": [".jpg"],
        // Video formats
        "video/quicktime": [".mov"],
        "video/mp4": [".mp4"],
        "video/webm": [".webm"],
      },
      onDrop: (acceptedFiles) => {
        // Set up the preview thumbnail images
        setFiles(
          acceptedFiles.map((file: File) =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            })
          ) as FileWithPreview[]
        );

        // Convert images to data URLs and set the prompt images state
        Promise.all(acceptedFiles.map((file) => fileToDataURL(file)))
          .then((dataUrls) => {
            if (dataUrls.length > 0) {
              setReferenceImages(
                dataUrls.map((dataUrl) => dataUrl as string),
                (dataUrls[0] as string).startsWith("data:video")
                  ? "video"
                  : "image"
              );
            }
          })
          .catch((error) => {
            toast.error("Error reading files" + error);
            console.error("Error reading files:", error);
          });
      },
      onDropRejected: (rejectedFiles) => {
        toast.error(rejectedFiles[0].errors[0].message);
      },
    });

  // const pasteEvent = useCallback(
  //   (event: ClipboardEvent) => {
  //     const clipboardData = event.clipboardData;
  //     if (!clipboardData) return;

  //     const items = clipboardData.items;
  //     const files = [];
  //     for (let i = 0; i < items.length; i++) {
  //       const file = items[i].getAsFile();
  //       if (file && file.type.startsWith("image/")) {
  //         files.push(file);
  //       }
  //     }

  //     // Convert images to data URLs and set the prompt images state
  //     Promise.all(files.map((file) => fileToDataURL(file)))
  //       .then((dataUrls) => {
  //         if (dataUrls.length > 0) {
  //           setReferenceImages(dataUrls.map((dataUrl) => dataUrl as string));
  //         }
  //       })
  //       .catch((error) => {
  //         // TODO: Display error to user
  //         console.error("Error reading files:", error);
  //       });
  //   },
  //   [setReferenceImages]
  // );

  // TODO: Make sure we don't listen to paste events in text input components
  // useEffect(() => {
  //   window.addEventListener("paste", pasteEvent);
  // }, [pasteEvent]);

  useEffect(() => {
    return () => files.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [files]); // Added files as a dependency

  const style = useMemo(
    () => ({
      ...baseStyle,
      ...(isFocused ? focusedStyle : {}),
      ...(isDragAccept ? acceptStyle : {}),
      ...(isDragReject ? rejectStyle : {}),
    }),
    [isFocused, isDragAccept, isDragReject]
  );

  const handleCameraCapture = (imageDataUrl: string) => {
    try {
      console.log("Processing camera capture...");
      // Create a preview for the captured image
      const preview = URL.createObjectURL(
        dataURLtoBlob(imageDataUrl)
      );
      
      // Create a File object from the data URL
      const file = dataURLtoFile(imageDataUrl, "camera-capture.jpg");
      const fileWithPreview = Object.assign(file, { preview });
      
      // Update files state
      setFiles([fileWithPreview]);
      
      // Set reference images for code generation
      setReferenceImages([imageDataUrl], "image");
      console.log("Camera capture processed successfully");
    } catch (error) {
      console.error("Error processing camera capture:", error);
      toast.error("Failed to process camera capture. Please try again.");
    }
  };

  // Helper function to convert data URL to Blob
  const dataURLtoBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  // Helper function to convert data URL to File
  const dataURLtoFile = (dataURL: string, filename: string): File => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  return (
    <section className="container">
      {screenRecorderState === ScreenRecorderState.INITIAL && (
        <>
          <div {...getRootProps({ style: style as any })}>
            <input {...getInputProps()} className="file-input" />
            <p className="text-slate-700 text-lg">
              Drag & drop a screenshot here, <br />
              or click to upload
            </p>
          </div>
          <div className="flex flex-col items-center gap-4 mt-4">
            <div className="text-gray-500 text-sm">Or capture from camera</div>
            <CameraCapture onCapture={handleCameraCapture} />
          </div>
        </>
      )}
      {screenRecorderState === ScreenRecorderState.INITIAL && (
        <div className="text-center text-sm text-slate-800 mt-4">
          Upload a screen recording (.mp4, .mov) or record your screen to clone it
        </div>
      )}
      <ScreenRecorder
        screenRecorderState={screenRecorderState}
        setScreenRecorderState={setScreenRecorderState}
        generateCode={setReferenceImages}
      />
    </section>
  );
}

export default ImageUpload;
