import Image from 'next/image'
import { Heart } from 'lucide-react'

interface LogoProps {
  className?: string
  size?: number
}

export default function Logo({ className = '', size = 32 }: LogoProps) {
  return (
    <div className={`relative ${className}`}>
      <Image
        src="/logo.png"
        alt="HeartMail Logo"
        width={size}
        height={size}
        className="object-contain"
        priority
        unoptimized
      />
    </div>
  )
}
