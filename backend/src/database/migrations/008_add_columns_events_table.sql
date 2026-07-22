ALTER TABLE events
ADD COLUMN recurrence_rule TEXT[],
ADD COLUMN recurrence_end DATE;