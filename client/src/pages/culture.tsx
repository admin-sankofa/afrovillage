import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertArtistProfileSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getUnauthorizedReason, isUnauthorizedError } from "@/lib/authUtils";
import { z } from "zod";

export default function Culture() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: artists, isLoading } = useQuery({
    queryKey: ["/api/artists"],
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof insertArtistProfileSchema>) => {
      await apiRequest("POST", "/api/artist-profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Created",
        description: "Your artist profile has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/artists"] });
      setIsProfileDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        const reason = getUnauthorizedReason(error);
        toast({
          title: reason === 'token_expired' ? 'Session abgelaufen' : 'Keine Berechtigung',
          description: reason === 'token_expired'
            ? 'Bitte melde dich erneut an, um dein Profil zu speichern.'
            : 'Diese Aktion erfordert eine aktive Anmeldung.',
          variant: 'destructive',
        });
        return;
      }
      toast({
        title: "Profile Creation Failed",
        description: "Unable to create artist profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const form = useForm<z.infer<typeof insertArtistProfileSchema>>({
    resolver: zodResolver(insertArtistProfileSchema),
    defaultValues: {
      artistName: "",
      specialty: "",
      bio: "",
    },
  });

  const specialties = [
    { value: "all", label: "All Specialties", icon: "fas fa-palette" },
    { value: "sculptor", label: "Sculpture", icon: "fas fa-hammer" },
    { value: "musician", label: "Music", icon: "fas fa-music" },
    { value: "painter", label: "Painting", icon: "fas fa-paint-brush" },
    { value: "textile", label: "Textile Arts", icon: "fas fa-cut" },
    { value: "pottery", label: "Pottery", icon: "fas fa-vase" },
    { value: "dancer", label: "Dance", icon: "fas fa-running" },
  ];

  const filteredArtists = (artists || []).filter((artist: any) => {
    const matchesSearch = artist.artistName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.specialty?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === "all" || artist.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const onSubmit = (data: z.infer<typeof insertArtistProfileSchema>) => {
    createProfileMutation.mutate(data);
  };

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
    <div className="p-6" data-testid="culture-page">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
              Culture & Arts
            </h1>
            <p className="text-muted-foreground" data-testid="text-page-description">
              Celebrate and preserve African diaspora culture through arts, music, and creativity
            </p>
          </div>
          <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90" data-testid="button-create-profile">
                <i className="fas fa-plus mr-2"></i>
                Create Artist Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Artist Profile</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="artistName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Artist Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your artistic name" {...field} data-testid="input-artist-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="specialty"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specialty</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., sculptor, musician, painter" {...field} data-testid="input-specialty" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Tell us about your artistic journey..." 
                            {...field} 
                            data-testid="textarea-bio"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit" 
                    disabled={createProfileMutation.isPending}
                    className="w-full"
                    data-testid="button-submit-profile"
                  >
                    {createProfileMutation.isPending ? "Creating..." : "Create Profile"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="artists" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="artists" data-testid="tab-artists">Featured Artists</TabsTrigger>
          <TabsTrigger value="gallery" data-testid="tab-gallery">Art Gallery</TabsTrigger>
          <TabsTrigger value="events" data-testid="tab-cultural-events">Cultural Events</TabsTrigger>
        </TabsList>

        <TabsContent value="artists" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search artists..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
                data-testid="input-search-artists"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {specialties.map((specialty) => (
                <Button
                  key={specialty.value}
                  variant={selectedSpecialty === specialty.value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedSpecialty(specialty.value)}
                  data-testid={`button-filter-${specialty.value}`}
                >
                  <i className={`${specialty.icon} mr-2`}></i>
                  {specialty.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Artists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="section-artists-grid">
            {filteredArtists.length > 0 ? (
              filteredArtists.map((artist: any) => (
                <Card key={artist.id} className="afro-card" data-testid={`artist-card-${artist.id}`}>
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <img
                        src={artist.user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                        alt="Artist Portrait"
                        className="w-16 h-16 rounded-full object-cover"
                        data-testid={`img-artist-avatar-${artist.id}`}
                      />
                      <div className="flex-1">
                        <CardTitle className="text-lg" data-testid={`text-artist-name-${artist.id}`}>
                          {artist.artistName || `${artist.user?.firstName} ${artist.user?.lastName}`}
                        </CardTitle>
                        <p className="text-muted-foreground capitalize" data-testid={`text-artist-specialty-${artist.id}`}>
                          {artist.specialty}
                        </p>
                        <div className="flex items-center space-x-1 mt-1">
                          <i className="fas fa-star text-accent text-sm"></i>
                          <span className="text-sm text-muted-foreground" data-testid={`text-artist-rating-${artist.id}`}>
                            {artist.rating || "5.0"} • {artist.totalWorks || 0} works
                          </span>
                          {artist.isVerified && (
                            <i className="fas fa-check-circle text-secondary text-sm ml-1" title="Verified Artist"></i>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4" data-testid={`text-artist-bio-${artist.id}`}>
                      {artist.bio || "Passionate artist preserving and evolving cultural traditions."}
                    </p>
                    
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1" data-testid={`button-view-portfolio-${artist.id}`}>
                        <i className="fas fa-images mr-2"></i>
                        Portfolio
                      </Button>
                      <Button variant="outline" size="sm" data-testid={`button-contact-artist-${artist.id}`}>
                        <i className="fas fa-envelope"></i>
                      </Button>
                      <Button variant="outline" size="sm" data-testid={`button-collaborate-${artist.id}`}>
                        <i className="fas fa-handshake"></i>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12" data-testid="text-no-artists">
                <div className="cultural-icon mx-auto mb-4">
                  <i className="fas fa-palette text-2xl"></i>
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                  No Artists Found
                </h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedSpecialty !== "all" 
                    ? "Try adjusting your search criteria"
                    : "No artists have created profiles yet"}
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          <div className="text-center py-12" data-testid="section-art-gallery">
            <div className="cultural-icon mx-auto mb-4">
              <i className="fas fa-images text-2xl"></i>
            </div>
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              Art Gallery Coming Soon
            </h3>
            <p className="text-muted-foreground mb-6">
              Discover amazing artwork from our talented community artists
            </p>
            <Button variant="outline" data-testid="button-contribute-artwork">
              <i className="fas fa-plus mr-2"></i>
              Contribute Artwork
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="text-center py-12" data-testid="section-cultural-events">
            <div className="cultural-icon mx-auto mb-4">
              <i className="fas fa-calendar-alt text-2xl"></i>
            </div>
            <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
              Cultural Events
            </h3>
            <p className="text-muted-foreground mb-6">
              Join workshops, performances, and celebrations of African diaspora culture
            </p>
            <Button variant="outline" data-testid="button-view-cultural-events">
              <i className="fas fa-eye mr-2"></i>
              View All Events
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
