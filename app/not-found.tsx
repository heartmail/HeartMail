'use client'

import Link from 'next/link'
import { Home, ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Logo from '@/components/ui/logo'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900 flex items-center justify-center relative overflow-hidden">
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

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <Logo size={48} className="h-12 w-12 mr-3" />
          <span className="text-3xl font-bold text-white">HeartMail</span>
        </div>

        {/* 404 Content */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 md:p-12">

          {/* Error Message */}
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 mb-4">
            404
          </h1>
          
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Page not found
          </h2>
          
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            Don't worry, even the best love letters sometimes take a wrong turn. 
            Let's get you back to spreading love and connecting hearts!
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/dashboard">
              <Button className="w-full sm:w-auto btn-heartmail text-lg px-8 py-3">
                <Home className="h-5 w-5 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
            
            <Button 
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full sm:w-auto border-2 border-pink-300 text-pink-600 hover:bg-pink-50 text-lg px-8 py-3"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Go Back
            </Button>
          </div>

          {/* Helpful Links */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-500 mb-4">Looking for something specific?</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/dashboard/recipients" className="flex items-center text-pink-600 hover:text-pink-700 transition-colors">
                <Mail className="h-4 w-4 mr-2" />
                Recipients
              </Link>
              <Link href="/dashboard/schedule" className="flex items-center text-pink-600 hover:text-pink-700 transition-colors">
                <Mail className="h-4 w-4 mr-2" />
                Schedule
              </Link>
              <Link href="/dashboard/templates" className="flex items-center text-pink-600 hover:text-pink-700 transition-colors">
                <Mail className="h-4 w-4 mr-2" />
                Templates
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Message */}
        <div className="mt-8 text-center">
          <p className="text-white/80 text-sm">
            Remember: Every lost page is just a love letter waiting to be found 💕
          </p>
        </div>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .floating-hearts {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 1;
        }

        .floating-heart {
          position: absolute;
          font-size: 2rem;
          animation: float 6s ease-in-out infinite;
          opacity: 0.7;
        }

        .floating-heart:nth-child(1) {
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .floating-heart:nth-child(2) {
          top: 20%;
          right: 10%;
          animation-delay: 1s;
        }

        .floating-heart:nth-child(3) {
          top: 60%;
          left: 5%;
          animation-delay: 2s;
        }

        .floating-heart:nth-child(4) {
          top: 80%;
          right: 15%;
          animation-delay: 3s;
        }

        .floating-heart:nth-child(5) {
          top: 30%;
          left: 50%;
          animation-delay: 4s;
        }

        .floating-heart:nth-child(6) {
          top: 70%;
          right: 30%;
          animation-delay: 5s;
        }

        .floating-heart:nth-child(7) {
          top: 40%;
          left: 80%;
          animation-delay: 2.5s;
        }

        .floating-heart:nth-child(8) {
          top: 90%;
          left: 70%;
          animation-delay: 1.5s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
      `}</style>
    </div>
  )
}

