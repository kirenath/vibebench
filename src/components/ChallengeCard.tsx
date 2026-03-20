import Link from "next/link";
import type { Challenge } from "@/types";

const cardRadii = [
  "rounded-[2rem] rounded-tl-[4rem]",
  "rounded-[2rem] rounded-tr-[4rem]",
  "rounded-[2rem] rounded-bl-[4rem]",
  "rounded-[2rem] rounded-br-[5rem]",
  "rounded-[2rem] rounded-tl-[5rem]",
  "rounded-[2rem] rounded-tr-[3rem] rounded-bl-[4rem]",
];

export default function ChallengeCard({ challenge, submissionCount, index = 0 }: { challenge: Challenge; submissionCount?: number; index?: number }) {
  const radiusClass = cardRadii[index % cardRadii.length];
  return (
    <Link
      href={`/challenges/${challenge.id}`}
      className={`group block ${radiusClass} border border-organic-border/50 bg-organic-card overflow-hidden shadow-soft hover:-translate-y-1 hover:shadow-soft-hover transition-all duration-300`}
    >
      {challenge.cover_image && (
        <div className="aspect-video bg-organic-muted overflow-hidden">
          <img
            src={challenge.cover_image}
            alt={challenge.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </div>
      )}
      {!challenge.cover_image && (
        <div className="aspect-video bg-gradient-to-br from-organic-primary/10 to-organic-secondary/10 flex items-center justify-center">
          <span className="text-4xl">🌿</span>
        </div>
      )}
      <div className="p-6">
        <h3 className="font-heading font-semibold text-lg text-organic-fg group-hover:text-organic-primary transition-colors duration-300">
          {challenge.title}
        </h3>
        {challenge.description && (
          <p className="mt-2 text-sm text-organic-muted-fg line-clamp-2">{challenge.description}</p>
        )}
        {typeof submissionCount === "number" && (
          <p className="mt-3 text-xs text-organic-muted-fg/70">{submissionCount} submissions</p>
        )}
      </div>
    </Link>
  );
}
