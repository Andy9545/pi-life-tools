# Pi Life Tools — Final Technical Architecture v1

Status: LOCKED

Version: 1.0

---

# 1. PRODUCT

Pi Life Tools is a Pi ecosystem utility application providing practical life tools.

The product is:

- mobile-first
- multilingual
- lightweight
- local-first
- Pi-compatible
- modular

---

# 2. PRODUCT PRIORITY

Priority order:

1. Utility
2. Usability
3. Reliability
4. Mobile experience
5. Multilingual support
6. Pi integration
7. Future ecosystem capabilities

Do not reverse this priority.

---

# 3. SYSTEM ARCHITECTURE

┌─────────────────────────────────────────────┐
│                 UI Layer                    │
│ Pages / Components / Navigation / Cards    │
├─────────────────────────────────────────────┤
│               Feature Layer                 │
│ Calculators / History / Life Data Cards    │
├─────────────────────────────────────────────┤
│                Core Layer                   │
│ Calculation / Validation / i18n / Format   │
├─────────────────────────────────────────────┤
│              Platform Layer                 │
│ Pi Auth / Share / Storage / Staking        │
├─────────────────────────────────────────────┤
│                Data Layer                   │
│ Storage Service / Adapters / Schemas       │
└─────────────────────────────────────────────┘

---

# 4. REPOSITORY STRUCTURE

Recommended:

src/
├── app/
├── components/
│   ├── ui/
│   ├── calculator/
│   ├── life-card/
│   └── navigation/
│
├── features/
│   ├── calculators/
│   ├── life-data-card/
│   ├── history/
│   └── favorites/
│
├── core/
│   ├── calculations/
│   ├── validation/
│   ├── formatting/
│   ├── i18n/
│   └── constants/
│
├── platform/
│   └── pi/
│       ├── pi-client.ts
│       ├── pi-auth.ts
│       ├── pi-share.ts
│       ├── pi-storage.ts
│       ├── pi-staking.ts
│       └── capability.ts
│
├── storage/
│   ├── storage.ts
│   ├── memory-adapter.ts
│   ├── browser-adapter.ts
│   └── pi-adapter.ts
│
├── types/
└── config/

This is a target architecture.

Do not restructure the repository blindly.

Existing implementation must be inspected first.

---

# 5. CALCULATOR PIPELINE

User Input
   ↓
Input Component
   ↓
Validation
   ↓
Pure Calculation
   ↓
Result Model
   ↓
Formatter
   ↓
Result UI

Calculation logic must remain independent from Pi.

---

# 6. PURE CALCULATION

Examples:

- calculateAge(input)
- calculateLifeDays(input)
- calculateSavings(input)

A calculation function should behave conceptually as:

Input → Result

It should NOT behave as:

Input → Pi SDK
Input → Storage
Input → Network
Input → DOM

---

# 7. LIFE DATA CARD

Life Data Card is a major product capability.

Calculator Result
       ↓
Card Data Model
       ↓
Card Renderer
       ↓
Image / File
       ↓
Share

The card system must work without Pi.

---

# 8. STORAGE

Use:

StorageService

with interchangeable adapters.

Conceptually:

StorageService
      │
      ├── MemoryAdapter
      ├── BrowserAdapter
      └── PiStorageAdapter

Features must depend on StorageService rather than a specific storage mechanism.

---

# 9. PI LOCAL STORAGE

Pi Local Storage is an optional platform capability.

Current policy:

NOT GUARANTEED
NOT REQUIRED FOR MVP
NOT PERMANENT STORAGE

Use only after confirming:

- official documentation
- current API
- app whitelist status
- supported environment

If unavailable, fallback to another supported adapter.

---

# 10. PI AUTHENTICATION

Architecture:

UI
 ↓
Application Auth Service
 ↓
Pi Auth Adapter
 ↓
Pi SDK

Do not put Pi SDK calls throughout the UI.

Basic tools remain usable without authentication unless explicitly required.

---

# 11. PI SHARING

Architecture:

Life Data Card
 ↓
File
 ↓
ShareService
 ↓
Pi Share Adapter
 ↓
Pi.shareFile

Fallback:

Pi share unavailable
 ↓
Browser/Web Share or Save

The exact fallback depends on the current browser/project implementation.

The exact Pi API must be verified against current official documentation.

---

# 12. STAKING DATA

Future-only architecture:

Application
 ↓
StakingService
 ↓
Pi Staking Adapter
 ↓
Pi Staking Data API

Not required for MVP.

Do not implement economic features without explicit approval.

---

# 13. CAPABILITY DETECTION

Conceptual registry:

- authentication
- payments
- ads
- localStorage
- shareFile
- stakingData

States:

- available
- unavailable
- unknown
- requires_whitelist
- error

Optional capabilities must fail gracefully.

---

# 14. INTERNATIONALIZATION

Required:

- Traditional Chinese
- Simplified Chinese
- English

Existing additional languages may remain.

One implementation.

Multiple translations.

Do not duplicate calculators by locale.

---

# 15. DATA MODEL

Calculation history:

```typescript
interface CalculationRecord {
    id: string
    toolId: string
    createdAt: string
    input: Record<string, unknown>
    result: Record<string, unknown>
    locale: string
}
Life Data Card:
interface LifeDataCard {
    id: string
    toolId: string
    title: string
    values: Record<string, string>
    locale: string
    createdAt: string
}
The exact schema may evolve.
Do not add fields without a reason.
16. PRIVACY
Prefer local processing.
Avoid collecting unnecessary personal information.
Never store:
private keys
seed phrases
passwords
authentication secrets
17. NETWORK
Basic calculator operations should not require network access.
Network calls should exist only when actually required.
Examples:
Pi authentication
Pi platform services
future ecosystem services
Do not create a backend merely because one might be useful later.
18. PERFORMANCE
Priorities:
Fast load
Small bundle
Responsive interaction
Mobile usability
Minimal dependencies
Avoid unnecessary libraries.
19. UI
Design principles:
clean
practical
readable
mobile-first
low friction
consistent
accessible
Pi branding should support the experience, not dominate it.
20. MVP
MVP includes:
Core life tools
Multilingual UI
Pi Authentication
Local-first architecture
Life Data Cards
Share-ready architecture
Future:
Pi Local Storage
Pi native file sharing
App-specific staking data
Additional ecosystem integrations
Only implement future capabilities when explicitly approved and technically verified.
21. ROADMAP
Phase 1 Core tools
Phase 2 History / Favorites / Preferences
Phase 3 Life Data Cards
Phase 4 Pi Native Sharing
Phase 5 Pi Local Storage
Phase 6 Pi Staking Data
Phase 7 Additional Pi ecosystem capabilities
Roadmap items are not automatic implementation requests.
22. OFFICIAL SOURCE
Pi platform behavior:
https://docs.minepi.com/
Always verify current official documentation before implementing Pi-specific functionality.
23. ARCHITECTURAL LOCK
Core rule:
Pi capabilities are adapters, not the application itself.
The application must remain useful when Pi capabilities are unavailable.
24. CHANGE POLICY
This document describes the target architecture.
Do not perform a large refactor merely because the repository does not currently match every target folder.
First perform an audit.
Then identify:
Current Target Gap Risk Required change
Only then implement approved changes.
