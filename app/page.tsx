import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      {/* Logo/Title */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🦍</span>
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Rise of the Apes
        </h1>
        <p className="text-muted-foreground mt-2">
          Birthday tracker for the apes
        </p>
      </div>

      {/* Action buttons */}
      <div className="w-full max-w-sm space-y-4">
        <Link href="/auth/login" className="block">
          <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium">
            Login
          </Button>
        </Link>
        <Link href="/auth/sign-up" className="block">
          <Button
            variant="outline"
            className="w-full h-12 border-border bg-card hover:bg-secondary text-foreground rounded-xl font-medium"
          >
            Create Account
          </Button>
        </Link>
      </div>
    </div>
  );
}
