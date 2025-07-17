import Link from "next/link"
import { Facebook, Instagram, TreesIcon as Threads } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Section */}
          <div className="space-y-4 md:col-span-1">
            <h2 className="text-2xl font-bold">MOTOSHOP</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              <span className="md:hidden">Best gear with best prices. All in one place.</span>
              <span className="">
                We have clothes that suits your style and which you're proud to wear. From women to men.
              </span>
            </p>
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Facebook className="w-4 h-4 text-black" />
              </div>
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Instagram className="w-4 h-4 text-black" />
              </div>
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Threads className="w-4 h-4 text-black" />
              </div>
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                <span className="text-black font-bold text-xs">♪</span>
              </div>
            </div>
          </div>

          {/* Company Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider">COMPANY</h3>
            <nav className="space-y-3">
              <Link href="#" className="block text-gray-400 hover:text-white text-sm transition-colors">
                About
              </Link>
              <Link href="#" className="hidden md:block text-gray-400 hover:text-white text-sm transition-colors">
                Features
              </Link>
              <Link href="#" className="hidden md:block text-gray-400 hover:text-white text-sm transition-colors">
                Works
              </Link>
              <Link href="#" className="hidden md:block text-gray-400 hover:text-white text-sm transition-colors">
                Career
              </Link>
            </nav>
          </div>

          {/* Help Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider">HELP</h3>
            <nav className="space-y-3">
              <Link href="#" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Customer Support
              </Link>
              <Link href="#" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Delivery Details
              </Link>
              <Link href="#" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Terms & Conditions
              </Link>
              <Link href="#" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
            </nav>
          </div>

          {/* FAQ Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold tracking-wider">FAQ</h3>
            <nav className="space-y-3">
              <Link href="#" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Account
              </Link>
              <Link href="#" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Manage Deliveries
              </Link>
              <Link href="#" className="block text-gray-400 hover:text-white text-sm transition-colors">
                Orders
              </Link>
              <Link href="#" className="block text-gray-400 hover:text-white text-sm transition-colors">
                <span className="md:hidden">Payment</span>
                <span className="hidden md:inline">Payments</span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">Motoshop © 2025-2028, All Rights Reserved</p>
            <div className="flex space-x-2">
              <div className="bg-white rounded px-2 py-1">
                <span className="text-blue-600 font-bold text-xs">VISA</span>
              </div>
              <div className="bg-white rounded px-2 py-1">
                <div className="flex space-x-1">
                  <div className="w-3 h-2 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-2 bg-orange-400 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
