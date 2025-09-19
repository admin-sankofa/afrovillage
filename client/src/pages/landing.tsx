import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import LoginForm from "@/components/auth/login-form";

export default function Landing() {
  const { isAuthenticated, isLoading } = useSupabaseAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      setLocation('/');
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // If already authenticated, redirect (handled by useEffect)
  if (isAuthenticated) {
    return null;
  }

  // Show login form instead of landing page
  return <LoginForm />;
}