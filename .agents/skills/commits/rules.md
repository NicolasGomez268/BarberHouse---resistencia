
# Commit Rules and Precepts - mApache 

## Fundamental Principles

1. Commits must be atomic.
2. Each commit must represent a single logical change.
3. Commit history is part of the project's documentation.
4. Commits written in Spanish (Neutral)

## DO (Required Practices)

### Commit Message Rules

- Use Conventional mApache types:

- `add`: Introduce new features or functionality
- `fix`: Resolve bugs or issues in existing code
- `update`: Modify existing features or dependencies
- `deleted`: Remove features, files, or deprecated code
- `refactor`: Restructure code without changing behavior
- `revert`: Undo a previous commit
- `docs`: Update documentation, comments, or guides

### Content Rules

- Commit only relevant files.
- Ensure formatting and linting are applied.
- Ensure tests are updated when behavior changes.
- Document breaking changes in the commit footer: `BREAKING CHANGE: authentication API now requires OAuth2`

### Workflow Rules

- Stage files explicitly; avoid `git add .` unless verified.
- Run tests before committing.
- Keep commits small and reviewable.

## DO NOT (Forbidden Practices)

### Message Violations

- Vague messages: "fix", "update", "changes", "wip", "temp"
- Subject lines exceeding 72 characters

### Content Violations

- Build artifacts, secrets, tokens, passwords
- Local environment files (`.env`, `.vscode`, `.idea`)
- Logs or temporary debug files
- Unreviewed generated code unless required

### History Violations

- Rewriting shared history without authorization
- Automatic squashing of commits
- Mixing refactors with feature changes in one commit

## Quality Gates

A commit is valid only if:
- Code compiles or runs as intended
- Tests pass or are updated
- Commit message follows the defined format
- No forbidden files are included

## Commit Checklist

- [ ] Changes are logically grouped
- [ ] Message follows Conventional Commits
- [ ] No sensitive data included
- [ ] Tests updated or validated
- [ ] No unrelated files staged

