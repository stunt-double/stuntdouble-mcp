---
name: check-agent-readiness
description: Check how well AI agents can find, understand and act on a website using the Stunt Double Index (agent readiness, AI visibility, checkout or support by agents), explain the score from real sessions, compare with peers, and re-score after fixes.
---

# Check agent readiness

1. **Find the site:** `search_index_domains(query)`. If it is not tracked, `request_index_score(domain)` adds it and runs the light probes in under a minute (signed-in server only; public domains only, opt-outs respected). Pass `include_agent_sessions=true` only if the person wants live agent sessions too; they may queue for later that day. In a project linked to an Index domain, pass `project_id` instead of a domain to the tools below.
2. **Read the report:** `get_index_report(domain)` gives the score out of 100, band, rank, per-category and per-provider scores, frictions and failing probe checks. A null score comes with `unscored_reason` and `unscored_note`: report that instead of a number.
3. **Explain weak spots from evidence:** take the lowest categories and providers, then `list_index_sessions(domain, category=…)` or `provider=…` to read what agents tried, their rubric evidence and frictions. Quote what they hit; do not guess causes the sessions do not show.
4. **Compare (optional):** `search_index_domains(sector=…)` for the sector leaderboard, or query named competitors, then `get_index_report` on those. Index data is public, so no access is needed.
5. **Recommend fixes:** rank by impact (heavily weighted failing checks, then frictions recurring across providers, then single-provider issues). Tie each to a failing check or session friction.
6. **Re-score after fixes ship:** `request_index_rerun(domain)` (domain owner only, once every 10 minutes, expensive, never to refresh a current report) starts fresh probes and about 24 agent sessions. Poll `list_index_sessions(domain, run_id)` until none are running, then `get_index_report(domain)` and report the change per category.

To confirm a fix on a preview before the re-run, use `verify-change`; to stop regressions, `setup-guardrails`.
