import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getUnauthorizedReason, isUnauthorizedError } from "@/lib/authUtils";

export default function Events() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedType, setSelectedType] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events, isLoading } = useQuery({
    queryKey: ["/api/events"],
  });

  const registerMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiRequest("POST", `/api/events/${eventId}/register`);
    },
    onSuccess: () => {
      toast({
        title: "Registration Successful",
        description: "You've been registered for the event!",
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

  const eventTypes = [
    { value: "all", label: "All Events" },
    { value: "workshop", label: "Workshops" },
    { value: "retreat", label: "Retreats" },
    { value: "festival", label: "Festivals" },
    { value: "community", label: "Community" },
  ];

  const filteredEvents = (events || []).filter((event: any) => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || event.type === selectedType;
    const matchesDate = !selectedDate || 
                       new Date(event.startDate).toDateString() === selectedDate.toDateString();
    
    return matchesSearch && matchesType && matchesDate;
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-muted h-48 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="events-page">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
          Events & Retreats
        </h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Discover workshops, retreats, and cultural celebrations in our vibrant community
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              data-testid="input-search-events"
            />
          </div>
          
          <div className="flex gap-2">
            {eventTypes.map((type) => (
              <Button
                key={type.value}
                variant={selectedType === type.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type.value)}
                data-testid={`button-filter-${type.value}`}
              >
                {type.label}
              </Button>
            ))}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn("w-[240px] justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}
                data-testid="button-date-picker"
              >
                <i className="fas fa-calendar mr-2"></i>
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          
          {selectedDate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(undefined)}
              data-testid="button-clear-date"
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" data-testid="section-events-grid">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event: any) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow" data-testid={`event-card-${event.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl font-serif" data-testid={`text-event-title-${event.id}`}>
                      {event.title}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge variant="secondary" className="capitalize" data-testid={`badge-event-type-${event.id}`}>
                        {event.type}
                      </Badge>
                      {event.price > 0 && (
                        <Badge variant="outline" data-testid={`badge-event-price-${event.id}`}>
                          €{event.price}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {format(new Date(event.startDate), "MMM dd")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(event.startDate), "h:mm a")}
                    </p>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-muted-foreground text-sm mb-4" data-testid={`text-event-description-${event.id}`}>
                  {event.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span className="flex items-center">
                      <i className="fas fa-map-marker-alt mr-1"></i>
                      {event.location || "Village Center"}
                    </span>
                    <span className="flex items-center">
                      <i className="fas fa-users mr-1"></i>
                      {event.capacity ? `${event.capacity} spots` : "Open capacity"}
                    </span>
                  </div>
                  
                  <Button
                    onClick={() => registerMutation.mutate(event.id)}
                    disabled={registerMutation.isPending}
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                    data-testid={`button-register-${event.id}`}
                  >
                    {registerMutation.isPending ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Registering...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-plus mr-2"></i>
                        Register
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12" data-testid="text-no-events">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-calendar-plus text-muted-foreground text-2xl"></i>
            </div>
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              No Events Found
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm || selectedDate || selectedType !== "all" 
                ? "Try adjusting your search criteria"
                : "No events are currently scheduled"}
            </p>
            <Button variant="outline" data-testid="button-create-event">
              <i className="fas fa-plus mr-2"></i>
              Create Event
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
