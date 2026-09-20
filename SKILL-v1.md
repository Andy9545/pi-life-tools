# Pi Life Tools — OpenCode SKILL v1

## PURPOSE

This skill defines how OpenCode should inspect, modify, test, and report changes in Pi Life Tools.

Before architecture-related work, read:

- AGENTS-v1.md
- SKILL-v1.md
- docs/ARCHITECTURE-v1.md

These documents define the current project rules and architecture.

---

# 1. FIRST ACTION

Before modifying code:

Inspect the current repository.

At minimum inspect:

- package.json
- src/
- public/
- AGENTS-v1.md
- SKILL-v1.md
- docs/
- README.md

Do not assume files exist.

Do not assume the framework.

Do not assume the current implementation.

---

# 2. EXISTING CODE FIRST

When implementing a feature:

1. Find the existing implementation pattern.
2. Reuse it when appropriate.
3. Follow existing project conventions.
4. Modify the smallest required surface.

Do not introduce a second competing architecture for the same problem.

---

# 3. PI DOCUMENTATION

Current official Pi Developer Documentation:

https://docs.minepi.com/

Before implementing any Pi-specific API, verify the current official documentation.

This includes:

- Pi SDK
- Authentication
- Payments
- Ads
- Native Features
- Local Storage
- Pi.shareFile
- Staking Data
- Sandbox
- Mainnet

---

# 4. DOCUMENTATION FAILURE

If the official documentation cannot verify the requested API:

STOP.

Do not guess.

Report:

## BLOCKED

The requested Pi behavior could not be verified from current official Pi documentation.

I will not invent the API.

Wait for further instruction.

---

# 5. PI SDK ISOLATION

All Pi-specific code belongs under:

src/platform/pi/

Conceptual structure:

src/platform/pi/
├── pi-client.ts
├── pi-auth.ts
├── pi-share.ts
├── pi-storage.ts
├── pi-staking.ts
└── capability.ts

Use the repository's actual conventions if they differ.

Do not create duplicate Pi wrappers.

---

# 6. CALCULATOR ISOLATION

Calculator logic belongs in the calculation/core layer.

Examples:

- calculateAge()
- calculateLifeDays()
- calculateSavings()

Calculation functions must be pure.

They must not call:

- Pi SDK
- Storage
- Network
- DOM
- Browser APIs

---

# 7. STORAGE

Use a storage abstraction.

Conceptually:

interface StorageAdapter {
    get<T>(key: string): Promise<T | null>
    set<T>(key: string, value: T): Promise<void>
    remove(key: string): Promise<void>
}

The exact project implementation may differ.

Do not force this exact interface if the existing project already has a better compatible abstraction.

---

# 8. PI LOCAL STORAGE

Pi Local Storage is optional.

Never assume:

Pi Local Storage = available

Capability detection is required.

Conceptually:

Capability
   ↓
Available?
   ├── yes → Pi adapter
   └── no  → fallback adapter

Do not treat Pi Local Storage as permanent cloud storage.

Do not use it as the only copy of important data.

---

# 9. SHARE

Life Data Card generation must remain platform-independent.

Preferred architecture:

Result
 ↓
LifeDataCard
 ↓
File
 ↓
ShareService
 ↓
Pi Adapter

Do not put Pi SDK calls into:

- calculator components
- card rendering code
- generic UI components

---

# 10. PI.SHAREFILE

Before implementing:

1. Check official documentation.
2. Confirm exact method.
3. Confirm parameters.
4. Confirm supported environment.
5. Confirm error behavior.

Never guess.

If unavailable, implement a fallback.

Possible fallback concept:

Pi share unavailable
 ↓
Web Share / Save / Download

Use only APIs actually supported by the current project and browser environment.

---

# 11. STAKING DATA

Do not implement staking features unless explicitly requested.

If requested:

Verify documentation
 ↓
Verify app eligibility
 ↓
Create adapter
 ↓
Add unavailable state
 ↓
