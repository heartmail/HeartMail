import Link from 'next/link'
import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-pink-500 fill-pink-500" />
              <span className="text-2xl font-bold">HeartMail</span>
            </Link>
            <p className="text-gray-400 mb-4 leading-relaxed">
              Keeping hearts connected, one email at a time.
            </p>
            <p className="text-gray-400">
              <span className="block mb-1 font-medium text-white">Contact Us:</span>
              <a href="mailto:heartmailio@gmail.com" className="text-pink-400 hover:text-pink-300 transition-colors">heartmailio@gmail.com</a>
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Product</h4>
            <ul className="space-y-3">
              <li><Link href="#features" className="text-gray-400 hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/letter-library" className="text-gray-400 hover:text-white transition-colors">Templates</Link></li>
              <li><Link href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Support</h4>
            <ul className="space-y-3">
              <li><Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="#about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-8 text-center text-gray-400">
          <p>&copy; 2025 HeartMail. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
