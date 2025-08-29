import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import StatsCard from "@/components/dashboard/stats-card";
import EventCard from "@/components/dashboard/event-card";
import CourseProgress from "@/components/dashboard/course-progress";
import ResourceMonitor from "@/components/dashboard/resource-monitor";
import ArtistCard from "@/components/dashboard/artist-card";
import ProjectCard from "@/components/dashboard/project-card";
import ChatPreview from "@/components/dashboard/chat-preview";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: events } = useQuery({
    queryKey: ["/api/events"],
  });

  const { data: enrollments } = useQuery({
    queryKey: ["/api/user/enrollments"],
  });

  const { data: resources } = useQuery({
    queryKey: ["/api/resources"],
  });

  const { data: artists } = useQuery({
    queryKey: ["/api/artists"],
  });

  const { data: projects } = useQuery({
    queryKey: ["/api/projects"],
  });

  const { data: communityMessages } = useQuery({
    queryKey: ["/api/messages/community"],
  });

  const upcomingEvents = events?.slice(0, 3) || [];
  const topArtists = artists?.slice(0, 3) || [];
  const activeProjects = projects?.filter((p: any) => p.status === "active").slice(0, 2) || [];
  const recentMessages = communityMessages?.slice(0, 3) || [];

  return (
    <div className="p-6" data-testid="dashboard-main">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title="Community Members"
          value={stats?.totalMembers || 0}
          subtitle="+12 this month"
          icon="fas fa-users text-primary"
          iconBgColor="bg-primary/10"
        />
        <StatsCard
          title="Active Events"
          value={stats?.activeEvents || 0}
          subtitle="3 this weekend"
          icon="fas fa-calendar text-accent"
          iconBgColor="bg-accent/10"
        />
        <StatsCard
          title="Energy Generated"
          value={`${stats?.energyLevel || 0}%`}
          subtitle="Self-sufficient"
          icon="fas fa-bolt text-secondary"
          iconBgColor="bg-secondary/10"
        />
        <StatsCard
          title="Projects Funded"
          value={`€${Math.round(stats?.totalFunding || 0).toLocaleString()}`}
          subtitle="75% of goal"
          icon="fas fa-hand-holding-heart text-primary"
          iconBgColor="bg-primary/10"
        />
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upcoming Events */}
          <div className="bg-card rounded-lg border border-border p-6" data-testid="section-upcoming-events">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-semibold text-foreground">Upcoming Events</h3>
              <Button variant="link" className="text-primary hover:text-primary/80 text-sm font-medium p-0" data-testid="button-view-all-events">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event: any) => (
                  <EventCard key={event.id} event={event} />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-8" data-testid="text-no-events">
                  No upcoming events. Check back soon!
                </p>
              )}
            </div>
          </div>

          {/* Learning Progress */}
          <div className="bg-card rounded-lg border border-border p-6" data-testid="section-learning-progress">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-semibold text-foreground">Your Learning Journey</h3>
              <Button variant="link" className="text-primary hover:text-primary/80 text-sm font-medium p-0" data-testid="button-view-courses">
                View Courses
              </Button>
            </div>
            <div className="space-y-6">
              {enrollments && enrollments.length > 0 ? (
                enrollments.slice(0, 3).map((enrollment: any) => (
                  <CourseProgress key={enrollment.id} enrollment={enrollment} />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4" data-testid="text-no-enrollments">
                    You haven't enrolled in any courses yet.
                  </p>
                  <Button variant="outline" data-testid="button-explore-courses">
                    Explore Courses
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {/* Resource Monitoring */}
          <div className="bg-card rounded-lg border border-border p-6" data-testid="section-resource-monitoring">
            <h3 className="font-serif text-xl font-semibold text-foreground mb-6">Village Resources</h3>
            <div className="space-y-6">
              {resources && resources.length > 0 ? (
                resources.map((resource: any) => (
                  <ResourceMonitor key={resource.id} resource={resource} />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4" data-testid="text-no-resources">
                  No resource data available.
                </p>
              )}
            </div>
          </div>

          {/* Featured Artists */}
          <div className="bg-card rounded-lg border border-border p-6" data-testid="section-featured-artists">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-semibold text-foreground">Featured Artists</h3>
              <Button variant="link" className="text-primary hover:text-primary/80 text-sm font-medium p-0" data-testid="button-view-gallery">
                View Gallery
              </Button>
            </div>
            <div className="space-y-4">
              {topArtists.length > 0 ? (
                topArtists.map((artist: any) => (
                  <ArtistCard key={artist.id} artist={artist} />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4" data-testid="text-no-artists">
                  No featured artists yet.
                </p>
              )}
            </div>
          </div>

          {/* Current Projects */}
          <div className="bg-card rounded-lg border border-border p-6" data-testid="section-current-projects">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-semibold text-foreground">Current Projects</h3>
              <Button variant="link" className="text-primary hover:text-primary/80 text-sm font-medium p-0" data-testid="button-support-projects">
                Support
              </Button>
            </div>
            <div className="space-y-6">
              {activeProjects.length > 0 ? (
                activeProjects.map((project: any) => (
                  <ProjectCard key={project.id} project={project} />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4" data-testid="text-no-projects">
                  No active projects at the moment.
                </p>
              )}
            </div>
          </div>

          {/* Community Chat Preview */}
          <div className="bg-card rounded-lg border border-border p-6" data-testid="section-community-chat">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-xl font-semibold text-foreground">Community Chat</h3>
              <Button variant="link" className="text-primary hover:text-primary/80 text-sm font-medium p-0" data-testid="button-open-chat">
                Open Chat
              </Button>
            </div>
            <div className="space-y-4">
              {recentMessages.length > 0 ? (
                recentMessages.map((message: any) => (
                  <ChatPreview key={message.id} message={message} />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4" data-testid="text-no-messages">
                  No recent messages.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
