import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, LogIn, Sun } from "lucide-react";
import { type FormEvent, useState } from "react";

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    const err = await login(username.trim(), password);
    if (err) {
      setError(err);
    }
    setIsSubmitting(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-background px-4"
      data-ocid="login-page"
    >
      <div className="w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center mb-4 shadow-md">
            <Sun className="w-8 h-8 text-accent-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-display font-bold text-foreground leading-tight">
            Shree Adishakti Solar
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Booking Dashboard — Sign In
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-xl shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isSubmitting}
                className="h-9 text-sm"
                data-ocid="login-username"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="h-9 text-sm"
                data-ocid="login-password"
              />
            </div>

            {error && (
              <div
                className="text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-md px-3 py-2"
                role="alert"
                data-ocid="login-error"
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-9 text-sm font-medium"
              disabled={isSubmitting}
              data-ocid="login-submit"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-5">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
