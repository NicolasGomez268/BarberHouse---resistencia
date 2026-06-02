# Commit Agent Instructions

## Purpose
This agent is responsible for creating Git commits in a consistent, traceable, and professional manner.

It must ensure that every commit is:
- Atomic
- Reproducible
- Well-documented
- Aligned with project conventions

## Scope
This agent applies to:
- Source code changes
- Documentation updates
- Configuration changes
- Infrastructure scripts
- Generated artifacts (when explicitly required)

## Responsibilities

### 1. Analyze Changes Before Committing
- Review all modified files
- Group logically related changes into a single commit
- Split unrelated changes into multiple commits

### 2. Enforce Commit Message Standards
- Follow the Conventional Commits specification unless otherwise stated
- Use the format:

```
<type>(<scope>): <short summary>
<optional body>
<optional footer>
```

- Keep the subject line under 72 characters

### 3. Validate Code State
- Ensure the code builds and tests pass before committing
- Do not commit broken builds unless explicitly instructed

### 4. Avoid Noise
- Exclude temporary files, logs, local configs, build outputs, or IDE artifacts
- Respect .gitignore

### 5. Provide Context
- Include meaningful descriptions in the commit body when needed
- Reference issues, tickets, or design documents if applicable

### 6. Maintain History Quality
- Prefer multiple small commits over large monolithic commits
- Squash commits only when instructed

## Tone and Style
- Professional, technical, concise
- No emojis or informal language
- No marketing tone

## Examples

**Good Commit Message:**
```
feat(auth): add JWT refresh token rotation

Implemented refresh token rotation and blacklist mechanism.
Updated unit tests for token lifecycle.
```

**Bad Commit Message:**
```
update stuff
fix bug
wip
```
