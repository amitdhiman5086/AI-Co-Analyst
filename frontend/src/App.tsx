import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/auth-context";
import { ProtectedRoute } from "./components/protected-route";
import { Login } from "./pages/login";
import { Button } from "./components/ui/button";

function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Header / Navigation */}
      <header className="flex h-16 items-center justify-between border-b border-hairline bg-canvas px-8 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          {/* SVG 4-spoke brand logo */}
          <svg 
            className="h-5 w-5 text-primary" 
            viewBox="0 0 24 24" 
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2c0 5.523-4.477 10-10 10 5.523 0 10 4.477 10 10 0-5.523 4.477-10 10-10-5.523 0-10-4.477-10-10z" />
          </svg>
          <span className="font-sans text-base font-semibold tracking-tight text-ink">
            AI Co-Analyst
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted font-mono bg-surface-soft px-3 py-1 rounded border border-hairline-soft">
            {user?.email}
          </span>
          <Button variant="outline" size="xs" onClick={signOut}>
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 bg-canvas flex flex-col justify-center py-section px-8">
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-xl items-center text-left">
          {/* Left Column: Editorial Hero Headings */}
          <div className="space-y-md pr-0 md:pr-lg">
            <div className="inline-flex items-center gap-1.5 bg-surface-cream-strong border border-hairline px-3 py-1 rounded-pill text-xs font-medium text-ink font-sans">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-teal animate-pulse" />
              Environment Ready
            </div>
            
            <h1 className="font-heading text-display-lg font-normal text-ink leading-tight tracking-tight">
              Grounded intelligence for SEC analysis.
            </h1>
            
            <p className="text-body text-base font-normal leading-relaxed max-w-md">
              Securely connected to your corporate research repository. Query, verify, and cite SEC filings with cryptographic trust and zero speculation.
            </p>
          </div>

          {/* Right Column: Authentication Status Card (Feature Card style) */}
          <div className="bg-surface-card border border-hairline rounded-lg p-xl space-y-lg shadow-sm">
            <div className="flex items-center justify-between border-b border-hairline pb-sm">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted">
                Security Token
              </span>
              <span className="text-[10px] font-mono text-accent-teal bg-surface-soft px-2 py-0.5 rounded border border-hairline-soft">
                ACTIVE
              </span>
            </div>

            <div className="space-y-sm">
              <h3 className="font-heading text-display-sm font-normal text-ink leading-snug">
                Securely Authenticated
              </h3>
              <p className="text-body text-sm leading-relaxed">
                Your bearer session has been verified with Supabase Auth. All outbound queries to the Python FastAPI backend will carry this authenticated token.
              </p>
            </div>

            {/* Next Steps (Dark Surface block representation) */}
            <div className="bg-surface-dark text-on-dark rounded-md p-md font-mono text-xs space-y-xs border border-surface-dark-elevated">
              <div className="flex items-center justify-between border-b border-surface-dark-soft pb-xs mb-xs">
                <span className="text-[10px] uppercase tracking-wider text-on-dark-soft">
                  Next Stage
                </span>
                <span className="h-2 w-2 rounded-full bg-accent-amber" />
              </div>
              <p className="text-accent-amber font-semibold">Phase 3 — Chat Shell (Stubbed)</p>
              <p className="text-on-dark-soft text-[11px] leading-relaxed">
                Implement chat thread CRUD operations on the FastAPI backend and stream replies using React AI SDK.
              </p>
            </div>

            <div className="pt-xs">
              <Button className="w-full" onClick={() => alert("Ready for Phase 3!")}>
                Initialize Sandbox
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
