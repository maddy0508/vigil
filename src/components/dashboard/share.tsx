
"use client"

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { generateQrCode, GenerateQrCodeOutput } from "@/ai/flows/qr-code-generator";
import { QrCode, Loader2, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function Share() {
  const [url, setUrl] = useState("");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerateQrCode = async () => {
    if (!url) {
      toast({
        variant: "destructive",
        title: "URL Required",
        description: "Please enter a URL to generate a QR code.",
      });
      return;
    }
    setIsLoading(true);
    setQrCode(null);
    try {
      const result: GenerateQrCodeOutput = await generateQrCode({ url });
      setQrCode(result.qrCodeDataUrl);
    } catch (error) {
      console.error("Failed to generate QR code", error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: "Could not generate QR code. Please ensure you have entered a valid URL.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = 'vigil-installer-qrcode.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Generate Install Link QR Code</h3>
            <p className="text-sm text-muted-foreground">
                Once you have built your application and hosted the installer file (`.deb` or `.exe`) online,
                paste the public download link here. We will generate a QR code that you can share for easy
                mobile-to-desktop installation.
            </p>
            <div>
                <label htmlFor="url-input" className="text-xs font-medium text-muted-foreground">Download URL</label>
                 <Input 
                    id="url-input"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://your-hosting-provider.com/vigil.deb"
                    className="flex-1"
                    disabled={isLoading}
                    autoComplete="off"
                />
            </div>
             <Button className="w-full" onClick={handleGenerateQrCode} disabled={isLoading || !url.trim()}>
                {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <QrCode className="mr-2 h-4 w-4" />
                )}
                Generate QR Code
            </Button>
        </div>
        <div className="space-y-4">
             <h3 className="font-semibold text-lg">Preview</h3>
             <div className="p-4 rounded-lg border bg-card-foreground/5 min-h-[250px] flex items-center justify-center">
                {isLoading && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <Loader2 className="h-10 w-10 mb-4 animate-spin text-primary" />
                        <p className="font-semibold">Generating QR Code...</p>
                    </div>
                )}
                {!isLoading && !qrCode && (
                     <Skeleton className="w-[200px] h-[200px] rounded-lg" />
                )}
                {qrCode && (
                    <div className="flex flex-col items-center gap-4">
                        <Image src={qrCode} alt="Generated QR Code" width={200} height={200} className="rounded-lg border-4 border-white shadow-lg" />
                        <Button variant="outline" onClick={handleDownload}>
                            <Download className="mr-2 h-4 w-4" />
                            Download QR Code
                        </Button>
                    </div>
                )}
            </div>
        </div>
    </div>
  )
}
