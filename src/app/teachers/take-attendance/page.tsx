'use client';

export const uuids = ['14718a48-0162-42fe-980c-a14946f8f619', '0e0b9fe4-f2e9-484b-9cd0-c12d336a91e0', 'b20cb4b3-cfda-442e-a54a-cbf78fb0d176', 'bbe1639b-9f45-4128-a935-b77b5f192b47', 'cf506b54-dba3-4246-8d7f-43b37b75345d', 'bba98286-2c64-4ed0-b057-9b12a16d875e', '3de07f79-36de-4d94-977f-c1ae78f8fafa', 'e7a794a4-c8a6-434e-be3e-1284ddde3a71', '574dfb2b-f5f3-466c-9206-c7c1bfe286db', '0225c43e-47eb-441e-aeef-2aaea073d952', 'd91af153-4dfc-495c-998c-9fe508db8eb5', 'c6473dcb-7ef7-4f2d-9354-ba2b42b31d39', '60bfb143-40aa-4ec7-aace-5e20a14c4aa0', '4f313366-0ea7-41c8-9d00-c736b3659d41', '427a80dd-d458-48e5-9baf-081fba67a60c', 'd7e6e656-3dec-480f-98e2-e4fa73ec8130', '8811805c-c432-4bd4-878f-10091e9542fd', '100fdf95-f916-4025-89d0-9f881a9d4712', 'bb0d8174-c0d5-4fde-afdf-81775d26a6a3', '61f40fc3-8415-4f4e-8964-f9ac64f20c5e', '14028002-abbf-4b4a-9e64-a801238664f0', '98836440-063d-410d-9deb-a9bfb2a68141', '61ec1d16-a987-4119-abe1-0c1915b644c5', '60fccec9-2707-4276-8312-9b51d37c2de1', '2915427d-5bf2-4af6-9ddd-6ba22fd421bc', '1df26a3a-b89c-402d-b91d-ee62bcc80f3e', 'c899a2cf-cd70-4dcc-ae07-9aa29cd158ec', '4a7d412c-aa21-42b8-9e7c-17e7fcf2b262', 'fc128bbf-8766-4a93-baf9-5fb30a13a76d', '10f2cb58-5218-424f-b859-f673648ac13a']

import React, { useEffect, useState, useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface QRData {
  id: number;
  value: string;
  createdAt: number;
}

const duration = 2000

export default function QRGenerator() {
  const [qrList, setQrList] = useState<QRData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter()
  const [isRunning, setIsRunning] = useState(true)

  useEffect(() => {
    const now = Date.now();
    const qrArray: QRData[] = []

    for (let i = 0; i < uuids.length; i++) {
      qrArray.push({
        id: i,
        value: uuids[i],
        createdAt: Date.now() + i * duration
      })

      setQrList(qrArray)
    }

    setQrList(qrArray);
  }, []);

  useEffect(() => {
    if (qrList.length === 0) return;

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1;
        if (next >= qrList.length) {
          clearInterval(intervalRef.current!);
          return prev;
        }
        return next;
      });
    }, duration);

    return () => clearInterval(intervalRef.current!);
  }, [qrList]);

  if (qrList.length === 0) {
    return <div className="text-center text-lg p-4">Generating QR Codes...</div>;
  }

  const currentQR = qrList[currentIndex];
  const timeRemaining =
    (duration / 1000) - Math.floor((Date.now() - currentQR.createdAt) / 1000);

  return (
    <div className="flex flex-col gap-x-4 items-center justify-center p-6 space-y-4 ">
      <div className="flex flex-row gap-x-4">
        <Card className="shadow-2xl">
          <CardContent>
            <CardTitle>Configure settings</CardTitle>

          </CardContent>
        </Card>
        {isRunning &&
          <Card className="shadow-2xl">
            <CardContent>
              <CardTitle>
                <h1 className="text-xl font-bold">QR Code {currentIndex + 1}/30</h1>
              </CardTitle>
              {timeRemaining > 0 ? (
                <>
                  <QRCodeCanvas value={currentQR.value} size={400} />
                  <p className="text-gray-500">Auto Expires in {timeRemaining}s</p>
                </>
              ) : (
                <p className="text-red-500">Expired</p>
              )}
            </CardContent>
          </Card>
        }

      </div>
      <div className="max-w-fit flex flex-row gap-x-4">
        <Button className="w-full" onClick={() => setIsRunning(false)}>
          Stop
        </Button>
      </div>
    </div>
  );
}