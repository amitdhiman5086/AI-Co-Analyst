import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";

export function Login() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // If session is already established, redirect to home
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-canvas text-ink">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="font-heading text-lg font-normal tracking-wide text-muted animate-pulse">
            Establishing Session...
          </p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    setActionLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        setSuccessMsg(
          "Registration completed! Check your email for verification if email confirmation is enabled on the server, or sign in now."
        );
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }

        navigate("/", { replace: true });
      }
    } catch (err: unknown) {
      const error = err as Error;
      setErrorMsg(error.message || "An error occurred during authentication.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 py-12">
      <div className="w-full max-w-md border border-hairline bg-surface-card p-8 rounded-lg">
        {/* Logo and Header */}
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="flex items-center gap-2 mb-3">
            {/* Anthropic 4-spoke radial-spike mark */}
            <svg 
              className="h-6 w-6 text-primary animate-pulse" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2c0 5.523-4.477 10-10 10 5.523 0 10 4.477 10 10 0-5.523 4.477-10 10-10-5.523 0-10-4.477-10-10z" />
            </svg>
            <span className="font-sans text-lg font-semibold tracking-tight text-ink">
              AI Co-Analyst
            </span>
          </div>
          
          <h1 className="font-heading text-3xl font-normal tracking-tight text-ink my-2 leading-tight">
            Meet your thinking partner
          </h1>
          <p className="font-sans text-xs uppercase tracking-[0.12em] text-muted font-medium mt-1">
            SEC Research & Grounding Platform
          </p>
        </div>

        {/* Category Tab Toggle */}
        <div className="mb-6 flex p-1 bg-surface-soft rounded-md border border-hairline-soft">
          <button
            type="button"
            className={`flex-1 py-2 text-xs uppercase tracking-wider font-medium rounded-md transition-all ${
              !isSignUp
                ? "bg-canvas text-ink"
                : "text-muted hover:text-ink"
            }`}
            onClick={() => {
              setIsSignUp(false);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-xs uppercase tracking-wider font-medium rounded-md transition-all ${
              isSignUp
                ? "bg-canvas text-ink"
                : "text-muted hover:text-ink"
            }`}
            onClick={() => {
              setIsSignUp(true);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
          >
            Register
          </button>
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="mb-6 border border-error/20 bg-error/10 px-4 py-3 rounded-md text-xs text-error font-sans flex items-start gap-2">
            <span className="font-bold uppercase tracking-wider">Error:</span>
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mb-6 border border-success/20 bg-success/10 px-4 py-3 rounded-md text-xs text-success font-sans flex items-start gap-2">
            <span className="font-bold uppercase tracking-wider">Success:</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5 text-left">
            <label
              htmlFor="email"
              className="text-[10px] font-bold uppercase tracking-widest text-muted"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              required
              disabled={actionLoading}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="analyst@firm.com"
              className="flex h-10 w-full rounded-md border border-hairline bg-canvas px-3.5 py-2 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/15 transition-all disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="space-y-1.5 text-left">
            <label
              htmlFor="password"
              className="text-[10px] font-bold uppercase tracking-widest text-muted"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              disabled={actionLoading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="flex h-10 w-full rounded-md border border-hairline bg-canvas px-3.5 py-2 text-sm text-ink placeholder:text-muted-soft focus:outline-none focus:border-primary focus:ring-3 focus:ring-primary/15 transition-all disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <Button
            type="submit"
            disabled={actionLoading}
            className="w-full mt-2 h-10 text-sm font-medium tracking-normal"
          >
            {actionLoading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
