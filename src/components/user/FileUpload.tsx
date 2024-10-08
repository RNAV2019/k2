"use client";
import React, { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import {
  type DropzoneInputProps,
  type DropzoneOptions,
  type DropzoneRootProps,
  useDropzone,
} from "react-dropzone";
import { Trash } from "~/icons/Trash";
import {
  blobUrlToBlob,
  downloadBlobAsImage,
  downloadBlobsAsZip,
} from "~/lib/helper";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
import { Spinner } from "../ui/spinner";

interface ImageResponse {
  message: string;
  processed_images: string[];
}

export default function FileUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<string>("webp");
  const [quality, setQuality] = useState<number>(80);
  const [scale, setScale] = useState<number>(100);
  const [optimizedImages, setOptimizedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const removeFile = (file: File) => {
    setFiles((currentFiles) => currentFiles.filter((f) => f !== file));
  };

  const handleUpload = async () => {
    setLoading(true);
    const formData = new FormData();

    files.forEach((file) => {
      formData.append("image", file);
    });

    formData.append("quality", quality.toString());
    formData.append("scale", scale.toString());
    formData.append("format", format);
    try {
      const response = await fetch(
        "https://k2-backend.shuttleapp.rs/optimize",
        {
          method: "POST",
          body: formData,
          mode: "cors",
        },
      );
      // const response = await fetch("http://localhost:8000/optimize", {
      //   method: "POST",
      //   body: formData,
      //   mode: "cors",
      // });

      if (response.ok) {
        const data = (await response.json()) as ImageResponse;
        setOptimizedImages(data.processed_images);
      } else {
        console.error("Image optimization failed.");
      }
    } catch (error) {
      console.error("Error during optimization:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle individual file download
  const handleDownload = (imageSrc: string) => {
    if (optimizedImages) {
      downloadBlobAsImage(imageSrc, `optimized-image.${format}`);
    }
  };

  // Download all processed images as a ZIP file
  const handleDownloadZip = async () => {
    if (optimizedImages.length === 0) return;
    const optimizedBlobs: Blob[] = [];
    for (const optimizedFile of optimizedImages) {
      optimizedBlobs.push(await blobUrlToBlob(optimizedFile));
    }
    await downloadBlobsAsZip(optimizedBlobs, format);
  };

  const { getRootProps, getInputProps, open } = useDropzone({
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onDrop,
    accept: {
      "image/*": [],
    },
    noClick: true,
  } as DropzoneOptions);

  useEffect(() => {
    setFiles([]);
  }, [optimizedImages]);

  const rootProps: DropzoneRootProps = getRootProps();
  const inputProps: DropzoneInputProps = getInputProps();

  return (
    <>
      <div className="flex h-full w-full max-w-xs grow flex-col gap-4 md:max-w-full">
        <div className="order-2 flex flex-col items-center justify-between gap-4 md:order-1 md:flex-row md:items-start md:gap-0">
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <Select
              onValueChange={(value) => {
                setFormat(value);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Format" defaultValue={"webp"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="webp">WEBP</SelectItem>
                <SelectItem value="png" defaultChecked>
                  PNG
                </SelectItem>
                <SelectItem value="jpg">JPG</SelectItem>
              </SelectContent>
            </Select>
            <Label htmlFor="quality-slider">Quality</Label>
            <Slider
              name="quality-slider"
              defaultValue={[80]}
              max={100}
              min={60}
              step={1}
              onValueChange={(newQuality) => {
                setQuality(newQuality[0] ?? 80);
              }}
            />
            <p className="text-sm text-primary">{quality}</p>
            <Label htmlFor="scale-slider">Scale</Label>
            <Slider
              name="scale-slider"
              defaultValue={[100]}
              max={100}
              min={10}
              step={1}
              onValueChange={(newScale) => {
                setScale(newScale[0] ?? 100);
              }}
            />
            <p className="text-sm text-primary">{scale}%</p>
          </div>
          <div className="flex flex-row items-center gap-4">
            <Button
              onClick={() => handleDownloadZip()}
              disabled={loading || optimizedImages.length == 0}
            >
              Download All
            </Button>
            <Button
              onClick={() => {
                setFiles([]);
                setOptimizedImages([]);
              }}
            >
              Clear Queue
            </Button>
          </div>
        </div>
        <div className="order-1 flex grow flex-col gap-4 md:order-2 md:flex-row">
          <div
            className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-muted-foreground p-4 focus:outline-none focus:ring-2 focus:ring-muted-foreground focus:ring-offset-2`}
          >
            <div className="grow" {...rootProps}>
              <input {...inputProps} />
              <button className="p-8 text-center" onClick={() => open()}>
                <p className="text-foreground">
                  Drag and drop files, or click here to select files
                </p>
                <p className="text-sm text-muted-foreground">
                  Accepted formats: Images
                </p>
              </button>
              <div className="mt-8 grid max-h-80 grid-cols-2 gap-4 overflow-y-scroll p-4">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="relative flex h-auto w-48 flex-col items-center rounded-md border border-dashed border-muted-foreground p-3"
                  >
                    <Image
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="h-20 w-auto rounded-md"
                      width={200}
                      height={200}
                    />
                    <div className="z-10 mt-2 flex flex-row justify-center gap-2">
                      <p className="truncate text-center text-xs">
                        {file.name}
                      </p>
                      <button
                        type="button"
                        className="scale-100 transition-transform hover:scale-110"
                        onClick={() => removeFile(file)}
                      >
                        <Trash className="h-4 w-4 text-current" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div
            className={`flex min-h-full w-full flex-col items-center justify-start rounded-lg border border-dashed border-muted-foreground p-4 focus:outline-none focus:ring-2 focus:ring-muted-foreground focus:ring-offset-2`}
          >
            {loading && (
              <div className="flex h-full grow flex-col justify-center">
                <Spinner show={loading} />
              </div>
            )}
            <div className="grid max-h-full grid-cols-2 gap-4 overflow-y-scroll">
              {!loading &&
                optimizedImages.length > 0 &&
                optimizedImages.map((image, index) => {
                  return (
                    <div
                      key={index}
                      className="relative flex h-auto w-48 flex-col items-center rounded-md border border-dashed border-muted-foreground p-3 py-5"
                    >
                      <Image
                        src={image}
                        alt={`Image ${index}`}
                        className="h-20 w-auto rounded-md"
                        width={200}
                        height={200}
                      />
                      <div className="z-10 mt-2 flex flex-row justify-center gap-2">
                        <Button
                          type="button"
                          className="scale-100 text-xs transition-transform hover:scale-110"
                          onClick={() => handleDownload(image)}
                        >
                          Download
                        </Button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
        <Button className="order-3" onClick={() => handleUpload()}>
          Optimize
        </Button>
      </div>
    </>
  );
}
