# WORKSPACE AI GUIDELINES: Behavior Control

This document governs how AI agents interact with the workspace and the user.

## 1. Code Generation Principles
*   **DRY (Don't Repeat Yourself):** Re-use existing components and utilities.
*   **Type Safety:** `any` is forbidden. Use specific interfaces or Generics.
*   **Pattern Adherence:** Always follow the "Modular by Feature" structure.
*   **Documentation:** Every new class must include Javadoc style comments.

## 2. Interaction Design
*   **Conciseness:** Do not explain obvious code. Only explain architectural decisions.
*   **Proactivity:** If a task suggests a missing dependency, install it immediately.
*   **Verification:** Always run `lint_applet` after creating or editing files.

## 3. Conflict Resolution
*   **Truth Source:** `AGENTS.md` is the primary source of truth for project rules.
*   **Dependency Management:** Always check `pom.xml` or `package.json` before adding new libraries.

## 4. Model Context
*   **Clint Model Behavior:** (Reference to the user-specified "modelo de clint")
    - Prioritize precision over speed.
    - Ensure all backend responses are wrapped in `ApiResponse`.
    - Maintain strict separation between UI and Business Logic.
