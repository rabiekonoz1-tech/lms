# Tenancy

Control DB + one Tenant DB per tenant.

Tenant resolution is server-side and trusted.

Business code never chooses a database from arbitrary client input.

Tenant provisioning:

Registry -> Allocate DB -> Initialize -> Migrate -> Configure -> Ready

Tenant isolation is required across application, auth, DB, cache, queue, storage, logs and reporting.
