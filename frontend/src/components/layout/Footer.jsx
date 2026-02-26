import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-xl font-semibold text-neutral-900">
              Navlai
            </Link>
            <p className="mt-4 max-w-md text-sm text-neutral-600">
              Connecting communities through meaningful events. Join us in making a positive impact 
              in your neighborhood through tree plantations, workshops, and awareness drives.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Quick Links</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-neutral-600 hover:text-neutral-900">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">Legal</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link to="/privacy" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-neutral-600 hover:text-neutral-900">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-neutral-200 pt-8">
          <p className="text-center text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} Navlai. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
