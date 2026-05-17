# Get started with the kit

The starter prompt for step 3 of the Getting Started flow in the README, after you've downloaded the kit and before you move to Claude Design.

## Before you open your LLM

Spend 5 minutes playing with the kit in your browser so you know what the LLM is working with:

1. Open `template/index.html` in Chrome.
2. Drag a component. Resize it. Click a title to edit it.
3. Open the Tweaks Panel (left rail) and toggle grid, snap, dimensions.
4. Save a view. Drag something. Save another. Switch between them.
5. Once you've found a starting layout you like, click `(save current as default)`.

This is what you can change without code. The LLM handles everything deeper (brand colours, content, new chart types).

## Then open your LLM

Open the kit in Claude Code, Cowork, Codex, ChatGPT (with file access), or any tool that can read this repo's files.

Paste this as your first message:

```
I'm using the Dashboard Design System kit you have access to. I want to tailor it to my own project.

Before we start, please:

1. Read this repo's `README.md` for the kit overview.
2. Read `template/README.md` for the kit's component layout.
3. Read `template/dashboard.css` `:root` block for the design tokens.
4. Read `template/index.html` to see how components are wired.

Then walk me through a checkpoint-driven adaptation. Use this structure:

**Checkpoint 1: Brief.** Ask me what I want to build — domain, audience, brand, dashboards I admire, any data or screenshots I have. Help me brain-dump. Summarise what you understood at the end and confirm with me before moving on.

**Checkpoint 2: Plan.** Based on the brief, propose a tailoring plan. Which tokens swap, which components stay or change, which charts map to the four built-in types, and which need new code. Get my sign-off before executing.

**Checkpoint 3: Execute.** Work through the plan one change at a time. Show me each change, wait for sign-off, then move to the next. Use the kit's existing CSS tokens — don't invent new ones unless I tell you to.

**Checkpoint 4: Handoff to Claude Design.** Once the kit is tailored, help me move into Claude Design. Don't follow these in order — pick what's useful given where I am:

- **If I haven't seen Claude Design yet:** tell me to watch Nate Herk's Claude Design masterclass (linked in this repo's README) and read the official setup docs at https://support.claude.com/en/articles/14604416-get-started-with-claude-design.
- **Summarise the changes:** list which files I've changed in CP1-CP3.
- **Prep the setup form** for Claude > Design > Create new design system:
  - **Company name and blurb:** propose a one-sentence summary based on the brief from CP1.
  - **Code source (pick one):**
    - **Link code on GitHub** — paste the repo URL if I've pushed my fork.
    - **Link code from your computer** — drag the kit folder if I haven't pushed yet.
  - **Upload a .fig file:** skip (the kit doesn't ship one).
  - **Add fonts, logos and assets:** list which files in `assets/` and `template/` I should attach.
  - **Any other notes:** draft a short paragraph summarising the design tokens, brand voice, and any constraints from the brief — I'll paste it.

Brain dump to kick off Checkpoint 1:

[Type what you want to build. A few sentences is enough. Example: "I'm a marketing analyst at a SaaS company. I want a dashboard showing campaign performance — spend, CTR, conversions, ROAS by channel. Brand is teal and white, font is Inter. I'll share two reference dashboards I like in the next message."]
```

## What happens next

The LLM works through the four checkpoints with you. Brain dump, plan, execute, handoff. You stay in the driver's seat: it asks before changing anything, and you can redirect at any checkpoint.

Once Checkpoint 4 lands, move to Claude Design (step 4 of the README's Getting Started) for the visual finish. Named views travel with you, so keep saving them as you iterate.
