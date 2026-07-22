# Workspace Rules & AI Agent Guidelines

## 1. Architectural & Code Quality Standards
- **Modular & Clean Architecture:** Keep code clean, reusable, and single-purpose. Follow SOLID principles.
- **Strict Type Safety:** Use explicit typing in TypeScript, Python, and backend services. Avoid `any` or untyped dynamic objects.
- **API & Data Validation:** Always validate inputs and schemas at service boundaries (Zod/Pydantic). Handle edge cases, empty states, and errors explicitly.

## 2. UI/UX & Design Excellence (UI/UX Pro Max)
- **Design Skill Suite:** Enforce UI/UX Pro Max guidelines under `.agents/skills/ui-ux-pro-max`.
- **Modern Styling:** Use curated HSL color palettes, modern Google Fonts (Inter/Roboto/Outfit), responsive layouts, smooth CSS micro-interactions, and glassmorphism/dark mode aesthetics.

## 3. Systematic Debugging & Testing
- **Log-Driven Diagnosis:** Inspect complete error tracebacks before making edits. Do not attempt blind fixes or mask errors.
- **Runtime Verification:** Always verify code changes by running build checks or test suites after completing edits.
