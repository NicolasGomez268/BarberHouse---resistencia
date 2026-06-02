# Documentation Rules

## Scope
These rules define how project documentation must be created, updated, and validated by AI agents and human contributors.

## Authority Hierarchy
1. Source code is the primary source of truth
2. Configuration files override documentation
3. Documentation must reflect actual runtime behavior

## Mandatory Sections
All technical documentation must follow this structure:

1. Title
2. Overview
3. Responsibilities
4. Implementation Details
5. Configuration
6. Limitations
7. References

## Content Rules
- Use Markdown format
- Use technical and neutral language
- Prefer bullet points over paragraphs
- Avoid speculative statements
- Do not describe unimplemented features
- Include file paths and directory trees when relevant

## Change Management
- Document breaking changes explicitly
- Keep diffs minimal and scoped
- Update related documentation files when dependencies change
- Preserve historical context in memory/decisions.md when architecture changes

## Code Representation
- Use fenced code blocks with language identifiers
- Reflect real code patterns and project conventions
- Avoid pseudocode unless explicitly requested

## Naming Conventions
- camelCase for variables and functions
- PascalCase for components, classes, and types
- kebab-case for file names unless project convention differs

## Validation Checklist
Before finalizing documentation:
- Confirm alignment with repository structure
- Verify environment variables and configuration names
- Ensure API routes match actual backend implementation
- Confirm folder structure matches project tree

## Forbidden Actions
- No fictional APIs, features, or modules
- No rewriting existing documentation without explicit request
- No tone changes unless requested
- No summarization that removes technical details
