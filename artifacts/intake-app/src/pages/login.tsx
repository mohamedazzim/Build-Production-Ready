import { useState } from "react";
import { useAuth } from "@/context/auth-context";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Clock, Eye, EyeOff, LogIn } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function LoginPage() {
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    setTimeout(() => {
      const ok = login(username.trim(), password);
      if (ok) {
        navigate("/");
      } else {
        setError("Invalid username or password. Please try again.");
        setLoading(false);
      }
    }, 400);
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background">
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
              <span className="text-black">{time.toLocaleTimeString("en-IN", { hour12: true })}</span>
            </div>
            <div className="text-xs font-semibold text-black/75 mt-1">
              {time.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
          </div>

          {/* Right: Cartridge World logo */}
          <div className="flex items-center">
            <img
              src="/cw-logo.jpg"
              alt="Cartridge World"
              className="object-contain drop-shadow-sm rounded-lg"
              style={{ height: "64px", width: "94px" }}
            />
          </div>
        </div>

        {/* Brand stripe */}
        <div className="h-1" style={{ background: "linear-gradient(90deg, #0B4CC2 33%, #6CFF00 66%, #0B4CC2 100%)" }} />
      </header>

      {/* Login Card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden" style={{ borderTop: "4px solid #FFD400" }}>
            <div className="bg-[#FFD400]/10 border-b border-border px-8 py-6 text-center">
              <div
                className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-3"
                style={{ backgroundColor: "#FFD400", border: "2px solid #0B4CC2" }}
              >
                <LogIn className="w-7 h-7" style={{ color: "#0B4CC2" }} />
              </div>
              <h2 className="text-xl font-bold text-foreground">Staff Login</h2>
              <p className="text-sm text-muted-foreground mt-1">Sign in to access the intake system</p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  autoFocus
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full font-semibold text-white"
                style={{ backgroundColor: "#0B4CC2" }}
                disabled={loading}
              >
                <LogIn className="w-4 h-4 mr-2" />
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
