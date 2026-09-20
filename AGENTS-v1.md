# Pi Life Tools — AGENTS v1

## PROJECT STATUS

This is the root-level development contract for Pi Life Tools.

These rules apply to all development work in this repository.

Pi Life Tools is a Pi ecosystem utility application.

This project is completely separate from:

- PailHub.com
- AI Life Tools
- Cloudflare calculator projects
- Salalune
- Unknown Life
- Forty & Beyond
- unrelated repositories or products

NEVER merge code, architecture, branding, assets, deployment configuration, product requirements, or business logic from those projects into Pi Life Tools.

---

# 1. CORE PRODUCT PRINCIPLE

Pi Life Tools is:

> A useful life-tools application that integrates with the Pi ecosystem.

It is NOT:

> A Pi feature showcase that happens to contain calculators.

Core utility always comes first.

Pi capabilities are modular integrations.

---

# 2. DEVELOPMENT PRINCIPLE

Build the smallest correct implementation that satisfies the explicit request.

Do NOT:

- invent requirements
- expand scope
- redesign unrelated features
- rewrite working architecture unnecessarily
- replace libraries without a concrete reason
- add speculative features
- add speculative backend infrastructure
- invent Pi APIs
- guess undocumented behavior

If something is unclear:

ASK or STOP.

Do not silently assume.

---

# 3. OFFICIAL PI SOURCE OF TRUTH

For Pi platform behavior, use the current official Pi Developer Documentation:

https://docs.minepi.com/

The official documentation is authoritative for:

- Pi SDK
- Authentication
- Payments
- Ads
- Sandbox
- Mainnet
- Native Features
- Local Storage
- Pi.shareFile
- Staking Data
- Wallet behavior
- permissions
- platform capabilities

Do not rely on old tutorials or community examples when current official documentation provides the information.

---

# 4. PI CAPABILITIES ARE OPTIONAL

The existence of a Pi capability does NOT mean this app is automatically eligible to use it.

Some capabilities may require:

- whitelist access
- specific environment
- specific app configuration
- specific SDK version

Never assume eligibility.

The application must remain functional when optional Pi capabilities are unavailable.

---

# 5. LOCAL-FIRST PRINCIPLE

Core calculator functionality should work locally whenever possible.

The application must not require:

- Pi authentication
- backend server
- database
- Pi Local Storage
- Pi native features

just to perform a basic calculation.

---

# 6. STORAGE PRINCIPLE

Application features must use a storage abstraction.

Conceptually:

Feature
  ↓
StorageService
  ↓
StorageAdapter

Possible adapters:

- Memory
- Browser
- Pi Local Storage
- Future backend

Features must NOT directly depend on:

- window.localStorage
- window.sessionStorage
- Pi storage APIs

Pi Local Storage must be treated as an optional capability.

It must NOT be treated as guaranteed permanent storage.

---

# 7. LIFE DATA CARD PRINCIPLE

Life Data Card is a strategic product feature.

Architecture:

Calculator Result
       ↓
Result Model
       ↓
Life Data Card
       ↓
Image / File
       ↓
Share

The Life Data Card renderer must not depend directly on Pi.

Pi sharing is a platform adapter.

---

# 8. PI SHARE PRINCIPLE

Pi native file sharing is optional.

Before implementing Pi.shareFile:

1. Verify the current official documentation.
2. Verify the exact API.
3. Verify supported file types.
4. Verify supported environment.
5. Implement fallback behavior.

Never invent:

- function signatures
- parameters
- return values
- permissions

---

# 9. STAKING PRINCIPLE

App-specific staking data is a future capability.

It is NOT an MVP requirement.

Do not create:

- staking rewards
- VIP levels
- staking multipliers
- rankings
- economic benefits

unless explicitly requested and supported by verified product requirements.

---

# 10. AUTHENTICATION PRINCIPLE

Pi Authentication must be isolated inside the Pi platform layer.

Basic calculator features should remain usable without authentication unless a feature explicitly requires identity.

Do not force users to authenticate simply because Pi Authentication exists.

---

# 11. CALCULATOR PRINCIPLE

Calculator logic must be pure.

