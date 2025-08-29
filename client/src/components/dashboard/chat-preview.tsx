import { type Message, type User } from "@shared/schema";

interface ChatPreviewProps {
  message: Message & {
    sender?: User;
  };
}

export default function ChatPreview({ message }: ChatPreviewProps) {
  const sender = message.sender;
  const displayName = sender 
    ? (sender.firstName && sender.lastName 
        ? `${sender.firstName} ${sender.lastName.charAt(0)}.`
        : sender.email?.split('@')[0] || "Anonymous")
    : "Community";

  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="flex items-start space-x-3" data-testid={`chat-message-${message.id}`}>
      <img 
        src={sender?.profileImageUrl || "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=50&h=50"} 
        alt="User Avatar" 
        className="w-8 h-8 rounded-full object-cover" 
        data-testid={`img-message-avatar-${message.id}`}
      />
      <div className="flex-1">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-foreground" data-testid={`text-message-sender-${message.id}`}>
            {displayName}
          </span>
          <span className="text-xs text-muted-foreground" data-testid={`text-message-time-${message.id}`}>
            {formatTime(message.createdAt)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground" data-testid={`text-message-content-${message.id}`}>
          {message.content}
        </p>
      </div>
    </div>
  );
}
