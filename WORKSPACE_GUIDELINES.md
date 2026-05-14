# WORKSPACE AI GUIDELINES: Behavior Control

This document governs how AI agents interact with the workspace and the user.

## 1. Code Generation Principles
*   **DRY (Don't Repeat Yourself):** Re-use existing components and utilities.
*   **Type Safety:** `any` is forbidden. Use specific interfaces or Generics.
*   **Pattern Adherence:** Always follow the "Modular by Feature" structure.
*   **Documentation:** Every new class must include Javadoc style comments.

## 2. Interaction Design & AI Behavior
*   **Precision:** Prioritize accuracy over speed. Verify every architectural decision against `DOCUMENTACION_ARQUITECTURA.md`.
*   **Standards:** Ensure all backend responses follow the `ApiResponse` schema.
*   **Separation of Concerns:** Business logic belongs in `@Service`, API contracts in `@Controller`, and data mapping in `@Repository`.
*   **Conciseness:** Only explain "Why" a change was made, not "How" the tool code works.

## 3. Conflict Resolution
*   **Truth Source:** `AGENTS.md` is the primary source of truth for project rules.
*   **Dependency Management:** Always check `pom.xml` or `package.json` before adding new libraries.

## 4. Automation & Triggers
*   **Clint Model Compliance:**
    - Prioritize precision over speed.
    - Ensure all backend responses are wrapped in `ApiResponse`.
    - Maintain strict separation between UI and Business Logic.
*   **Event-Driven Tasks:**
    - **Code Linting:** Automatic `npm run lint` on TypeScript save.
    - **Integration Checks:** Verify RabbitMQ connectivity on service startup.
    - **History Persistence:** `HISTORY.md` must be updated after every feature completion.
