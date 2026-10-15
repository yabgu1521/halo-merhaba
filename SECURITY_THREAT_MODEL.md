# Security threat model

Assets: account credentials, DOB, messages, photos, customer documents, order/payment references, staff privileges.
Trust boundaries: browser → Next server → Supabase Auth/Postgres/Storage; provider → webhook; staff → scoped tools; uploads → quarantine/scanner → authorized delivery.

| Threat | Required mitigation and release evidence |
| --- | --- |
| Minors or fake identity | DOB age enforcement, adult affirmation, reports and human moderation; email/photo status never guarantees identity |
| Account takeover/brute force | Managed auth, email verification, rate limits with shared backing store, staff MFA, secure session cookies, reset/redirect allowlist tests |
| IDOR/data leaks | Server identity checks plus deny-default RLS; adversarial owner/stranger/blocked/suspended/staff tests |
| Injection/XSS | Parameterized queries, schema validation, React escaping, sanitized allowed rich text, CSP; no arbitrary HTML rendering |
| CSRF | Origin validation on mutations, same-site cookies, no GET mutations; provider webhooks separately signed |
| Malicious upload | Service-only uploads, bounded size/type, signature detection, sanitized random keys, quarantine and scanner, short signed access; no SVG/HTML/executables |
| Webhook spoof/replay | Raw-body signature verification, timestamp tolerance, event idempotency, amount/currency/order checks; paid only from verified provider |
| Staff abuse | Least privilege, assignments, audit reasons, immutable logs, no client-side role grants |
| Harassment/scams | Block enforcement on all interaction paths, reports queue, suspension, moderation response process |
| Privacy/retention | Minimize data, no GPS, private DOB/progression, no content in logs, documented deletion/backups policy |

Open risks: provider selection, regional privacy advice, malware scanner, incident response staffing, retention and legal hold policy. Fail closed when these controls are absent. Automated tests cannot prove legal compliance or guarantee member intentions.

## Member phase implementation and remaining evidence
Source now implements schema validation, origin enforcement, managed HttpOnly sessions, safe projections, deny-default database privileges/RLS, transaction-locked matching/blocks, bounded photo decoding and private byte delivery. Unit/browser tests cover local validation and unconfigured auth behavior. Real database authorization, live signup/verification/reset, and member-session browser tests are authored but unrun because the Supabase runtime could not be started. These are unresolved required validation gates. Production CAPTCHA/ingress limits, CSP review, moderator staffing, legal copy, deliverability and infrastructure retention remain deployment responsibilities; this phase does not claim comprehensive launch security.
