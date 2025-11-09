import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send } from "lucide-react";
import { messageSchema } from "@/lib/validationSchemas";

interface MessageThreadProps {
  missingPersonId: string;
  user: any;
}

export const MessageThread = ({ missingPersonId, user }: MessageThreadProps) => {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    setupRealtimeSubscription();
  }, [missingPersonId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('id, message, created_at, sender_id')
        .eq('missing_person_id', missingPersonId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch display names for each message
      if (messagesData) {
        const messagesWithNames = await Promise.all(
          messagesData.map(async (msg) => {
            const { data: displayName } = await supabase.rpc('get_display_name', {
              user_uuid: msg.sender_id
            });
            return {
              ...msg,
              sender_name: displayName || 'Anonymous User'
            };
          })
        );
        setMessages(messagesWithNames);
      }
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages.",
        variant: "destructive",
      });
    }
  };

  const setupRealtimeSubscription = () => {
    const channel = supabase
      .channel('messages-channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `missing_person_id=eq.${missingPersonId}`,
        },
        async (payload) => {
          const newMsg = payload.new;
          const { data: displayName } = await supabase.rpc('get_display_name', {
            user_uuid: newMsg.sender_id
          });
          setMessages(prev => [...prev, {
            ...newMsg,
            sender_name: displayName || 'Anonymous User'
          }]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSendMessage = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to send messages.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Validate message
      const validation = messageSchema.safeParse({ message: newMessage });
      if (!validation.success) {
        toast({
          title: "Validation Error",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }

      setIsSending(true);

      const { error } = await supabase.from('messages').insert({
        missing_person_id: missingPersonId,
        sender_id: user.id,
        message: newMessage.trim(),
      });

      if (error) throw error;

      setNewMessage("");
      
      toast({
        title: "Message Sent",
        description: "Your message has been sent successfully.",
      });
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Internal Messages</CardTitle>
        <CardDescription>
          Communicate securely without exposing contact details
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Messages list */}
          <div className="max-h-[400px] overflow-y-auto space-y-3 p-4 bg-muted/20 rounded-lg">
            {messages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No messages yet. Start the conversation!
              </p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender_id === user?.id ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.sender_id === user?.id
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border'
                    }`}
                  >
                    <p className="text-sm font-medium mb-1">{msg.sender_name}</p>
                    <p className="text-sm break-words">{msg.message}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message input */}
          {user ? (
            <div className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                rows={3}
                maxLength={5000}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isSending}
                className="h-auto"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">
              Please sign in to send messages
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
