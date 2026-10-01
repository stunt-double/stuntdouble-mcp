---
name: check-agent-readiness
description: Reads a website's Stunt Double Index report to explain how well AI agents (ChatGPT, Claude, Gemini, Perplexity and others) can find, understand and act on it, traces weak scores to real agent sessions, compares it with competitors or its sector, and re-scores after fixes ship. Use when the user asks about agent readiness, AI visibility, "agent-friendly" sites, whether an AI agent can check out, get support or find a product on a site, an Index score or rank, llms.txt or structured data impact, or wants to benchmark a site against competitors.
---

# Check agent readiness

Tools are on the `stuntdouble` MCP server and are named bare below: `get_index_report` is `stuntdouble:get_index_report` (in Claude Code, `mcp__stuntdouble__get_index_report`). Every tool returns an object; list results sit under a plural key.

Index data is public: the read tools work on any tracked site, so competitor comparisons need no access.

## Workflow

```
Task progress:
- [ ] Step 1: Find the site
- [ ] Step 2: Read the report
- [ ] Step 3: Explain the weakest categories from sessions
- [ ] Step 4: Compare with peers (if asked)
- [ ] Step 5: Recommend fixes
- [ ] Step 6: Re-score after fixes ship (if asked)
```

1. **Find the site.** `search_index_domains(query)` with part of the domain or name. If it is not tracked, say so: anyone can add it at index.stuntdouble.io. If the user works in a Stunt Double project linked to an Index domain, pass `project_id` instead of `domain` to the tools below.

2. **Read the report.** `get_index_report(domain)` gives the overall score out of 100, band, rank, per-category scores (brand awareness, discovery, information retrieval, market ranking, accuracy, checkout, delegated access, support), per-provider scores, frictions and failing probe checks. A null score comes with `unscored_reason` and `unscored_note` (checks blocked or unanswered, or the site opted out): report that reason instead of a number.

3. **Explain the weak spots from evidence.** Take the two or three lowest categories or providers and call `list_index_sessions(domain, category=…)` or `provider=…`. Each session is one provider attempting one task, with rubric evidence, a summary and frictions. Quote what agents ran into; do not guess at causes the sessions do not show.

4. **Compare (if asked).** `search_index_domains(sector=…)` for the sector leaderboard, or query named competitors, then `get_index_report` on the ones worth contrasting.

5. **Recommend fixes.** Rank by impact: high-weight failing probe checks first, then frictions that recur across providers, then single-provider issues. Tie every recommendation to a failing check or a session friction.

6. **Re-score after fixes ship.**
   - `request_index_rerun(domain)` starts fresh probes and about 24 agent sessions and returns a `run_id`. Only the domain's owner can call it (a platform admin, whoever claimed it, or, while unclaimed, someone signed in with a work email on that domain), and a domain can be re-run once every 10 minutes. If it is refused, relay the returned `message` rather than retrying.
   - Poll `list_index_sessions(domain, run_id)` about every 60 seconds until no session is running. If sessions are still running after 30 minutes, stop and tell the user to check back; do not start another re-run.
   - Then `get_index_report(domain)` and report the change per category against the earlier score.

## Example flow

```
search_index_domains(query="acme")
get_index_report(domain="acme.com")                    # 54/100, checkout 21, support 38
list_index_sessions(domain="acme.com", category="checkout")
search_index_domains(sector="ecommerce", limit=10)     # where acme sits among peers

# after the fixes ship
request_index_rerun(domain="acme.com")                 # gives run_id
list_index_sessions(domain="acme.com", run_id="…")     # poll until no session is running
get_index_report(domain="acme.com")                    # compare with the earlier score
```

## Report template

```
acme.com: 54/100 (rank 212, ecommerce)

Weakest: Checkout 21, Support 38
- Checkout: 5 of 6 providers stalled at the cookie wall before the cart (sessions: claude, openai, gemini)
- Support: no help content reachable without JavaScript; failing check "support page server-rendered" (weight 3)

Fix first
1. Let the cart load behind the consent banner (affects every provider)
2. Server-render /help and link it from the footer
3. Add Product structured data on product pages (failing check, weight 2)
```

## Gotchas

- **Re-runs are expensive.** Only re-run after a change has shipped, never to refresh a report that is already current.
- **Pair with checklists.** Once a fix is chosen, `verify-change` can confirm it on a preview before the re-run, and `setup-guardrails` keeps it from regressing.
