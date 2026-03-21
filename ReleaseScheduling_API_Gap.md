# Release Scheduling - Backend API Gap

## Current Frontend Scope

Frontend has been updated to:

- send `ScheduledReleaseAt` when creating song (`POST /Music/song`)
- send `ScheduledReleaseAt` when updating song (`PUT /Music/song/{id}`)
- show a release queue page: pending + upcoming songs

Current queue page is using `GET /Music/my-songs` and infers status from available fields.

## Required Backend Contract (Recommended)

### 1) Song payload fields

Please support and document these fields in song entity/DTO:

- `ScheduledReleaseAt` (DateTime?, UTC ISO-8601)
- `ReleaseStatus` (string enum): `pending`, `scheduled`, `published`, `failed`
- `PublishedAt` (DateTime?)

### 2) Create Song

Endpoint: `POST /Music/song`

Request should accept:

- `ScheduledReleaseAt` (optional)

Expected behavior:

- if `ScheduledReleaseAt` > now: song should not be public immediately
- set `ReleaseStatus = scheduled` (or pending based on moderation flow)

### 3) Update Song

Endpoint: `PUT /Music/song/{songId}`

Request should accept:

- `ScheduledReleaseAt` (optional)

Expected behavior:

- allow artist to change schedule before publish time
- if schedule is removed, fallback behavior should be defined (publish now vs keep pending)

### 4) Release queue endpoint (high priority)

Add dedicated endpoint to avoid frontend guessing logic.

Proposed:

- `GET /Music/my-scheduled-songs?status=pending|upcoming|all&pageIndex=1&pageSize=20`

Response item fields:

- `SongId`
- `Title`
- `ArtistNames`
- `Thumbnail`
- `ScheduledReleaseAt`
- `ReleaseStatus`
- `CreatedAt`
- `UpdatedAt`

### 5) Feature gate consistency

Endpoint already exists:

- `GET /Subscription/features/can-schedule`

Please ensure create/update scheduling returns clear error when feature not enabled:

- `403 Forbidden`
- message example: `Scheduling feature is not available for current plan`

### 6) Background publish job

Need server-side job to publish songs at schedule time:

- scan songs where `ScheduledReleaseAt <= now` and `ReleaseStatus = scheduled`
- publish atomically
- set `PublishedAt`
- send notification to owner

## Suggested Validation Rules

- `ScheduledReleaseAt` must be in UTC
- reject past timestamps with validation error (`400`)
- maximum future horizon (optional), for example 365 days

## Suggested Error Codes

- `400`: invalid datetime format / past datetime
- `403`: plan does not allow scheduling
- `409`: song already published, cannot re-schedule

## Notes

Until a dedicated release queue endpoint is available, frontend is using fallback detection from `GET /Music/my-songs`, which may be inaccurate if status fields are not returned consistently.
