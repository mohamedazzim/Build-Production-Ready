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
      {/* Deep Blue Header */}
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">InkCraft Service Centre</h1>
            <div className="text-sm text-primary-foreground/90 mt-2 flex flex-wrap gap-2 items-center">
              <span className="font-medium">12 Printer Lane, Tech Park, Mumbai 400001</span>
              <span className="hidden md:inline">•</span>
              <span className="font-medium">+91 98765 43210</span>
              <span className="hidden md:inline">•</span>
              <span className="font-medium">service@inkcraft.in</span>
            </div>
          </div>
          <div className="text-left md:text-right">
            <div className="text-3xl font-mono font-bold flex items-center justify-start md:justify-end gap-3 bg-primary-foreground/10 px-4 py-2 rounded-lg border border-primary-foreground/20">
              <Clock className="w-7 h-7" />
              {time.toLocaleTimeString('en-IN', { hour12: false })}
            </div>
            <div className="text-sm font-medium text-primary-foreground/90 mt-2">
              {time.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>
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
                    ? "border-primary text-primary"
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
                    ? "border-primary text-primary"
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
