import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./constants";
import type { GuessDifficulty } from "./guessToken";
import { normalizeShareStyle, type ShareStyleId } from "./shareStyles";

export {
  DIFFICULTY_LABELS,
  rankTitle,
  winRateOf,
  type RankTitle,
} from "./guessRank";

export interface ShareResultPayload {
  n: string; // nickname
  d: GuessDifficulty; // difficulty
  c: number; // correct
  t: number; // total
  a?: number; // author baseline win rate (%)
  s: ShareStyleId; // visual style id
}

const SHARE_EXPIRY = "30d";

export function signResult(payload: ShareResultPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: SHARE_EXPIRY });
}

export function verifyResult(token: string): ShareResultPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload &
      ShareResultPayload;
    if (
      !decoded ||
      typeof decoded.c !== "number" ||
      typeof decoded.t !== "number"
    ) {
      return null;
    }
    return {
      n: decoded.n,
      d: decoded.d,
      c: decoded.c,
      t: decoded.t,
      a: decoded.a,
      s: normalizeShareStyle(decoded.s),
    };
  } catch {
    return null;
  }
}
