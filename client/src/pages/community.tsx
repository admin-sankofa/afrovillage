import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function Community() {
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch community stats
  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Mock community members data - in real app would fetch from API
  const { data: members, isLoading } = useQuery({
    queryKey: ["/api/community/members"],
    queryFn: () => Promise.resolve([]), // Will be empty until backend implements this
  });

  const mockMembers = [
    {
      id: "1",
      name: "Amara Okafor",
      role: "Community Resident",
      skills: ["Permaculture", "Solar Systems", "Community Building"],
      bio: "Passionate about sustainable living and community empowerment.",
      profileImage: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
      joinDate: "2023-06-15",
      contributions: 45
    },
    {
      id: "2", 
      name: "Kwame Asante",
      role: "Traditional Sculptor",
      skills: ["Wood Carving", "Traditional Arts", "Mentoring"],
      bio: "Master craftsman preserving traditional African sculpture techniques.",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
      joinDate: "2023-04-20",
      contributions: 67
    },
    {
      id: "3",
      name: "Zara Mensah",
      role: "Solar Engineer", 
      skills: ["Renewable Energy", "System Design", "Training"],
      bio: "Engineering sustainable energy solutions for off-grid communities.",
      profileImage: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200",
      joinDate: "2023-08-10",
      contributions: 32
    }
  ];

  const filteredMembers = mockMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-muted h-32 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6" data-testid="community-page">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2" data-testid="text-page-title">
          Community
        </h1>
        <p className="text-muted-foreground" data-testid="text-page-description">
          Connect with fellow villagers, share skills, and build meaningful relationships
        </p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search members by name or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
              data-testid="input-search-members"
            />
          </div>
          <Button variant="outline" data-testid="button-filter-members">
            <i className="fas fa-filter mr-2"></i>
            Filter
          </Button>
        </div>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="text-total-members">{stats?.totalMembers || "1"}</p>
                <p className="text-sm text-muted-foreground">Total Members</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-users text-primary"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="text-online-members">23</p>
                <p className="text-sm text-muted-foreground">Online Now</p>
              </div>
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-circle text-secondary"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="text-new-members">12</p>
                <p className="text-sm text-muted-foreground">New This Month</p>
              </div>
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-user-plus text-accent"></i>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground" data-testid="text-skill-exchanges">67</p>
                <p className="text-sm text-muted-foreground">Skill Exchanges</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <i className="fas fa-handshake text-primary"></i>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Member Directory */}
      <Card data-testid="section-member-directory">
        <CardHeader>
          <CardTitle className="font-serif text-2xl">Member Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition-shadow" data-testid={`member-card-${member.id}`}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <img
                      src={member.profileImage}
                      alt={member.name}
                      className="w-16 h-16 rounded-full object-cover"
                      data-testid={`img-member-avatar-${member.id}`}
                    />
                    <div>
                      <h4 className="font-semibold text-foreground" data-testid={`text-member-name-${member.id}`}>
                        {member.name}
                      </h4>
                      <p className="text-sm text-muted-foreground" data-testid={`text-member-role-${member.id}`}>
                        {member.role}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {member.contributions} contributions
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3" data-testid={`text-member-bio-${member.id}`}>
                    {member.bio}
                  </p>
                  
                  <div className="flex flex-wrap gap-1 mb-4">
                    {member.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="text-xs" data-testid={`badge-skill-${member.id}-${index}`}>
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1" data-testid={`button-connect-${member.id}`}>
                      <i className="fas fa-user-plus mr-2"></i>
                      Connect
                    </Button>
                    <Button size="sm" variant="ghost" data-testid={`button-message-${member.id}`}>
                      <i className="fas fa-envelope"></i>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredMembers.length === 0 && searchTerm && (
            <div className="text-center py-8" data-testid="text-no-search-results">
              <p className="text-muted-foreground">No members found matching "{searchTerm}"</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
