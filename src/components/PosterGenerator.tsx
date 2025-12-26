import { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Printer, Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PosterGeneratorProps {
  person: {
    id: string;
    full_name: string;
    age?: number;
    gender?: string;
    height?: string;
    weight?: string;
    last_seen_location: string;
    last_seen_date: string;
    clothing_description?: string;
    distinguishing_features?: string;
    photo_url?: string;
  };
}

export const PosterGenerator = ({ person }: PosterGeneratorProps) => {
  const { toast } = useToast();
  const posterRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [signedPhotoUrl, setSignedPhotoUrl] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const shareUrl = `${window.location.origin}/person/${person.id}`;

  useEffect(() => {
    if (isOpen && person.photo_url) {
      getSignedUrl();
    }
  }, [isOpen, person.photo_url]);

  const getSignedUrl = async () => {
    if (!person.photo_url) return;

    try {
      const { data, error } = await supabase.storage
        .from("missing-persons-photos")
        .createSignedUrl(person.photo_url, 3600);

      if (error) throw error;
      setSignedPhotoUrl(data.signedUrl);
    } catch (error) {
      console.error("Error getting signed URL:", error);
    }
  };

  const handleDownload = async () => {
    if (!posterRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement("a");
      link.download = `missing-person-${person.full_name.replace(/\s+/g, "-").toLowerCase()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast({
        title: "Poster Downloaded",
        description: "The poster has been saved to your device.",
      });
    } catch (error) {
      console.error("Error generating poster:", error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate the poster. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow || !posterRef.current) return;

    const posterHtml = posterRef.current.outerHTML;
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Missing Person Poster - ${person.full_name}</title>
          <style>
            @page { size: A4; margin: 0; }
            body { 
              margin: 0; 
              display: flex; 
              justify-content: center; 
              align-items: flex-start;
              font-family: Arial, sans-serif;
            }
            .poster { 
              width: 210mm; 
              min-height: 297mm; 
              padding: 15mm;
              box-sizing: border-box;
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${posterHtml}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Printer className="w-4 h-4" />
          Generate Poster
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Missing Person Poster</DialogTitle>
          <DialogDescription>
            Download or print this poster to help spread awareness
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={handlePrint}
              className="gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button
              onClick={handleDownload}
              disabled={isGenerating}
              className="gap-2"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download
            </Button>
          </div>

          {/* Poster Preview */}
          <div className="border rounded-lg overflow-hidden bg-white">
            <div
              ref={posterRef}
              className="poster bg-white text-black p-8"
              style={{ width: "100%", minHeight: "800px" }}
            >
              {/* Header */}
              <div className="text-center mb-6">
                <div className="bg-red-600 text-white py-4 px-6 rounded-lg mb-4">
                  <h1 className="text-4xl font-bold tracking-wider">MISSING PERSON</h1>
                </div>
                <p className="text-lg text-gray-600">PLEASE HELP US FIND</p>
              </div>

              {/* Photo and Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Photo Section */}
                <div className="flex justify-center">
                  {signedPhotoUrl ? (
                    <img
                      src={signedPhotoUrl}
                      alt={person.full_name}
                      className="w-64 h-80 object-cover rounded-lg border-4 border-red-600 shadow-lg"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-64 h-80 bg-gray-200 rounded-lg border-4 border-red-600 flex items-center justify-center">
                      <span className="text-gray-500 text-center px-4">
                        No Photo Available
                      </span>
                    </div>
                  )}
                </div>

                {/* Details Section */}
                <div className="space-y-3">
                  <h2 className="text-3xl font-bold text-red-600 border-b-2 border-red-600 pb-2">
                    {person.full_name}
                  </h2>

                  <div className="space-y-2 text-lg">
                    {person.age && (
                      <p>
                        <span className="font-semibold">Age:</span> {person.age} years old
                      </p>
                    )}
                    {person.gender && (
                      <p>
                        <span className="font-semibold">Gender:</span> {person.gender}
                      </p>
                    )}
                    {person.height && (
                      <p>
                        <span className="font-semibold">Height:</span> {person.height}
                      </p>
                    )}
                    {person.weight && (
                      <p>
                        <span className="font-semibold">Weight:</span> {person.weight}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Last Seen Info */}
              <div className="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-4 mb-6">
                <h3 className="text-xl font-bold text-yellow-800 mb-2">LAST SEEN</h3>
                <p className="text-lg">
                  <span className="font-semibold">Location:</span> {person.last_seen_location}
                </p>
                <p className="text-lg">
                  <span className="font-semibold">Date:</span>{" "}
                  {new Date(person.last_seen_date).toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Additional Details */}
              {(person.clothing_description || person.distinguishing_features) && (
                <div className="bg-gray-100 rounded-lg p-4 mb-6">
                  {person.clothing_description && (
                    <div className="mb-3">
                      <h4 className="font-bold text-gray-800">Last Known Clothing:</h4>
                      <p className="text-gray-700">{person.clothing_description}</p>
                    </div>
                  )}
                  {person.distinguishing_features && (
                    <div>
                      <h4 className="font-bold text-gray-800">Distinguishing Features:</h4>
                      <p className="text-gray-700">{person.distinguishing_features}</p>
                    </div>
                  )}
                </div>
              )}

              {/* QR Code and Contact */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 border-t-2 border-gray-300 pt-6">
                <div className="text-center">
                  <div className="bg-white p-2 rounded-lg inline-block border">
                    <QRCodeSVG value={shareUrl} size={100} level="H" />
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Scan for more details</p>
                </div>

                <div className="text-center md:text-right flex-1">
                  <p className="text-xl font-bold text-red-600 mb-2">
                    IF YOU HAVE ANY INFORMATION
                  </p>
                  <p className="text-lg">
                    Please visit: <span className="font-semibold break-all">{shareUrl}</span>
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    or contact local authorities immediately
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
                <p>Generated on {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