Calculation functions must not:

- call Pi SDK
- access storage
- access sessionStorage
- access localStorage
- access browser APIs
- access network
- mutate global state
- depend on UI

Preferred:

Input
 ↓
Validation
 ↓
Pure Calculation
 ↓
Result
 ↓
Formatting
 ↓
UI

---

# 12. INTERNATIONALIZATION

Minimum supported languages:

- Traditional Chinese
- Simplified Chinese
- English

Existing additional language support must not be removed without explicit approval.

All user-facing strings must be translatable.

Never hard-code user-facing strings inside calculation logic.

---

# 13. SECURITY

Never store or commit:

- private keys
- wallet seed phrases
- passwords
- API secrets
- private credentials
- production secrets

Do not expose sensitive information in:

- URLs
- source code
- local storage
- client-side configuration
- Git history

---

# 14. ENVIRONMENTS

Keep these environments clearly separated:

Development
Sandbox
Production / Mainnet

Never:

- mix Sandbox and Mainnet configuration
- use production credentials for development
- expose production secrets
- commit environment secrets

---

# 15. DEPENDENCY RULE

Do not add a dependency unless necessary.

Before adding a package:

1. Check whether the repository already provides equivalent functionality.
2. Check whether native browser APIs are sufficient.
3. Consider bundle size and maintenance cost.
4. Add the smallest reasonable dependency only when justified.

---

# 16. FILE MODIFICATION RULE

Modify only files required for the requested task.

Do NOT:

- mass-format unrelated files
- rename unrelated files
- refactor unrelated components
- upgrade dependencies without reason
- change deployment configuration unnecessarily
- delete code merely because it appears unused

---

# 17. SCOPE BOUNDARY

Currently approved product areas:

- Life calculators
- Multilingual interface
- Pi Authentication
- Local-first storage architecture
- Life Data Cards
- Share architecture
- Future Pi capability adapters

Not automatically approved:

- Marketplace
- Social network
- NFT
- token economy
- staking rewards
- PvP
- chat
- complex backend
- wallet management
- unrelated gamification

Do not implement these without explicit approval.

---

# 18. NO INVENTION RULE

This is a HARD RULE.

Do not invent:

- Pi API names
- Pi SDK methods
- API parameters
- API return values
- whitelist status
- platform behavior
- product rules
- business rules
- economic rules
- user flows
- database architecture

If the information is unavailable:

STOP.

---

# 19. AUDIT BEFORE REFACTOR

When a major architecture change is requested:

First:

Inspect
 ↓
Audit
 ↓
Report differences
 ↓
Wait for approval
 ↓
Modify

Do not automatically perform a large refactor immediately after reading architecture documentation.

---

# 20. VALIDATION

After meaningful changes, run the available project checks:

- lint
- typecheck
- tests
- build

If no test script exists:

Do not invent one merely to satisfy this rule.

Report that the test script is unavailable.

---

# 21. COMPLETION RULE

A task is complete only when:

- requested change is implemented
- relevant files are inspected
- available validation passes
- no unrelated changes were introduced
- no undocumented Pi assumptions remain

---

# 22. STOP RULE

After completing the requested task and validation:

STOP.

Do not continue with:

- extra refactoring
- visual redesign
- dependency upgrades
- speculative optimization
- new features
- unrelated cleanup

unless explicitly requested.

---

# 23. REQUIRED FINAL REPORT

Use:

## Completed

- Changes:
- Files modified:

## Validation

- Lint:
- Typecheck:
- Tests:
- Build:

## Pi Integration

- Official documentation checked:
- Capability:
- Availability / whitelist:
- Fallback:

## Notes

- Known limitations:
- Future work requiring approval:

## Status

COMPLETE

If blocked:

## BLOCKED

Reason:
...

Official documentation checked:
...

Missing information:
...

Required decision:
...

Never claim COMPLETE when blocked.

---

# 24. FINAL LOCKED PRINCIPLE

Pi Life Tools must remain:

> A useful life-tools application that happens to integrate deeply with Pi.

Core utility comes first.

Pi capabilities are modular.

Do not reverse these priorities.
