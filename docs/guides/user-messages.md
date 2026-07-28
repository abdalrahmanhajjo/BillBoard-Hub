# User message guidelines

User-facing messages must help someone understand what happened and what to do next. This applies
to client states, validation contracts, API errors, authorization failures, confirmations, empty
states, and operational screens.

## Message structure

Use this order:

1. State what happened in plain language.
2. Identify the affected item when known.
3. Give one realistic recovery action.

Examples:

- `We could not load reservations. Try again.`
- `The email or password is incorrect. Check both fields and try again.`
- `This time window overlaps an existing schedule. Choose different times.`
- `Your account does not have permission to edit playlists. Contact an administrator if you need access.`

Avoid:

- `Request failed.`
- `Invalid data.`
- `Forbidden.`
- `Unknown error.`
- implementation details, stack traces, database names, or provider responses.

## Shared boundary messages

Cross-feature boundary copy lives in:

```text
src/shared/messages/user-messages.ts
```

Use it for network failures, invalid responses, expired sessions, missing records, duplicate
records, unexpected server errors, and permission recovery. Domain-specific services should still
return more precise messages when they know the affected record or business rule.

## Validation

- Name the field or choice the user must fix.
- Include a limit when enforcing one.
- Prefer an instruction such as `Enter a campaign name` over `Campaign name is required`.
- Attach field errors with `aria-describedby` when the form component supports it.
- Put cross-field errors near the related controls.

## Status and accessibility

- Dynamic errors use `role="alert"`.
- Success confirmations use `role="status"` or an `aria-live="polite"` region.
- Loading labels describe the resource or action: `Loading schedules…`, `Saving changes…`.
- Disabled submit controls retain a visible pending label.
- Color supports a message but never carries its meaning alone.

## Empty states

Explain why the area is empty and provide the next valid action:

- first-use state: tell the user what to create;
- filtered state: suggest clearing filters or changing the search;
- dependency state: identify the required prerequisite, such as a digital billboard or approved
  creative.

## Confirmations

Destructive confirmations name the item, state the consequence, and say when the action cannot be
undone. Replace native browser confirmation dialogs with the shared accessible dialog component
when that primitive is added to the design system.

## API safety

Controllers return safe, user-ready fallback text. Unexpected server errors are logged on the
server, but internal exception details are not sent to the browser. Known `HttpError` messages may
be returned because services construct them for users.

Update this guide and `src/shared/messages/user-messages.ts` when adding a new global message
pattern.
