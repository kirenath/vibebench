CREATE TABLE public.eval_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_phase_id UUID NOT NULL REFERENCES challenge_phases(id) ON DELETE CASCADE,
  left_submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  right_submission_id UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  winner TEXT NOT NULL,
  voter_token TEXT NOT NULL,
  duration_ms INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT eval_votes_winner_valid
    CHECK (winner IN ('left', 'right', 'both_good', 'both_bad')),
  CONSTRAINT eval_votes_different_submissions
    CHECK (left_submission_id <> right_submission_id),
  CONSTRAINT eval_votes_unique_vote
    UNIQUE (voter_token, left_submission_id, right_submission_id)
);

CREATE INDEX eval_votes_phase_idx ON eval_votes (challenge_phase_id, created_at DESC);
CREATE INDEX eval_votes_submission_idx ON eval_votes (left_submission_id, right_submission_id);
