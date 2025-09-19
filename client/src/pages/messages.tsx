import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMessageSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { z } from "zod";

export default function Messages() {
  const [newCommunityMessage, setNewCommunityMessage] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useSupabaseAuth();

  const { data: personalMessages, isLoading: personalLoading } = useQuery({
    queryKey: ["/api/messages"],
  });

  const { data: communityMessages, isLoading: communityLoading } = useQuery({
    queryKey: ["/api/messages/community"],
  });

  const sendCommunityMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", "/api/messages", {
        content,
        recipientId: null, // null for community messages
        type: "text",
      });
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Your message has been posted to the community chat!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/community"] });
      setNewCommunityMessage("");
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Message Failed",
        description: "Unable to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof insertMessageSchema>>({
    resolver: zodResolver(insertMessageSchema.omit({ senderId: true })),
    defaultValues: {
      content: "",
      recipientId: "",
      type: "text",
    },
  });

  const handleSendCommunityMessage = () => {
    if (newCommunityMessage.trim()) {
      sendCommunityMessageMutation.mutate(newCommunityMessage.trim());
    }
  };

  const formatTime = (date: string | Date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const MessageItem = ({ message, isOwnMessage = false }: { message: any; isOwnMessage?: boolean }) => (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} mb-4`} data-testid={`message-item-${message.id}`}>
      <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        <div className={`rounded-lg p-3 ${
          isOwnMessage 
            ? 'bg-primary text-primary-foreground ml-auto' 
            : 'bg-muted text-foreground'
        }`}>
          {!isOwnMessage && message.sender && (
            <div className="flex items-center space-x-2 mb-2">
              <img
                src={message.sender.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=40&h=40"}
                alt="Sender Avatar"
                className="w-6 h-6 rounded-full object-cover"
                data-testid={`img-sender-avatar-${message.id}`}
              />
              <span className="text-sm font-medium" data-testid={`text-sender-name-${message.id}`}>
                {message.sender.firstName && message.sender.lastName
                  ? `${message.sender.firstName} ${message.sender.lastName}`
                  : message.sender.email?.split('@')[0] || "Anonymous"}
              </span>
            </div>
          )}
          <p className="text-sm" data-testid={`text-message-content-${message.id}`}>
            {message.content}
          </p>
          <p className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'}`} data-testid={`text-message-time-${message.id}`}>
            {formatTime(message.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );

  if (personalLoading || communityLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-muted h-16 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="messages-page">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
          Messages
        </h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Connect and communicate with your village community
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Message Navigation */}
        <div className="lg:col-span-1">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start bg-primary/10 text-primary"
                  data-testid="button-community-chat"
                >
                  <i className="fas fa-users mr-2"></i>
                  Community Chat
                  <span className="ml-auto bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                    {communityMessages?.length || 0}
                  </span>
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start"
                  data-testid="button-direct-messages"
                >
                  <i className="fas fa-envelope mr-2"></i>
                  Direct Messages
                  <span className="ml-auto bg-accent text-accent-foreground text-xs px-2 py-1 rounded-full">
                    {personalMessages?.length || 0}
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-3">
          <Tabs defaultValue="community" className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="community" data-testid="tab-community-chat">Community Chat</TabsTrigger>
              <TabsTrigger value="direct" data-testid="tab-direct-messages">Direct Messages</TabsTrigger>
            </TabsList>

            <TabsContent value="community" className="mt-6">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">Community Chat</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Open conversation for all village members
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-secondary rounded-full"></span>
                      <span className="text-sm text-muted-foreground">
                        {communityMessages?.length || 0} online
                      </span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 overflow-y-auto p-4" data-testid="section-community-messages">
                  <div className="space-y-4">
                    {communityMessages && communityMessages.length > 0 ? (
                      communityMessages.map((message: any) => (
                        <MessageItem 
                          key={message.id} 
                          message={message} 
                          isOwnMessage={message.senderId === user?.id}
                        />
                      ))
                    ) : (
                      <div className="text-center py-8" data-testid="text-no-community-messages">
                        <div className="cultural-icon mx-auto mb-4">
                          <i className="fas fa-comments text-2xl"></i>
                        </div>
                        <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                          Start the Conversation
                        </h3>
                        <p className="text-muted-foreground">
                          Be the first to share something with the community!
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <div className="border-t p-4">
                  <div className="flex space-x-2">
                    <Textarea
                      value={newCommunityMessage}
                      onChange={(e) => setNewCommunityMessage(e.target.value)}
                      placeholder="Type your message to the community..."
                      className="flex-1 min-h-[80px] resize-none"
                      data-testid="textarea-community-message"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendCommunityMessage();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSendCommunityMessage}
                      disabled={sendCommunityMessageMutation.isPending || !newCommunityMessage.trim()}
                      className="bg-primary text-primary-foreground hover:bg-primary/90"
                      data-testid="button-send-community-message"
                    >
                      {sendCommunityMessageMutation.isPending ? (
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      ) : (
                        <i className="fas fa-paper-plane"></i>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Press Enter to send, Shift+Enter for new line
                  </p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="direct" className="mt-6">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="border-b">
                  <CardTitle className="text-lg">Direct Messages</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Private conversations with community members
                  </p>
                </CardHeader>
                
                <CardContent className="flex-1 flex items-center justify-center" data-testid="section-direct-messages">
                  <div className="text-center py-8">
                    <div className="cultural-icon mx-auto mb-4">
                      <i className="fas fa-envelope text-2xl"></i>
                    </div>
                    <h3 className="font-serif text-lg font-semibold text-foreground mb-2">
                      Direct Messages Coming Soon
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Private messaging functionality will be available soon
                    </p>
                    <Button variant="outline" data-testid="button-community-directory">
                      <i className="fas fa-users mr-2"></i>
                      Browse Community Directory
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
