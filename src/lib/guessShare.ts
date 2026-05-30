import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./constants";
import type { GuessDifficulty } from "./guessToken";
import type { ShareTemplate, ShareHighlight } from "./guessRank";

export type { ShareTemplate, ShareHighlight } from "./guessRank";
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
  tpl: ShareTemplate;
  h?: ShareHighlight; // highlight wrong guess
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
      tpl: decoded.tpl ?? "scoreboard",
      h: decoded.h,
    };
  } catch {
    return null;
  }
}
