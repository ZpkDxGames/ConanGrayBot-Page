# ConanGrayBot Page

Next.js 16.3.8 / React 19 / TypeScript management dashboard for ConanGrayBot Core v2. This reconstruction is not production certified. See WORK_PROGRESS.md and the coordinated Core security report.

## Development

```sh
pnpm install --frozen-lockfile
pnpm generate
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm start
```

Use Node 24 and pnpm 11.25.0. Configure `.env.example` names privately; never use NEXT_PUBLIC variables for credentials. Register the exact HTTPS `APP_ORIGIN/auth/callback` on the Discord application. OAuth requests only identity; Core verifies live staff membership and roles on every management request.

The browser receives only an identity session in a Secure, HttpOnly, SameSite cookie and calls same-origin BFF routes. Core credentials and actor signing remain server-only. Config saves are explicit and carry the expected revision. Destructive operations require confirmation; configuration editors warn before navigating with unsaved changes.

Core's OpenAPI and defaults are checked into contracts. Run `pnpm generate` after coordinated contract updates. Production CSP uses per-request nonces, so all application routes render dynamically.

Remaining work includes complete response typing, browser/runtime integration certification, paginated media/logs, provider sandbox and the remaining directive acceptance gates. Production deployment is blocked on authorized Vercel access, OAuth credentials and Core security/runtime certification.

Public source artifacts are built with `python scripts/build_source.py` from tracked allowlisted files. Validate the resulting ZIP using the coordinated Core `scripts/scan_artifact.py` with the ZIP path as its argument. `dist/SHA256SUMS` accompanies the manifest-bearing archive. Source artifact generation does not certify deployment or authorize a stable release.
