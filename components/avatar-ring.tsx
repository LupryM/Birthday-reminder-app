"use client"

import Image from "next/image"
import { cn } from "@/lib/utils"

interface AvatarRingProps {
  src: string
  alt: string
  size?: "sm" | "md" | "lg" | "xl"
  showRing?: boolean
  className?: string
}

export function AvatarRing({ src, alt, size = "md", showRing = true, className }: AvatarRingProps) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20",
    xl: "w-28 h-28",
  }

  const ringPadding = {
    sm: "p-0.5",
    md: "p-0.5",
    lg: "p-1",
    xl: "p-1",
  }

  return (
    <div
      className={cn(
        "rounded-full",
        showRing && "bg-gradient-to-br from-primary to-primary/70",
        showRing && ringPadding[size],
        className,
      )}
    >
      <div className={cn("rounded-full overflow-hidden bg-card", sizeClasses[size])}>
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          width={112}
          height={112}
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  )
}
