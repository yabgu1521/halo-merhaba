# Database operations

See DATABASE_SCHEMA.md for the proposed normalized schema and access boundaries. No database is connected yet and no migrations have been applied. Phase 2 must add migrations and execute owner/stranger/staff policy tests against a disposable database before auth/member functionality is enabled. Backups need encrypted storage, retention limits and tested restores. Production seeds must never include shared demo credentials.
