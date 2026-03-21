import Link from "next/link";
import { Sparkles, BarChart2, Briefcase } from "lucide-react";

export function Navbar() {
  return (
    <div className="sticky top-4 z-50 w-full px-4 md:px-8 mt-4">
      <header className="mx-auto w-full max-w-5xl rounded-full border border-border/50 bg-card/80 backdrop-blur-md shadow-soft">
        <div className="flex h-16 items-center px-6 md:px-8">
          <Link href="/" className="mr-8 flex items-center space-x-3 transition-opacity hover:opacity-80">
            <div className="flex aspect-square size-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground">
              <Sparkles className="size-5" />
            </div>
            <span className="font-serif font-bold tracking-tight text-xl">VibeBench</span>
          </Link>
          <nav className="flex flex-1 items-center space-x-6 text-sm font-bold">
          <Link href="/" className="transition-colors hover:text-primary text-foreground/80">
            Challenges
          </Link>
          <Link href="/models" className="transition-colors hover:text-primary text-foreground/80">
            Models Directory
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Link href="/admin/login" className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors">
            <Briefcase className="size-4" />
            <span className="hidden sm:inline-block">Admin</span>
          </Link>
        </div>
        </div>
      </header>
    </div>
  );
}
