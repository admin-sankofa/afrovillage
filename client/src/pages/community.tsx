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

  // Fetch real community members from API
  const { data: members, isLoading: membersLoading } = useQuery({
    queryKey: ["/api/community/members"],
  });

  // Filter real members based on search term
  const filteredMembers = (members || []).filter((member: any) => {
    const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim();
    const skills = member.skills || [];
    const searchLower = searchTerm.toLowerCase();
    
    return fullName.toLowerCase().includes(searchLower) ||
           member.email?.toLowerCase().includes(searchLower) ||
           skills.some((skill: string) => skill.toLowerCase().includes(searchLower));
  });

  if (membersLoading) {
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
                <p className="text-2xl font-bold text-foreground" data-testid="text-online-members">0</p>
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
                <p className="text-2xl font-bold text-foreground" data-testid="text-new-members">{stats?.newMembersThisMonth || "0"}</p>
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
                <p className="text-2xl font-bold text-foreground" data-testid="text-skill-exchanges">0</p>
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
            {filteredMembers.map((member: any) => {
              const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim();
              const memberRole = member.role || 'Community Member';
              const memberSkills = member.skills || [];
              const memberBio = member.bio || 'No bio available';
              const profileImage = member.profileImageUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200';
              
              return (
                <Card key={member.id} className="hover:shadow-lg transition-shadow" data-testid={`member-card-${member.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <img
                        src={profileImage}
                        alt={fullName}
                        className="w-16 h-16 rounded-full object-cover"
                        data-testid={`img-member-avatar-${member.id}`}
                      />
                      <div>
                        <h4 className="font-semibold text-foreground" data-testid={`text-member-name-${member.id}`}>
                          {fullName || member.email}
                        </h4>
                        <p className="text-sm text-muted-foreground" data-testid={`text-member-role-${member.id}`}>
                          {memberRole}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Member since {new Date(member.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3" data-testid={`text-member-bio-${member.id}`}>
                      {memberBio}
                    </p>
                    
                    {memberSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {memberSkills.map((skill: string, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs" data-testid={`badge-skill-${member.id}-${index}`}>
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}
                    
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
              );
            })}
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
