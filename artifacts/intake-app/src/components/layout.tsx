import { ReactNode, useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Clock, FileText, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: ReactNode }) {
  const [time, setTime] = useState(new Date());
  const [location] = useLocation();
  const { logout } = useAuth();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col font-sans">
      {/* Cartridge World Brand Header */}
      <header style={{ backgroundColor: "#FFD400" }} className="shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-3">
          {/* Left: Janus logo + title */}
          <div className="flex items-center gap-4">
            <img
              src="/janus-logo.png"
              alt="Janus Imprints & Services"
              className="h-16 w-auto object-contain drop-shadow-sm"
            />
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-black leading-tight">
                Janus Imprints & Services
              </h1>
              <p className="text-sm font-semibold text-black/80 mt-0.5">
                Cartridge World Franchise — Customer Intake System
              </p>
            </div>
          </div>

          {/* Center: Clock */}
          <div className="text-center">
            <div className="text-3xl font-mono font-bold flex items-center justify-center gap-3 bg-black/10 px-4 py-2 rounded-lg border border-black/15">
              <Clock className="w-6 h-6 text-black" />
              <span className="text-black">{time.toLocaleTimeString('en-IN', { hour12: false })}</span>
            </div>
            <div className="text-xs font-semibold text-black/75 mt-1">
              {time.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>

          {/* Right: Cartridge World logo */}
          <div className="flex items-center">
            <img
              src="/cw-logo.jpg"
              alt="Cartridge World"
              className="h-16 w-auto object-contain drop-shadow-sm rounded-lg"
            />
          </div>
        </div>

        {/* Yellow bottom stripe */}
        <div className="h-1" style={{ background: "linear-gradient(90deg, #0B4CC2 33%, #6CFF00 66%, #0B4CC2 100%)" }} />
      </header>

      {/* Navigation */}
      <nav className="bg-card border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex space-x-8">
              <Link
                href="/"
                className={`inline-flex items-center px-2 pt-1 border-b-2 text-sm font-semibold transition-colors ${
                  location === "/"
                    ? "border-[#FFD400] text-[#0B4CC2]"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <FileText className="w-5 h-5 mr-2" />
                New Intake
              </Link>
              <Link
                href="/dashboard"
                className={`inline-flex items-center px-2 pt-1 border-b-2 text-sm font-semibold transition-colors ${
                  location === "/dashboard"
                    ? "border-[#FFD400] text-[#0B4CC2]"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`}
              >
                <LayoutDashboard className="w-5 h-5 mr-2" />
                Admin Dashboard
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:block">admin</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
