# Local project files

Paths below are relative to the approved project. Keep secrets out of these files. Preserve existing files and stable keys when updating a project.

`.stuntdouble/.gitignore`:

```gitignore
.live/
```

`.stuntdouble/stuntdouble.json`:

```json
{
  "format": "stuntdouble/1",
  "local_base_url": null,
  "headless": false,
  "model_screenshots": "on_request",
  "safety": "third_party",
  "cloud": { "workspace_id": null, "workspace_slug": null, "project_id": null }
}
```

`.stuntdouble/actors/first-time-user.json`:

```json
{
  "name": "First-time user",
  "description": "New to this product, using a desktop browser",
  "system_prompt": "Try the requested flow as a first-time user. Report confusing or missing information with evidence.",
  "knowledge": [],
  "persist_login": false,
  "cloud": { "actor_id": null }
}
```

`.stuntdouble/checklists/sign-up.json` (replace URL and checks with the confirmed test brief):

```json
{
  "name": "Sign-up",
  "actor": "first-time-user",
  "url": "http://localhost:3000",
  "instructions": "Inspect the test sign-up form and its validation. Do not create a real account.",
  "checks": [
    {
      "key": "form-visible",
      "description": "The sign-up form has a visible heading",
      "type": "pass_fail"
    },
    {
      "key": "email-label",
      "description": "The email input has a visible label",
      "type": "pass_fail"
    },
    {
      "key": "required-feedback",
      "description": "Submitting an empty form shows required-field feedback",
      "type": "pass_fail"
    }
  ],
  "pass_threshold": 100,
  "cloud": { "checklist_id": null, "check_ids": {} }
}
```

The engine creates `.stuntdouble/runs/<stamp>-<checklist>/run.json`, `activity.jsonl` and `shots/`. Never write verdicts to these generated files by hand.
