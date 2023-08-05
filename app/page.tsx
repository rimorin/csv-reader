"use client";
import { useEffect, useMemo, useState } from "react";
import { Upload } from "upload-js";
import InvoiceTable from "./components/table";
import { FileInput, Navbar, Progress } from "flowbite-react";
import Image from "next/image";

const upload = Upload({
  apiKey: process.env.NEXT_PUBLIC_UPLOAD_IO_API_KEY || "",
});

export default function Home() {
  const [fileUrl, setFileUrl] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);

  const onFileSelected = async (event: any) => {
    try {
      // check if the file is a CSV file
      if (!event.target.files[0].name.endsWith(".csv")) {
        alert("Please upload a CSV file!");
        return;
      }
      setFileUrl("");
      const { fileUrl } = await upload.uploadFile(event.target.files[0], {
        onProgress: ({ progress }) => setProgress(progress),
      });

      alert("File uploaded!\nProceeding to parse the file...");
      // save the fileUrl to localStorage so that we can retrieve it on page load
      localStorage.setItem("fileUrl", fileUrl);
      setFileUrl(fileUrl);
    } catch (e: any) {
      alert(`Error!\n${e.message}`);
    } finally {
      setProgress(0);
      event.target.value = "";
    }
  };

  const NavbarMemo = useMemo(
    () => (
      <Navbar.Brand href="https://github.com/rimorin/csv_reader">
        <Image
          src="csv.svg"
          className="h-8 mr-3"
          alt="CSV Logo"
          width={32}
          height={32}
        />
        <span className="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
          CSV Reader
        </span>
      </Navbar.Brand>
    ),
    []
  );

  const APIMissing = useMemo(
    () => (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-semibold text-center">
          Please set your Upload.IO API key into your environment
        </h1>
        <p className="text-center">
          You can get your API key from{" "}
          <a
            href="https://upload.io/dashboard/files"
            className="text-blue-500 hover:underline"
          >
            here
          </a>
        </p>
      </div>
    ),
    []
  );

  useEffect(() => {
    // on page load, check if there's a fileUrl in localStorage. If there is, proceed to parse the file
    setFileUrl(localStorage.getItem("fileUrl") || "");
  }, []);

  const isMissingUploadAPIKey = !process.env.NEXT_PUBLIC_UPLOAD_IO_API_KEY;
  const isFileUploading = progress > 0;

  // if the UPLOAD_IO_API_KEY is missing, show the APIMissing component
  if (isMissingUploadAPIKey) {
    return APIMissing;
  }

  return (
    <main className="min-h-screen items-center container mx-auto">
      <Navbar fluid rounded>
        {NavbarMemo}
        <Navbar.Toggle />
        <Navbar.Collapse>
          <FileInput
            disabled={isFileUploading}
            data-testid="fileUpload"
            onChange={onFileSelected}
          />
        </Navbar.Collapse>
      </Navbar>
      {isFileUploading && (
        <div className="w-1/2 mx-auto mt-5">
          <Progress
            data-testid="progress"
            labelProgress
            labelText
            progress={progress}
            textLabelPosition="outside"
            size="lg"
            textLabel="Upload Progress"
          />
        </div>
      )}
      {fileUrl && <InvoiceTable url={fileUrl} />}
    </main>
  );
}
