import { type ArtistProfile, type User } from "@shared/schema";
import { Button } from "@/components/ui/button";

interface ArtistCardProps {
  artist: ArtistProfile & {
    user?: User;
  };
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  const user = artist.user;
  const displayName = artist.artistName || (user ? `${user.firstName} ${user.lastName}` : "Unknown Artist");
  
  return (
    <div className="flex items-center space-x-4" data-testid={`artist-card-${artist.id}`}>
      <img 
        src={user?.profileImageUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
        alt="Artist Portrait" 
        className="w-12 h-12 rounded-full object-cover" 
        data-testid={`img-artist-avatar-${artist.id}`}
      />
      <div className="flex-1">
        <h4 className="font-medium text-foreground text-sm" data-testid={`text-artist-name-${artist.id}`}>
          {displayName}
        </h4>
        <p className="text-muted-foreground text-xs" data-testid={`text-artist-specialty-${artist.id}`}>
          {artist.specialty || "Artist"}
        </p>
        <div className="flex items-center space-x-1 mt-1">
          <i className="fas fa-star text-accent text-xs"></i>
          <span className="text-xs text-muted-foreground" data-testid={`text-artist-rating-${artist.id}`}>
            {artist.rating || "5.0"} • {artist.totalWorks || 0} works
          </span>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-primary hover:text-primary/80 text-xs p-2"
        data-testid={`button-view-artist-${artist.id}`}
      >
        <i className="fas fa-eye"></i>
      </Button>
    </div>
  );
}
