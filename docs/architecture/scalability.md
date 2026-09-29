# Scalability

The application tier is horizontally scalable.

Large tenants may evolve from shared infrastructure to dedicated DB/infrastructure.

Async workloads scale independently.

Analytics/reporting must not block transactional workloads.

No generic sharding in phase zero.
