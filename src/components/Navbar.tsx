import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="sticky top-4 z-50 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-4">
      <div className="bg-white/70 backdrop-blur-md border border-organic-border/50 rounded-full shadow-soft px-6">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-full bg-organic-primary flex items-center justify-center text-white text-sm font-bold font-heading">V</span>
            <span className="text-lg font-bold font-heading text-organic-primary tracking-tight">VibeBench</span>
          </Link>
          <div className="flex items-center gap-1 text-sm font-medium">
            <Link href="/" className="px-4 py-2 rounded-full text-organic-fg/70 hover:text-organic-primary hover:bg-organic-primary/10 transition-all duration-300">
              Home
            </Link>
            <Link href="/models" className="px-4 py-2 rounded-full text-organic-fg/70 hover:text-organic-primary hover:bg-organic-primary/10 transition-all duration-300">
              Models
            </Link>
            <Link href="/compare" className="px-4 py-2 rounded-full text-organic-fg/70 hover:text-organic-primary hover:bg-organic-primary/10 transition-all duration-300">
              Compare
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
