import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

/**
 * Route protection component. Redirects to /login if user is not authenticated.
 * Renders a premium loading indicator while fetching auth state.
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="font-heading text-lg font-medium tracking-wide text-muted-foreground animate-pulse">
            Establishing Session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
