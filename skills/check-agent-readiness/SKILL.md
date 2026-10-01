---
name: check-agent-readiness
description: Check how well AI agents (ChatGPT, Claude, Gemini, Perplexity and others) can find, understand and act on a website using the Stunt Double Index, explain the score from real agent sessions, compare against peers, and re-score after fixes.
---

# Check agent readiness

## When to use

- Someone asks how agent-ready, AI-visible or "agent-friendly" a site is, or whether an AI agent could check out, get support or find a product there
- A team wants to know why agents struggle on their site, and what to fix first
- A site has shipped changes meant to help agents (structured data, llms.txt, accessible checkout, fewer bot walls) and needs re-scoring
- You want to benchmark a site against competitors or its sector

## Instructions

1. **Find the site:**

   - `search_index_domains(query)` with part of the domain or name. If it is not tracked, say so: anyone can add it at index.stuntdouble.io.
   - If the user works in a Stunt Double project linked to an Index domain, pass `project_id` to the tools below instead of a domain.

2. **Read the report:**

   - `get_index_report(domain)` returns the overall score out of 100, its band and rank, per-category scores (brand awareness, discovery, information retrieval, market ranking, accuracy, checkout, delegated access, support), per-provider scores, the frictions agents hit and the failing probe checks.
   - A null score comes with `unscored_reason` and `unscored_note` (checks blocked or unanswered, or the site opted out). Report that reason instead of a number.

3. **Explain the weak spots from evidence:**

   - Pick the lowest categories and providers, then `list_index_sessions(domain, category=…)` or `provider=…` to read the sessions behind them: what the agent tried, its rubric evidence, a summary and its frictions.
   - Quote what agents actually ran into. Do not guess at causes the sessions do not show.

4. **Compare (optional):**

   - `search_index_domains(sector=…)` for the sector leaderboard, or query named competitors, then `get_index_report` on the ones worth contrasting.

5. **Recommend fixes:**

   - Rank by impact: failing probe checks with high weight first, then frictions that recur across providers, then single-provider issues.
   - Tie every recommendation to a failing check or a session friction.

6. **Re-score after fixes ship:**
   - `request_index_rerun(domain)` starts fresh probes and about 24 agent sessions. Only the domain's owner can call it (a platform admin, whoever claimed it, or, while unclaimed, someone signed in with a work email on that domain), and a domain can be re-run once every 10 minutes.
   - Poll `list_index_sessions(domain, run_id)` about every 60 seconds until no session is running, then `get_index_report(domain)` and report the change per category.

## Example flow

```
search_index_domains(query="acme")
get_index_report(domain="acme.com")                    # 54/100, checkout 21, support 38
list_index_sessions(domain="acme.com", category="checkout")
search_index_domains(sector="ecommerce", limit=10)     # where acme sits among peers

# after the fixes ship
request_index_rerun(domain="acme.com")                 # returns run_id
list_index_sessions(domain="acme.com", run_id="…")     # poll until finished
get_index_report(domain="acme.com")                    # compare with the earlier score
```

## Example output

```
acme.com: 54/100 (rank 212, ecommerce)

Weakest: Checkout 21, Support 38
- Checkout: 5 of 6 providers stalled at the cookie wall before the cart (sessions: claude, openai, gemini…)
- Support: no help content reachable without JavaScript; failing check "support page server-rendered" (weight 3)

Fix first
1. Let the cart load behind the consent banner (affects every provider)
2. Server-render /help and link it from the footer
3. Add Product structured data on PDPs (failing check, weight 2)
```

## Tips

- **Index data is public.** The read tools work on any tracked site, so competitor comparisons need no access.
- **Re-runs are expensive.** Only re-run after a change has shipped, never to refresh a report that is already current.
- **Pair with checklists.** Once a fix is chosen, `verify-change` can confirm it on a preview before the re-run, and `setup-guardrails` keeps it from regressing.
