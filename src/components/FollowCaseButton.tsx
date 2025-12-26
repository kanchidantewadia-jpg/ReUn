import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Bell, BellOff, BellRing } from "lucide-react";

interface FollowCaseButtonProps {
  personId: string;
  personName: string;
  user: any;
}

export const FollowCaseButton = ({ personId, personName, user }: FollowCaseButtonProps) => {
  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    if (user) {
      checkFollowStatus();
      checkNotificationPermission();
    }
  }, [user, personId]);

  const checkFollowStatus = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('case_follows')
      .select('id')
      .eq('user_id', user.id)
      .eq('missing_person_id', personId)
      .maybeSingle();

    if (!error && data) {
      setIsFollowing(true);
    }
  };

  const checkNotificationPermission = () => {
    if ("Notification" in window) {
      setNotificationsEnabled(Notification.permission === "granted");
    }
  };

  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!("Notification" in window)) {
      toast({
        title: "Notifications Not Supported",
        description: "Your browser doesn't support push notifications.",
        variant: "destructive",
      });
      return false;
    }

    if (Notification.permission === "granted") {
      return true;
    }

    if (Notification.permission === "denied") {
      toast({
        title: "Notifications Blocked",
        description: "Please enable notifications in your browser settings.",
        variant: "destructive",
      });
      return false;
    }

    const permission = await Notification.requestPermission();
    setNotificationsEnabled(permission === "granted");
    return permission === "granted";
  };

  const handleFollow = async () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to follow cases and receive notifications.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('case_follows')
          .delete()
          .eq('user_id', user.id)
          .eq('missing_person_id', personId);

        if (error) throw error;

        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: `You will no longer receive notifications for ${personName}.`,
        });
      } else {
        // Request notification permission first
        const hasPermission = await requestNotificationPermission();
        
        // Follow the case
        const { error } = await supabase
          .from('case_follows')
          .insert({
            user_id: user.id,
            missing_person_id: personId,
          });

        if (error) throw error;

        setIsFollowing(true);
        
        if (hasPermission) {
          toast({
            title: "Following Case",
            description: `You will receive notifications when new sightings are reported for ${personName}.`,
          });
        } else {
          toast({
            title: "Following Case",
            description: `You're following ${personName}. Enable browser notifications to get alerts for new sightings.`,
          });
        }
      }
    } catch (error: any) {
      console.error("Follow error:", error);
      toast({
        title: "Error",
        description: "Failed to update follow status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Button
      variant={isFollowing ? "default" : "outline"}
      onClick={handleFollow}
      disabled={isLoading}
      className="gap-2"
    >
      {isFollowing ? (
        <>
          <BellRing className="w-4 h-4" />
          Following
        </>
      ) : (
        <>
          <Bell className="w-4 h-4" />
          Follow Case
        </>
      )}
    </Button>
  );
};
