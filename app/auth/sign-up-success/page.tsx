import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-sm">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-6">
          <Mail className="w-10 h-10 text-primary" />
        </div>

        <h1 className="text-2xl font-bold text-foreground">Check your email</h1>
        <p className="text-muted-foreground mt-3">
          We've sent you a confirmation link. Click it to activate your account and join the apes.
        </p>

        <Link href="/auth/login" className="block mt-8">
          <Button
            variant="outline"
            className="w-full h-12 border-border bg-card hover:bg-secondary text-foreground rounded-xl font-medium"
          >
            Back to login
          </Button>
        </Link>
      </div>
    </div>
  )
}
