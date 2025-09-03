import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

const navigationItems = [
  {
    icon: "fas fa-home",
    label: "Dashboard",
    href: "/",
  },
  {
    icon: "fas fa-users",
    label: "Community",
    href: "/community",
  },
  {
    icon: "fas fa-calendar-alt",
    label: "Events & Retreats",
    href: "/events",
  },
  {
    icon: "fas fa-graduation-cap",
    label: "Learning Hub",
    href: "/learning",
  },
  {
    icon: "fas fa-chart-line",
    label: "Resources",
    href: "/resources",
  },
  {
    icon: "fas fa-palette",
    label: "Culture & Arts",
    href: "/culture",
  },
  {
    icon: "fas fa-hand-holding-heart",
    label: "Funding",
    href: "/funding",
  },
  {
    icon: "fas fa-comments",
    label: "Messages",
    href: "/messages",
  },
];

export default function Sidebar() {
  const { user } = useAuth();
  const [location] = useLocation();

  // Fetch unread message count
  const { data: messages } = useQuery({
    queryKey: ["/api/messages"],
    enabled: !!user,
  });

  const { data: communityMessages } = useQuery({
    queryKey: ["/api/messages/community"],
    enabled: !!user,
  });

  // Calculate total unread messages (for now, assuming all fetched messages are unread)
  const unreadCount = (Array.isArray(messages) ? messages.length : 0) + 
                     (Array.isArray(communityMessages) ? communityMessages.length : 0);

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col" data-testid="sidebar-navigation">
      {/* Logo & Village Name */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary via-accent to-secondary rounded-lg flex items-center justify-center">
            <i className="fas fa-leaf text-white text-lg"></i>
          </div>
          <div>
            <h1 className="font-serif font-bold text-xl text-foreground">Afro Village</h1>
            <p className="text-muted-foreground text-sm">Sustainable Community</p>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <img 
            src={user?.profileImageUrl || "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"} 
            alt="User Profile" 
            className="w-10 h-10 rounded-full object-cover" 
            data-testid="img-user-profile"
          />
          <div className="flex-1">
            <p className="font-medium text-sm" data-testid="text-user-name">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}` 
                : user?.email || "User"}
            </p>
            <div className="flex items-center space-x-1">
              <span className="inline-block w-2 h-2 bg-secondary rounded-full"></span>
              <p className="text-muted-foreground text-xs capitalize" data-testid="text-user-role">
                {user?.role || "Member"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6" data-testid="nav-main">
        <ul className="space-y-2">
          {navigationItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <button
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                    location === item.href
                      ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                  data-testid={`nav-link-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <div className="flex items-center space-x-3">
                    <i className={`${item.icon} w-5`}></i>
                    <span>{item.label}</span>
                  </div>
                  {item.label === "Messages" && unreadCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full" data-testid="badge-messages">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Settings & Logout */}
      <div className="p-4 border-t border-border">
        <Link href="/settings">
          <button 
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            data-testid="nav-link-settings"
          >
            <i className="fas fa-cog w-5"></i>
            <span>Settings</span>
          </button>
        </Link>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors justify-start"
          data-testid="button-logout"
        >
          <i className="fas fa-sign-out-alt w-5"></i>
          <span>Logout</span>
        </Button>
      </div>
    </aside>
  );
}
