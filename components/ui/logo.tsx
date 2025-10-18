interface LogoProps {
  className?: string
  size?: number
}

export default function Logo({ className = '', size = 32 }: LogoProps) {
  return (
        <img
          src="https://fmuhjcrbwuoisjwuvreg.supabase.co/storage/v1/object/public/heartmail-site-bucket/logo.png"
          alt="HeartMail Logo"
          width={size}
          height={size}
          className={`object-contain ${className}`}
          style={{ width: size, height: size }}
        />
  )
}
