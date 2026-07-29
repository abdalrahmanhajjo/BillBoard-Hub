# Operations runbook

## First response

For any incident:

1. Record start time, environment, affected surface, and reporter.
2. Determine whether the issue affects public browsing, authentication, reservations, admin
   operations, screen playback, or analytics.
3. Check the latest deployment and configuration changes.
4. Preserve logs and request identifiers.
5. Mitigate before investigating deeply when data integrity or security is at risk.

## Application cannot start

Check:

- `MONGODB_URI` is present and reachable.
- `MONGODB_DB_NAME` is set.
- `ACCESS_TOKEN_TTL_MS` and `REFRESH_TOKEN_TTL_MS` are valid positive integers.
- The Node.js version matches project requirements.
- The production build completed successfully.

## Authentication failures

Symptoms: login loop, invalid JSON from Auth.js, unexpected `401`.

Check:

1. `/api/auth/session` returns JSON.
2. `/api/auth/csrf` returns JSON.
3. `/api/auth/[...nextauth]` is present in the build route list.
4. `AUTH_SECRET` and `NEXTAUTH_URL` match the environment.
5. The user exists, is active, and has a valid bcrypt hash.
6. Browser cookies are not blocked and the secure-cookie policy matches HTTPS.

Changing `AUTH_SECRET` invalidates existing sessions.

## MongoDB connectivity

Symptoms: pages fail, API returns `500`, connection timeouts.

Check:

- Atlas/network allowlist or private network routing
- Credentials and database name
- Connection and operation limits
- Replica health
- Application logs without printing the URI

If writes may have partially succeeded, verify records before retrying mutations.

## Reservation conflicts

Expected `409` conflicts are business outcomes, not incidents.

Investigate when:

- Approved overlaps exceed capacity.
- Identical requests are created unexpectedly.
- Pending requests block the calendar.
- Static and digital capacity rules are applied incorrectly.

Verify overlapping approved bookings using inclusive date comparisons and rerun the same capacity
calculation used by `bookingService.updateStatus`.

## Screen not playing

1. Confirm the billboard exists and is digital.
2. Request `/api/v1/public/screens/{billboardId}/now-playing`.
3. Confirm an active, non-cancelled schedule covers current UTC time.
4. Confirm the playlist exists and belongs to the billboard.
5. Confirm creative ids resolve.
6. Confirm asset URLs are reachable from the screen network.

An empty or missing schedule correctly returns `playing: false`.

## Missing impressions

1. Check device request status and payload.
2. Confirm billboard, playlist, and creative reference chain.
3. Verify device clock and `occurredAt`.
4. Query admin analytics with the same billboard/playlist filters.
5. Check rate limiting or authentication once device security is introduced.

Do not fabricate or bulk replay impressions without an approved reconciliation process.

## Image upload failure

- A `503` from upload auth means ImageKit configuration is missing.
- Verify the private and public keys belong to the same ImageKit account.
- Confirm the browser uploads directly to ImageKit and does not send the private key.
- Check file type and size constraints in the feature UI.

## Backup and recovery

Minimum production policy:

- Automated MongoDB backups
- Defined retention
- Encryption at rest
- Quarterly restore test
- Named recovery owner
- Documented recovery time and recovery point objectives

After a restore, verify users, billboard counts, approved reservations, schedules, and impression
collection continuity.

## Post-incident

Within the incident record, capture:

- Impact and duration
- Detection method
- Root cause
- Contributing conditions
- Mitigation and recovery
- Data integrity findings
- Corrective actions with owners and due dates
- Documentation or alerting changes
