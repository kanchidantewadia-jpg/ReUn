import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UseSightingNotificationsProps {
  userId: string | undefined;
  enabled: boolean;
}

export const useSightingNotifications = ({ userId, enabled }: UseSightingNotificationsProps) => {
  const { toast } = useToast();
  const followedCasesRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!userId || !enabled) return;

    // Fetch followed cases
    const fetchFollowedCases = async () => {
      const { data, error } = await supabase
        .from('case_follows')
        .select('missing_person_id')
        .eq('user_id', userId);

      if (!error && data) {
        followedCasesRef.current = new Set(data.map(f => f.missing_person_id));
      }
    };

    fetchFollowedCases();

    // Subscribe to case_follows changes to keep the set updated
    const followsChannel = supabase
      .channel('user-follows')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'case_follows',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            followedCasesRef.current.add((payload.new as any).missing_person_id);
          } else if (payload.eventType === 'DELETE') {
            followedCasesRef.current.delete((payload.old as any).missing_person_id);
          }
        }
      )
      .subscribe();

    // Subscribe to community_sightings for notifications
    const sightingsChannel = supabase
      .channel('sightings-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_sightings',
        },
        async (payload) => {
          const newSighting = payload.new as any;
          
          // Check if user follows this case
          if (!followedCasesRef.current.has(newSighting.missing_person_id)) {
            return;
          }

          // Get the missing person's name
          const { data: personData } = await supabase
            .from('public_missing_persons')
            .select('full_name')
            .eq('id', newSighting.missing_person_id)
            .single();

          const personName = personData?.full_name || 'a case you follow';

          // Show browser notification
          if ("Notification" in window && Notification.permission === "granted") {
            const notification = new Notification("New Sighting Reported", {
              body: `A new sighting has been reported for ${personName} at ${newSighting.sighting_location}`,
              icon: "/favicon.ico",
              tag: `sighting-${newSighting.id}`,
              data: {
                url: `/person/${newSighting.missing_person_id}`,
              },
            });

            notification.onclick = () => {
              window.focus();
              window.location.href = `/person/${newSighting.missing_person_id}`;
              notification.close();
            };
          }

          // Also show toast notification
          toast({
            title: "New Sighting Reported",
            description: `A new sighting for ${personName} was reported at ${newSighting.sighting_location}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(followsChannel);
      supabase.removeChannel(sightingsChannel);
    };
  }, [userId, enabled, toast]);
};
