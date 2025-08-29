import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

export default function Header() {
  const { user } = useAuth();
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    // TODO: Save to localStorage
  };

  return (
    <header className="bg-card border-b border-border p-6" data-testid="header-main">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-foreground" data-testid="text-welcome">
            Welcome back, {user?.firstName || user?.email?.split('@')[0] || 'Friend'}!
          </h2>
          <p className="text-muted-foreground" data-testid="text-subtitle">
            Here's what's happening in your village today
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-notifications"
          >
            <i className="fas fa-bell text-lg"></i>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full"></span>
          </Button>
          <div className="h-8 w-px bg-border"></div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
            data-testid="button-theme-toggle"
          >
            <i className={isDark ? "fas fa-sun" : "fas fa-moon"}></i>
            <span className="text-sm">{isDark ? "Light" : "Dark"} Mode</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
