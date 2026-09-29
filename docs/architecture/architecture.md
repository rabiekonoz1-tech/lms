# Architecture

Approved baseline: Modular Monolith + Control Plane / Tenant Data Plane + Clean/Hexagonal-style boundaries.

Core layers:

Presentation -> Application -> Domain -> Infrastructure

Core principles:

- feature/domain-oriented modules
- composition over unnecessary inheritance
- provider abstraction
- Strategy where behavior is interchangeable
- Adapter for external providers
- State pattern for lifecycle-heavy objects
- Policy-based authorization
- Domain events
- outbox-style reliability where needed
- repositories intentionally, not mechanically
- thin controllers/pages
- no circular module dependencies
- no direct provider calls from domain
