## 2024-05-04 - [Rate Limit IP Spoofing & Memory Exhaustion DoS + Info Disclosure]
**Vulnerability:** Found multiple vulnerabilities in `/api/scan/route.ts`:
1. The rate limit logic trusted `x-forwarded-for` before `request.ip`, allowing trivial IP spoofing bypasses.
2. The in-memory Map `scanAttempts` was never cleared, enabling an attacker to infinitely increase server memory by sending requests with random spoofed IPs, resulting in an Out of Memory (OOM) crash (DoS).
3. The raw database `error.message` was returned to the client on RPC failure, leaking database internals.
**Learning:** Always prioritize secure sources for IP addresses like `request.ip` over spoofable headers. When implementing in-memory structures for rate limiting, always put a hard limit on the collection size to prevent OOM attacks. Never return raw database/internal error strings to the client.
**Prevention:**
- Use `request.ip` primarily and fallback to headers only if necessary.
- Limit Map size with `if (scanAttempts.size > MAX_MAP_SIZE) { scanAttempts.clear(); }`.
- Return generic error messages on internal failures.
