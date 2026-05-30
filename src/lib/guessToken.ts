import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./constants";

export type GuessDifficulty = "easy" | "medium" | "hard";

export interface GuessOption {
  value: string;
  label: string;
}

export interface GuessQuestionPayload {
  // Per-question id; used to enforce single submission (anti double-scoring).
  jti: string;
  submission_id: string;
  challenge_phase_id: string;
  difficulty: GuessDifficulty;
  options: GuessOption[];
}

const QUESTION_EXPIRY = "1h";

/**
 * Sign a question token. The token does NOT contain the correct answer — it is
 * recomputed server-side from `submission_id` at answer time (JWT is signed,
 * not encrypted, so anything inside is readable by the client).
 */
export function signQuestion(payload: GuessQuestionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: QUESTION_EXPIRY });
}

export function verifyQuestion(token: string): GuessQuestionPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload &
      GuessQuestionPayload;
    if (
      !decoded ||
      typeof decoded.jti !== "string" ||
      typeof decoded.submission_id !== "string" ||
      typeof decoded.challenge_phase_id !== "string" ||
      !Array.isArray(decoded.options)
    ) {
      return null;
    }
    return {
      jti: decoded.jti,
      submission_id: decoded.submission_id,
      challenge_phase_id: decoded.challenge_phase_id,
      difficulty: decoded.difficulty,
      options: decoded.options,
    };
  } catch {
    return null;
  }
}
