import type { ReactNode } from "react";
import Blob from "@/components/Blob";

interface StaticPageLayoutProps {
  eyebrow: string;
  title: string;
  description: string;
  updatedAt?: string;
  children: ReactNode;
}

export default function StaticPageLayout({
  eyebrow,
  title,
  description,
  updatedAt,
  children,
}: StaticPageLayoutProps) {
  return (
    <div className="relative overflow-x-clip">
      {/* Background wash that extends behind navbar to eliminate dividing line */}
      <div
        className="absolute inset-0 -top-24 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 20% 50%, rgba(93,112,82,0.10) 0%, transparent 70%), radial-gradient(ellipse 60% 60% at 85% 30%, rgba(193,140,93,0.08) 0%, transparent 70%)",
        }}
      />
      <Blob
        color="bg-primary"
        size="w-72 h-72"
        className="-top-16 -left-16 animate-float-slower"
        shapeIndex={0}
      />
      <Blob
        color="bg-secondary"
        size="w-80 h-80"
        className="top-24 -right-20 animate-float-slow"
        shapeIndex={1}
      />

      <section className="section !pt-8 md:!pt-12">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 md:mb-12">
            <span className="badge-primary mb-4 inline-flex">{eyebrow}</span>
            <h1 className="font-heading text-4xl font-bold text-foreground md:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {description}
            </p>
            {updatedAt && (
              <p className="mt-4 text-sm text-muted-foreground/80">
                最后更新：{updatedAt}
              </p>
            )}
          </div>

          <div className="card rounded-[2rem] border-border/60 bg-card/80 p-8 backdrop-blur-sm md:p-10">
            <div className="prose prose-stone max-w-none prose-headings:font-heading prose-headings:text-foreground prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground prose-a:text-primary hover:prose-a:text-secondary">
              {children}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
