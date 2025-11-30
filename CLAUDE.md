# CLAUDE.md - AI Assistant Guide for Cloudecode

This document provides comprehensive guidance for AI assistants working with the Cloudecode repository.

## Repository Overview

**Repository**: Cloudecode
**Owner**: strazzusochr
**Purpose**: [To be updated as project evolves]

This is a new repository. As the codebase develops, this document will be updated with specific architectural details, patterns, and conventions.

---

## Table of Contents

1. [Codebase Structure](#codebase-structure)
2. [Development Workflow](#development-workflow)
3. [Git Conventions](#git-conventions)
4. [Code Standards](#code-standards)
5. [AI Assistant Guidelines](#ai-assistant-guidelines)
6. [Testing Strategy](#testing-strategy)
7. [Common Tasks](#common-tasks)

---

## Codebase Structure

### Directory Organization

```
Cloudecode/
├── .git/                 # Git repository data
└── CLAUDE.md            # This file - AI assistant guide
```

**Note**: As the project grows, update this section with:
- Source code directories
- Configuration file locations
- Build output directories
- Test directories
- Documentation structure

### Key Files

- **CLAUDE.md** (this file): AI assistant development guide
- Additional key files will be documented as they are added

---

## Development Workflow

### Branch Strategy

**Feature Branches**: Use the pattern `claude/claude-md-{identifier}-{session-id}`
- All AI-assisted development happens on dedicated Claude branches
- Branch naming follows the format provided at session start
- Always develop on the specified branch, never push to other branches without permission

**Current Working Branch**: `claude/claude-md-mimasve88ls63fh8-01CCjfyqobmrmZ35y5J4ety3`

### Development Process

1. **Understand the Request**: Read and analyze the task carefully
2. **Explore the Codebase**: Use appropriate tools to understand existing code
3. **Plan the Changes**: Use TodoWrite tool to plan multi-step tasks
4. **Implement**: Make focused, minimal changes
5. **Test**: Verify changes work as expected
6. **Commit**: Create clear, descriptive commits
7. **Push**: Push to the designated Claude branch

---

## Git Conventions

### Commit Messages

Follow these principles:
- **First line**: Concise summary (50 chars or less)
- **Body**: Explain the "why" not the "what" (when needed)
- **Format**: Use conventional commit style when appropriate
  ```
  feat: add new feature
  fix: resolve bug in component
  docs: update documentation
  refactor: improve code structure
  test: add or update tests
  chore: maintenance tasks
  ```

### Git Operations Best Practices

**Pushing Changes**:
```bash
git push -u origin <branch-name>
```
- CRITICAL: Branch must start with 'claude/' and end with matching session ID
- Retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s) on network errors
- Never force push to main/master branches

**Fetching/Pulling**:
```bash
git fetch origin <branch-name>
git pull origin <branch-name>
```
- Prefer specific branch fetches over fetching all branches
- Retry with exponential backoff on network failures

**Pre-commit Safety**:
- Never update git config without explicit permission
- Never run destructive operations (force push, hard reset) unless requested
- Never skip hooks (--no-verify) unless explicitly requested
- Check authorship before amending commits
- Never commit files with secrets (.env, credentials.json, etc.)

---

## Code Standards

### General Principles

1. **Minimal Changes**: Only modify what's necessary for the task
2. **No Over-Engineering**: Avoid adding unrequested features or "improvements"
3. **Security First**: Prevent OWASP top 10 vulnerabilities
   - No command injection
   - No XSS vulnerabilities
   - No SQL injection
   - Proper input validation at system boundaries
4. **Simple Solutions**: Three similar lines > premature abstraction
5. **Clean Deletions**: Remove unused code completely, no backwards-compatibility hacks

### Code Quality

- **Read Before Modifying**: Always read existing code before making changes
- **Consistent Style**: Match existing code patterns and formatting
- **Comments**: Only add where logic isn't self-evident
- **Error Handling**: Only validate at system boundaries (user input, external APIs)
- **No Hypotheticals**: Don't design for future requirements that don't exist

---

## AI Assistant Guidelines

### Tool Usage Policy

**Preferred Tools**:
- **Read**: For reading files (not cat/head/tail)
- **Edit**: For modifying files (not sed/awk)
- **Write**: For creating files (not echo/heredoc)
- **Grep**: For content search (not grep/rg commands)
- **Glob**: For file pattern matching (not find/ls)
- **Task**: For complex multi-step operations or codebase exploration

**Exploration**:
- Use `Task` tool with `subagent_type=Explore` for broad codebase questions
- Use direct tools (Grep, Glob, Read) only for specific, targeted queries
- Run independent tool calls in parallel when possible

### Communication Style

- **Concise**: Brief, focused responses
- **No Emojis**: Unless explicitly requested
- **Markdown**: Use GitHub-flavored markdown for formatting
- **Direct Output**: Never use bash echo or comments to communicate with users
- **Code References**: Include `file_path:line_number` when referencing code

### Task Management

**Use TodoWrite for**:
- Tasks with 3+ steps
- Complex, non-trivial tasks
- User-provided task lists
- Planning implementations

**Todo States**:
- `pending`: Not started
- `in_progress`: Currently working (only ONE at a time)
- `completed`: Finished successfully

**Todo Requirements**:
- Mark todos completed immediately after finishing
- Only ONE task in_progress at a time
- Only mark completed when fully accomplished (tests passing, no errors)
- Remove tasks that are no longer relevant

### Security Testing Context

Assist with:
- Authorized security testing
- Defensive security measures
- CTF challenges
- Educational security contexts

Refuse:
- Destructive techniques
- DoS attacks
- Mass targeting
- Supply chain compromise
- Detection evasion for malicious purposes

---

## Testing Strategy

### Test Organization

[To be updated as testing framework is established]

### Running Tests

[To be updated with specific test commands]

### Test Coverage Goals

[To be updated with coverage requirements]

---

## Common Tasks

### Adding New Features

1. Read and understand related existing code
2. Plan the implementation using TodoWrite
3. Implement minimal necessary changes
4. Test the feature works
5. Commit with clear message
6. Push to Claude branch

### Fixing Bugs

1. Reproduce and understand the bug
2. Identify root cause
3. Fix the specific issue (no scope creep)
4. Verify the fix works
5. Commit and push

### Refactoring

1. Only refactor when explicitly requested
2. Maintain existing functionality
3. Keep changes focused and minimal
4. Ensure all tests still pass
5. Commit and push

### Code Review

1. Read the code thoroughly
2. Check for security vulnerabilities
3. Verify code follows project conventions
4. Ensure no over-engineering
5. Validate tests are adequate

---

## Project Evolution

This document will be updated as the project grows. Key updates to make:

- [ ] Add technology stack details (languages, frameworks, tools)
- [ ] Document API conventions and patterns
- [ ] Add database schema and migration strategy
- [ ] Document deployment process
- [ ] Add troubleshooting guide
- [ ] Include performance considerations
- [ ] Document external dependencies
- [ ] Add environment setup instructions

---

## Quick Reference

### File Operations
```bash
# Read a file
Use Read tool with file_path

# Edit a file
Use Edit tool with old_string and new_string

# Create a file
Use Write tool with file_path and content
```

### Git Operations
```bash
# Check status
git status

# Commit changes
git add .
git commit -m "commit message"

# Push to Claude branch
git push -u origin claude/claude-md-mimasve88ls63fh8-01CCjfyqobmrmZ35y5J4ety3
```

### Search Operations
```bash
# Find files by pattern
Use Glob tool with pattern

# Search file contents
Use Grep tool with pattern

# Explore codebase
Use Task tool with subagent_type=Explore
```

---

## Notes for Future Updates

As the codebase develops, ensure this document includes:

1. **Architecture Decisions**: Document key architectural choices and rationale
2. **API Patterns**: Standardized approaches for API design
3. **Database Patterns**: Schema conventions, migration practices
4. **Error Handling**: Consistent error handling approaches
5. **Logging**: Logging standards and practices
6. **Configuration**: How configuration is managed
7. **Dependencies**: How to add/update dependencies
8. **Build Process**: Build and deployment procedures

---

**Last Updated**: 2025-11-30
**Version**: 1.0.0 (Initial creation)
