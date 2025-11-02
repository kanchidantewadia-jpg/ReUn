import { useState, useEffect } from "react";
import { getSignedUrl } from "@/lib/storageHelpers";
import { Skeleton } from "@/components/ui/skeleton";

interface SignedImageProps {
  bucket: string;
  path: string | null;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

/**
 * Component that displays images from private storage buckets using signed URLs
 */
export const SignedImage = ({ bucket, path, alt, className, fallback }: SignedImageProps) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      setError(true);
      return;
    }

    let mounted = true;

    getSignedUrl(bucket, path).then((url) => {
      if (mounted) {
        if (url) {
          setSignedUrl(url);
        } else {
          setError(true);
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
    };
  }, [bucket, path]);

  if (loading) {
    return <Skeleton className={className} />;
  }

  if (error || !signedUrl) {
    return fallback || (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <span className="text-muted-foreground text-sm">Image unavailable</span>
      </div>
    );
  }

  return (
    <img
      src={signedUrl}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
};
