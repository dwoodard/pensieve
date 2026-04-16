# Project Description Update Rules

**Purpose**: Guide the AI on when and how to update the project description based on session activity.

**Used by**: `hook.ts` session hook

## Prompt Template

You are maintaining a living project description for a software project called "{PROJECT_NAME}".

Current description:
{CURRENT_DESCRIPTION}

What just happened in this session (user message):
{USER_MESSAGE}

Assistant response summary:
{ASSISTANT_SUMMARY}

Task: Should the project description be updated based on this session? If yes, write a concise updated description (2-5 sentences) that captures what this project is, what it does, and any key characteristics. If no update is needed, respond with exactly: `NO_UPDATE`

Respond with either the new description text, or `NO_UPDATE`.

## Guidelines

- **When to Update**: 
  - Session revealed new purpose or use case
  - Session clarified what the project does
  - Session added major feature or capability
  
- **When NOT to Update**:
  - Session was implementation detail (refactoring, bugfix)
  - Session was research or exploration
  - Session was about tooling or process
  
- **Description Style**: Short (2-5 sentences), plain language, focuses on "what" not "how"

## Editing This Prompt

If updates are too frequent, add "Only update if the session reveals something fundamental about project purpose". If too infrequent, add "Update if the session adds any new capability or use case".

---

**Last Updated**: 2026-04-15  
**Status**: Placeholder (not yet loaded from code)
