import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-brand-600 tracking-tight">
            VibeBench
          </Link>
          <div className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href="/models" className="text-gray-600 hover:text-gray-900 transition-colors">
              Models
            </Link>
            <Link href="/compare" className="text-gray-600 hover:text-gray-900 transition-colors">
              Compare
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
