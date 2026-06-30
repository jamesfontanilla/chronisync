# User Journeys

## 1. Patient Login and Daily Check-In

1. The patient signs in.
2. The dashboard loads the most relevant summary cards.
3. The patient reviews recent vitals and any new alerts.
4. The patient opens documents or medications if something changed.
5. The patient leaves with a clear sense of what needs attention.

## 2. Patient Uploads a Document

1. The patient selects a lab result or referral note.
2. The upload route stores the file in Firebase Storage.
3. A document record is created in Firestore.
4. The physician sees the new item in the review queue.
5. Any extracted or summarized content is reviewed before use.

## 3. Physician Reviews the Panel

1. The physician opens the dashboard.
2. Open alerts, pending documents, and draft summaries appear first.
3. The physician inspects the patient card for context.
4. The physician acknowledges or resolves items as needed.
5. The dashboard revalidates so the queue reflects the latest state.

## 4. Physician Publishes a Summary

1. The physician reviews an AI-assisted draft.
2. The summary is edited if needed.
3. The physician approves or publishes the final version.
4. The summary appears in the patient timeline.
5. Follow-up recommendations stay visible for later care.

## 5. Admin Manages Platform Health

1. The admin opens the system dashboard.
2. User counts, queue sizes, and sync health are reviewed.
3. The admin inspects the users or rules page when needed.
4. A change is saved only after review.
5. The dashboard remains the single place for status checks.

## 6. Notification Follow-Up

1. A meaningful event creates a notification record.
2. The recipient sees it in the global notification feed.
3. The notification is read, archived, or removed.
4. The unread count drops immediately.
5. The feed stays focused on current work.
