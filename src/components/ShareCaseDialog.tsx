import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Share2, Copy, Facebook, Twitter, MessageCircle, Mail, Check } from "lucide-react";

interface ShareCaseDialogProps {
  personId: string;
  personName: string;
}

export const ShareCaseDialog = ({ personId, personName }: ShareCaseDialogProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  const shareUrl = `${window.location.origin}/person/${personId}`;
  const shareText = `Help find ${personName} - Missing Person Alert`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link Copied",
        description: "The case link has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const shareOnFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const shareOnTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const shareOnWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${shareUrl}`)}`,
      "_blank"
    );
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(shareText);
    const body = encodeURIComponent(`Please help find ${personName}.\n\nView the full case details here: ${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareText,
          text: `Help find ${personName}`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or error
      }
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share Case
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share This Case</DialogTitle>
          <DialogDescription>
            Help spread the word about {personName}. Share on social media or scan the QR code.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* QR Code */}
          <div className="flex flex-col items-center space-y-3 p-4 bg-secondary/30 rounded-lg">
            <div className="bg-white p-3 rounded-lg">
              <QRCodeSVG
                value={shareUrl}
                size={160}
                level="H"
                includeMargin={false}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Scan to view case details
            </p>
          </div>

          {/* Copy Link */}
          <div className="flex items-center gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="flex-1 text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={handleCopyLink}
              className="shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Social Share Buttons */}
          <div className="space-y-3">
            <p className="text-sm font-medium">Share on:</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={shareOnFacebook}
              >
                <Facebook className="w-4 h-4 text-blue-600" />
                Facebook
              </Button>
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={shareOnTwitter}
              >
                <Twitter className="w-4 h-4 text-sky-500" />
                Twitter/X
              </Button>
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={shareOnWhatsApp}
              >
                <MessageCircle className="w-4 h-4 text-green-600" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={shareViaEmail}
              >
                <Mail className="w-4 h-4 text-red-500" />
                Email
              </Button>
            </div>
          </div>

          {/* Native Share (if supported) */}
          {navigator.share && (
            <Button
              className="w-full gap-2"
              onClick={handleNativeShare}
            >
              <Share2 className="w-4 h-4" />
              More Sharing Options
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
