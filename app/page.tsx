"use client";
import { useState } from "react";
import { Upload } from "upload-js";
import InvoiceTable from "./components/table";

export default function Home() {
  const [fileUrl, setFileUrl] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);

  const isMissingUploadAPIKey = !process.env.NEXT_PUBLIC_UPLOAD_IO_API_KEY;

  const onFileSelected = async (event: any) => {
    const upload = Upload({
      apiKey: process.env.NEXT_PUBLIC_UPLOAD_IO_API_KEY || "",
    });
    try {
      if (!event.target.files[0].name.endsWith(".csv")) {
        alert("Please upload a CSV file!");
        return;
      }

      const { fileUrl } = await upload.uploadFile(event.target.files[0], {
        onProgress: ({ progress }) => setProgress(progress),
      });
      setFileUrl(fileUrl);
      alert(`File uploaded!\nProcessing CSV File...`);
    } catch (e: any) {
      alert(`Error!\n${e.message}`);
    } finally {
      setProgress(0);
      event.target.value = "";
      upload.endAuthSession();
    }
  };

  if (isMissingUploadAPIKey) {
    return (
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
    );
  }

  return (
    <main className="min-h-screen items-center container mx-auto">
      <nav className="bg-white border-gray-200 dark:bg-gray-900">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <a href="https://flowbite.com/" className="flex items-center">
            <img
              src="https://www.svgrepo.com/download/375309/csv-document.svg"
              className="h-8 mr-3"
              alt="CSV Logo"
            />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
              CSV File Upload
            </span>
          </a>
          <div className="md:order-2">
            {progress > 0 && (
              <div className="w-full bg-neutral-200 dark:bg-neutral-600">
                <div
                  className="bg-blue-400 p-0.5 text-center text-xs font-medium leading-none text-primary-100"
                  style={{ width: `${progress}%` }}
                >
                  {progress}%
                </div>
              </div>
            )}
            <input
              className="relative m-0 block w-full min-w-0 flex-auto rounded border border-solid border-neutral-300 bg-clip-padding px-3 py-[0.32rem] text-base font-normal text-neutral-700 transition duration-300 ease-in-out file:-mx-3 file:-my-[0.32rem] file:overflow-hidden file:rounded-none file:border-0 file:border-solid file:border-inherit file:bg-neutral-100 file:px-3 file:py-[0.32rem] file:text-neutral-700 file:transition file:duration-150 file:ease-in-out file:[border-inline-end-width:1px] file:[margin-inline-end:0.75rem] hover:file:bg-neutral-200 focus:border-primary focus:text-neutral-700 focus:shadow-te-primary focus:outline-none dark:border-neutral-600 dark:text-neutral-200 dark:file:bg-neutral-700 dark:file:text-neutral-100 dark:focus:border-primary"
              type="file"
              id="formFile"
              onChange={onFileSelected}
            />
          </div>
        </div>
      </nav>
      {fileUrl && (
        <div>
          <InvoiceTable url={fileUrl} />
        </div>
      )}
    </main>
  );
}
