import Link from "next/link";
import type { Challenge } from "@/types";

export default function ChallengeCard({ challenge, submissionCount }: { challenge: Challenge; submissionCount?: number }) {
  return (
    <Link
      href={`/challenges/${challenge.id}`}
      className="group block rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow"
    >
      {challenge.cover_image && (
        <div className="aspect-video bg-gray-100 overflow-hidden">
          <img
            src={challenge.cover_image}
            alt={challenge.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      {!challenge.cover_image && (
        <div className="aspect-video bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
          <span className="text-4xl">🎯</span>
        </div>
      )}
      <div className="p-5">
        <h3 className="font-semibold text-lg text-gray-900 group-hover:text-brand-600 transition-colors">
          {challenge.title}
        </h3>
        {challenge.description && (
          <p className="mt-1 text-sm text-gray-500 line-clamp-2">{challenge.description}</p>
        )}
        {typeof submissionCount === "number" && (
          <p className="mt-3 text-xs text-gray-400">{submissionCount} submissions</p>
        )}
      </div>
    </Link>
  );
}
