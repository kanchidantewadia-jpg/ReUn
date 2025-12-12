import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { CheckCircle2, Shield } from "lucide-react";

interface SimpleCaptchaProps {
  onVerify: (verified: boolean) => void;
}

export default function SimpleCaptcha({ onVerify }: SimpleCaptchaProps) {
  const [isChecked, setIsChecked] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    if (isChecked && !isVerified) {
      setIsVerifying(true);
      // Simulate verification delay
      const timer = setTimeout(() => {
        setIsVerifying(false);
        setIsVerified(true);
        onVerify(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
    if (!isChecked) {
      setIsVerified(false);
      onVerify(false);
    }
  }, [isChecked, onVerify]);

  return (
    <div className="border border-border rounded-lg p-4 bg-muted/30">
      <div className="flex items-center gap-3">
        {isVerified ? (
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        ) : (
          <Checkbox
            id="captcha"
            checked={isChecked}
            onCheckedChange={(checked) => setIsChecked(checked === true)}
            disabled={isVerifying}
            className="h-5 w-5"
          />
        )}
        <div className="flex-1">
          <Label
            htmlFor="captcha"
            className={`text-sm font-medium cursor-pointer ${isVerifying ? "text-muted-foreground" : ""}`}
          >
            {isVerifying ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></span>
                Verifying...
              </span>
            ) : isVerified ? (
              <span className="text-green-600">Verified - You're human!</span>
            ) : (
              "I'm not a robot"
            )}
          </Label>
        </div>
        <div className="flex flex-col items-center text-muted-foreground">
          <Shield className="h-6 w-6" />
          <span className="text-[10px]">Secure</span>
        </div>
      </div>
    </div>
  );
}
