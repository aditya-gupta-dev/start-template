'use client';
import {  useRef, useEffect } from 'react';
import { BarcodeDetector } from 'barcode-detector/ponyfill';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ModeToggle } from '@/components/mode-toggle';
import { useRouter } from 'next/navigation';

export default function WebcamBarcodeScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch {
      }
    };
    
    startWebcam();
    
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const captureFrame = async () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageUrl = canvas.toDataURL("image/png");
        const image = new Image();
        image.src = imageUrl;
        image.onload = async () => {
          const barcodeDetector = new BarcodeDetector({
            formats: ["qr_code", "ean_13", "ean_8", "code_39", "code_128"],
          });
          try {
            const res = await barcodeDetector.detect(image);
            if (res && res.length > 0) {
              console.log(`Detected barcode`)
              router.push(`product/${res[0].rawValue}`)
            } else {
              console.log("No barcode detected in the current frame.");
            }
          } catch {
            console.log("Error detecting barcode");
          }
        };
      }
    }
  };

  return (
    <div className='flex flex-col min-h-screen w-full items-center justify-center gap-y-4'>

      <Card className="w-[350px] lg:w-[500px]">
        <CardContent>
          <CardHeader>
            <CardTitle className='text-2xl flex flex-row justify-between'>
              <span>Scan </span>
              <ModeToggle />
            </CardTitle>
            <CardDescription>Scan with images & live webcam feed</CardDescription>
          </CardHeader>
          <div className="flex flex-col items-center gap-y-4 mt-4">
            <video
              ref={videoRef}
              autoPlay
              className="w-full max-h-80 border border-background rounded-xl"
              id="feed"
            >

            </video>
            <div className='flex flex-row w-full justify-between items-center'>
              <Button onClick={captureFrame}>Scan This Frame</Button>
              <Button>
                <label htmlFor='fileInput' className='cursor-pointer'>
                  Upload Image
                </label>
              </Button>
              <input
                type="file"
                id="fileInput"
                accept="image/*"
                max={1}
                onChange={async (e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    const file = files[0];
                    const image = new Image();
                    image.src = URL.createObjectURL(file);
                    image.onload = async () => {
                      const barcodeDetector = new BarcodeDetector({
                        formats: ['qr_code', 'ean_13', 'ean_8', 'code_39', 'code_128']
                      })
                      try {
                        const res = await barcodeDetector.detect(image);
                        if (res && res.length > 0) {
                          console.log("Barcode Detected, Redirecting...")
                          router.push(`product/${res[0].rawValue}`)
                        } else {
                          console.log("No barcode detected")
                        }
                      } catch {
                        console.log("Error detecting barcode ")
                      }
                    };
                  }
                }}
                className="border p-2 hidden"
              />
            </div>

          </div>
        </CardContent>
      </Card>
    </div>
  );
}