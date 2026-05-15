-- Add sc_followup_sent column for Senior Care Clarity track follow-up email tracking.
-- Mirrors snf_followup_sent; default false so all existing rows are unaffected.

ALTER TABLE submissions
  ADD COLUMN IF NOT EXISTS sc_followup_sent boolean NOT NULL DEFAULT false;
