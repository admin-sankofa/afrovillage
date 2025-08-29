import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Community from "@/pages/community";
import Events from "@/pages/events";
import Learning from "@/pages/learning";
import Resources from "@/pages/resources";
import Culture from "@/pages/culture";
import Funding from "@/pages/funding";
import Messages from "@/pages/messages";
import Settings from "@/pages/settings";
import MainLayout from "@/components/layout/main-layout";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading" />
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <MainLayout>
          <Route path="/" component={Dashboard} />
          <Route path="/community" component={Community} />
          <Route path="/events" component={Events} />
          <Route path="/learning" component={Learning} />
          <Route path="/resources" component={Resources} />
          <Route path="/culture" component={Culture} />
          <Route path="/funding" component={Funding} />
          <Route path="/messages" component={Messages} />
          <Route path="/settings" component={Settings} />
        </MainLayout>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
