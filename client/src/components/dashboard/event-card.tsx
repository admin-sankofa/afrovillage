import { Button } from "@/components/ui/button";
import { type Event } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getUnauthorizedReason, isUnauthorizedError } from "@/lib/authUtils";

interface EventCardProps {
  event: Event & { 
    attendeeCount?: number;
    isRegistered?: boolean;
  };
}

export default function EventCard({ event }: EventCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const registerMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/events/${event.id}/register`);
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: `You've registered for ${event.title}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        const reason = getUnauthorizedReason(error);
        toast({
          title: reason === 'token_expired' ? 'Session abgelaufen' : 'Keine Berechtigung',
          description: reason === 'token_expired'
            ? 'Bitte melde dich erneut an, um Events zu buchen.'
            : 'Diese Aktion erfordert eine aktive Anmeldung.',
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: "Registration Failed",
        description: "Unable to register for event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  const formatTime = (startDate: Date, endDate: Date) => {
    const start = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date(startDate));
    
    const end = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(new Date(endDate));
    
    return `${start} - ${end}`;
  };

  const eventDate = formatDate(event.startDate);
  const [month, day] = eventDate.split(' ');

  return (
    <div className="flex items-center space-x-4 p-4 rounded-lg hover:bg-muted/50 transition-colors" data-testid={`event-card-${event.id}`}>
      <div className="w-12 h-12 bg-gradient-to-br from-primary via-accent to-secondary rounded-lg flex flex-col items-center justify-center text-white text-xs font-bold">
        <span>{month.toUpperCase()}</span>
        <span>{day}</span>
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-foreground" data-testid={`text-event-title-${event.id}`}>
          {event.title}
        </h4>
        <p className="text-muted-foreground text-sm" data-testid={`text-event-description-${event.id}`}>
          {event.description}
        </p>
        <div className="flex items-center space-x-4 mt-2">
          <span className="text-xs text-muted-foreground flex items-center">
            <i className="fas fa-clock mr-1"></i>
            <span data-testid={`text-event-time-${event.id}`}>
              {formatTime(event.startDate, event.endDate)}
            </span>
          </span>
          <span className="text-xs text-muted-foreground flex items-center">
            <i className="fas fa-users mr-1"></i>
            <span data-testid={`text-event-attendees-${event.id}`}>
              {event.attendeeCount || 0} attending
            </span>
          </span>
        </div>
      </div>
      <Button
        onClick={() => registerMutation.mutate()}
        disabled={registerMutation.isPending || event.isRegistered}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
        data-testid={`button-join-event-${event.id}`}
      >
        {registerMutation.isPending ? "Joining..." : event.isRegistered ? "Joined" : "Join"}
      </Button>
    </div>
  );
}
