# Bug Report Sheet - End-to-End User Journey Testing

Date: 2026-05-14
Project: NexaBlog (Next.js + Prisma + NextAuth)


## Test Coverage Summary
- User registration: Tested
- Login: Tested
- Search: Tested
- Logout / session handling: Tested
- Session expiry (invalid/expired-like token redirect behavior): Tested partially
- Order placement: Blocked (feature not implemented)
- Payment flow: Blocked (feature not implemented)
- Notification delivery behavior: Blocked for backend delivery (only in-app toasts exist)

## Bug List

### BR-001 - Duplicate registration race returns 500 instead of 409
- Severity: High
- Priority: P1
- Category: Duplicate creation, incorrect error handling
- Preconditions: App running, database reachable
- Steps to reproduce:
1. Send two concurrent `POST /api/auth/register` requests with the same email.
2. Compare both responses.
- Expected result:
1. First request succeeds (`201`).
2. Second request is rejected with `409` and a clear duplicate-email message.
- Actual result:
1. One request succeeds (`201`).
2. Second request fails with `500` and `{"error":"Unable to register user"}`.
- Evidence:
1. `qa_e2e_compact.txt` shows `RACE_STATUSES:201,500`.
2. Code path does `findUnique` then `create` and falls into generic catch on race: [route.ts](C:/Users/KIIT0001/Desktop/blog Website/app/api/auth/register/route.ts:15), [route.ts](C:/Users/KIIT0001/Desktop/blog Website/app/api/auth/register/route.ts:34), [route.ts](C:/Users/KIIT0001/Desktop/blog Website/app/api/auth/register/route.ts:51).

### BR-002 - Callback URL drops query parameters on auth redirect
- Severity: Medium
- Priority: P2
- Category: Data/state loss after auth redirect
- Preconditions: User not logged in
- Steps to reproduce:
1. Open `/profile?tab=settings` while logged out.
2. Observe redirect location.
- Expected result:
1. Redirect should preserve full URL in callback (including query string), e.g. `/login?callbackUrl=%2Fprofile%3Ftab%3Dsettings`.
- Actual result:
1. Redirect is `/login?callbackUrl=%2Fprofile` (query is dropped).
- Evidence:
1. `qa_e2e_compact.txt` shows `PROFILE_HEAD_LOCATION: location: /login?callbackUrl=%2Fprofile`.
2. Middleware stores only `pathname`: [middleware.ts](C:/Users/KIIT0001/Desktop/blog Website/middleware.ts:9), [middleware.ts](C:/Users/KIIT0001/Desktop/blog Website/middleware.ts:13).

### BR-003 - Signup error toast can display non-user-friendly object text
- Severity: Medium
- Priority: P2
- Category: Incorrect error messages
- Preconditions: Signup validation fails and API returns structured `fieldErrors`
- Steps to reproduce:
1. Open signup form.
2. Submit invalid values (e.g., short password, bad email).
- Expected result:
1. User sees readable validation messages (field-level or summarized text).
- Actual result:
1. UI passes raw object payload into toast, which can render as non-readable text like `[object Object]`.
- Evidence:
1. API returns object-shaped `error` for validation failures.
2. UI uses `toast.error(payload?.error || ...)` directly: [signup-form.tsx](C:/Users/KIIT0001/Desktop/blog Website/components/auth/signup-form.tsx:30).

### BR-004 - Signup can show success and redirect even if auto-login fails
- Severity: High
- Priority: P1
- Category: Notification behavior, auth failure handling
- Preconditions: Registration succeeds, but credentials sign-in fails (auth service/network issue)
- Steps to reproduce:
1. Submit valid signup form.
2. Force sign-in failure after registration (e.g., transient auth endpoint failure).
3. Observe UI behavior.
- Expected result:
1. If auto-login fails, show failure message and keep user on auth flow.
- Actual result:
1. Code proceeds to success toast and redirect without validating `signIn` result.
- Evidence:
1. `signIn` response is not checked before `toast.success` + navigation: [signup-form.tsx](C:/Users/KIIT0001/Desktop/blog Website/components/auth/signup-form.tsx:34), [signup-form.tsx](C:/Users/KIIT0001/Desktop/blog Website/components/auth/signup-form.tsx:40).

### BR-005 - Network-loss handling is weak in auth forms
- Severity: Medium
- Priority: P2
- Category: Network loss behavior
- Preconditions: Login/signup attempted while API/auth endpoint is unreachable
- Steps to reproduce:
1. Open login or signup.
2. Simulate network/API outage during submit.
3. Observe UI feedback.
- Expected result:
1. Clear fallback error toast and stable UI state.
- Actual result:
1. Submit flows lack explicit `try/catch` around async request blocks; network exceptions may surface as unhandled errors with inconsistent user feedback.
- Evidence:
1. No explicit catch around login/sign-up submit transitions: [login-form.tsx](C:/Users/KIIT0001/Desktop/blog Website/components/auth/login-form.tsx:19), [signup-form.tsx](C:/Users/KIIT0001/Desktop/blog Website/components/auth/signup-form.tsx:20).

### BR-006 - Required order/payment/notification-delivery flows are missing
- Severity: Critical
- Priority: P0
- Category: Missing required functionality / blocked test coverage
- Preconditions: None
- Steps to reproduce:
1. Search codebase and routes for order/payment/checkout/cart/notification modules.
2. Attempt to locate user journey entry points.
- Expected result:
1. Implemented flows for order placement, payment, and notification delivery behavior.
- Actual result:
1. No order/payment domain routes or models are present.
2. Notification implementation is limited to local toast UI, not delivery workflow.
- Evidence:
1. No route/model matches for those domains via repo search.
2. Notification tooling present only as `sonner` toaster usage: [providers.tsx](C:/Users/KIIT0001/Desktop/blog Website/components/providers/providers.tsx:5), [providers.tsx](C:/Users/KIIT0001/Desktop/blog Website/components/providers/providers.tsx:15).

## Additional Observations (Non-Bug Outcomes)
- Successful registration observed (`201`).
- Login session creation verified (`SESSION_EMAIL_AFTER_LOGIN` set).
- Logout clears session (`SESSION_AFTER_LOGOUT:null`).
- Search behaves as designed for short query (`[]`) and valid query (`>=1 result`).
- Invalid session-token cookie is redirected to login (`307`), which is correct baseline protection.