Test both states

Do not create economic assumptions.

---

# 12. AUTHENTICATION

Authentication must be isolated.

The UI should communicate with an application-level auth service rather than directly calling Pi SDK authentication.

Basic tools should remain usable without login unless explicitly required.

---

# 13. CAPABILITY REGISTRY

Pi capabilities should be represented conceptually as:

- authentication
- payments
- ads
- localStorage
- shareFile
- stakingData

Possible states:

- available
- unavailable
- unknown
- requires_whitelist
- error

Do not hard-code "available" simply because the SDK exists.

---

# 14. INTERNATIONALIZATION

Required:

- zh-TW
- zh-CN
- en

Preserve existing supported locales.

Use translation keys.

Do not duplicate business logic per language.

Use locale-aware formatting for:

- numbers
- dates
- currencies
- units

---

# 15. LIFE DATA CARD

Life Data Card should be deterministic from the result model.

Example:

Calculator
 ↓
Result
 ↓
Card data
 ↓
Renderer
 ↓
File

The renderer must not require:

- Pi authentication
- Pi storage
- Pi SDK
- backend

---

# 16. MOBILE-FIRST

Every feature must work on mobile.

Check:

- touch targets
- input usability
- keyboard behavior
- viewport
- responsive layout
- readable text
- result visibility
- share flow

Do not optimize only for desktop.

---

# 17. ERROR HANDLING

Handle optional Pi capability failures gracefully.

Examples:

- not supported
- not whitelisted
- permission denied
- cancelled
- network error
- SDK error

Do not crash the core calculator.

---

# 18. DEPENDENCIES

Do not add dependencies casually.

Before installing:

1. Inspect package.json.
2. Search existing utilities.
3. Check native API possibility.
4. Evaluate bundle impact.

If unnecessary:

Do not install.

---

# 19. CHANGE CONTROL

Before large modifications:

Produce an audit.

Format:

## Current State

...

## Target State

...

## Differences

...

## Required Changes

...

## Risks

...

## Recommendation

...

Do not automatically execute the entire plan unless explicitly instructed.

---

# 20. NO SILENT REFACTORING

If a task says:

> Add X

do not automatically:

- rewrite Y
- redesign Z
- migrate the framework
- replace dependencies
- rename components
- restructure the entire project

unless necessary to implement X correctly.

---

# 21. VALIDATION

Run available checks after implementation.

Preferred commands, only when they exist:

- npm run lint
- npm run typecheck
- npm test
- npm run build

Only run commands that actually exist in package.json.

If a command does not exist:

Report:

Not available in current project.

Do not fabricate test commands.

---

# 22. BUILD FAILURE

If a build fails:

1. Read the actual error.
2. Identify the smallest cause.
3. Fix that cause.
4. Run the build again.

Do not perform unrelated refactoring.

---

# 23. TESTING PI CAPABILITIES

For each optional Pi capability test conceptually:

Capability available
Capability unavailable

The unavailable state must not destroy the application.

---

# 24. SECURITY

Never commit:

- API keys
- private keys
- wallet seeds
- passwords
- production secrets

Do not expose credentials in client code.

---

# 25. GIT / CHANGE HYGIENE

Before finishing:

Check changed files.

Do not leave accidental changes.

Do not modify generated files unless required.

Do not commit unrelated cleanup.

---

# 26. FINAL REPORT

Use:

## Completed

### Changes

- ...

### Files

- ...

## Validation

- Lint:
- Typecheck:
- Tests:
- Build:

## Pi

- Official docs checked:
- Capability:
- Whitelist:
- Fallback:

## Notes

- ...

## Status

COMPLETE

---

# 27. BLOCKED REPORT

If information is missing:

## BLOCKED

### Reason

...

### Official documentation checked

...

### What cannot be verified

...

### Required decision

...

Do not guess.

---

# 28. STOP

After:

implementation
+
validation
+
final report

STOP.

No unsolicited work.
