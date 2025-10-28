import SignupForm from '@/components/auth/signup-form-new'

export default function SignupPage() {
  return (
    <main className="min-h-screen heartmail-gradient flex items-center justify-center relative overflow-hidden">
      {/* Floating Hearts */}
      <div className="floating-hearts">
        <div className="floating-heart">💖</div>
        <div className="floating-heart">💕</div>
        <div className="floating-heart">💗</div>
        <div className="floating-heart">💝</div>
        <div className="floating-heart">💘</div>
        <div className="floating-heart">💖</div>
        <div className="floating-heart">💕</div>
        <div className="floating-heart">💗</div>
      </div>
      
      <div className="relative z-10 w-full max-w-md px-4">
        <SignupForm />
      </div>
    </main>
  )
}
