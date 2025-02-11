'use client';

import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "./ui/dialog"; // Import DialogTitle
import { Button } from "./ui/button";
import Dropzone from "react-dropzone";
import { Cloud } from "lucide-react";
import { File } from "lucide-react";
import { Progress } from "./ui/progress";
import { useUploadThing } from "@/lib/uploadthing";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const UploadDropzone = () => {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { toast } = useToast();

  const { startUpload } = useUploadThing("pdfUploader");

  const { mutate: startPolling } = trpc.getFile.useMutation({
    onSuccess: (file) => {
      router.push(`/dashboard/${file.id}`)
    },
    retry: true,
    retryDelay: 500,
  });

  const startSimulatedProgress = () => {
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((prevProgress) => {
        if (prevProgress >= 95) {
          clearInterval(interval); // Stop interval when progress reaches 95%
          return prevProgress;
        }
        return prevProgress + 8; // Increment progress by 8 every 300ms
      });
    }, 300);

    return interval; // Return interval for later clearance
  };

  return (
    
    <Dropzone
      multiple={false}
      onDrop={async (acceptedFiles) => {
        setIsUploading(true); // Indicate upload started
        const progressInterval = startSimulatedProgress(); // Start progress simulation

        // Simulate file upload delay (15 seconds)
        const res = await startUpload(acceptedFiles);
        if (!res) {
          return toast({
            title: "Oops, something went wrong",
            description: "Please try again later",
            variant: "destructive",
          });
        }

        const [fileResponse] = res;
        const key = fileResponse?.key;

        if (!key) {
          return toast({
            title: "Oops, something went wrong",
            description: "Please try again later",
            variant: "destructive",
          });
        }

        await new Promise((resolve) => setTimeout(resolve, 15000));

        // Clear the progress interval and complete upload
        clearInterval(progressInterval);
        setUploadProgress(100); // Set progress to 100%
        setIsUploading(false); // Indicate upload is complete

        startPolling({ key });
      }}
    >
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div
          {...getRootProps()}
          className="border h-64 m-4 border-dashed border-gray-300 rounded-lg"
        >
          <input {...getInputProps()} />
          <div className="flex items-center justify-center h-full w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Cloud className="h-6 w-6 text-zinc-500 mb-2" />
                <p className="mb-2 text-sm text-zinc-700">
                  <span className="font-semibold">Click to upload</span> or Drag
                  'n' drop a file here
                </p>
                <p className="text-xs text-zinc-500">PDF (up to 4MB)</p>
              </div>

              {acceptedFiles && acceptedFiles[0] ? (
                <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                  <div className="px-3 py-2 h-full grid place-items-center">
                    <File className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="px-3 py-2 h-full text-sm truncate">
                    {acceptedFiles[0].name}
                  </div>
                </div>
              ) : null}

              {isUploading ? (
                <div className="w-full mt-4 max-xs mx-auto">
                  <Progress
                  indicatorColor={
                    uploadProgress === 100 ? "bg-green-500" : ""
                  }
                  value={uploadProgress} 
                  className="h-1 w-full bg-zinc-200" />

                  {uploadProgress === 100 ? (
                    <div className = "flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2">
                      <Loader2 className="h-3 w-3 animate-spin"></Loader2>
                      Redireecting...
                    </div>
                  ) : null}
                </div>
              ) : null}

              <input
                {...getInputProps()}
                type="file"
                id="dropzone-file"
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </Dropzone>
  );
};



const UploadButton = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(v) => {
        if (!v) {
          setIsOpen(false); // Correctly invoking setIsOpen to close the dialog
        }
      }}
    >
      <DialogTrigger onClick={() => setIsOpen(true)} asChild>
        <Button>Upload PDF</Button>
      </DialogTrigger>

      <DialogContent>
        {/* Add DialogTitle for accessibility */}
        <DialogTitle>Upload PDF File</DialogTitle>
        <UploadDropzone /> {/* Correctly rendering the UploadDropzone */}
      </DialogContent>
    </Dialog>
  );
};

export default UploadButton;
