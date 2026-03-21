import Link from "next/link";
import { Sparkles, BarChart2, Briefcase } from "lucide-react";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center px-4 md:px-8">
        <Link href="/" className="mr-8 flex items-center space-x-2 transition-opacity hover:opacity-80">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </div>
          <span className="font-bold tracking-tight text-lg">VibeBench</span>
        </Link>
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
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
  );
}
