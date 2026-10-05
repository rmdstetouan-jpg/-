# Security Specification for MIDAD AMDS

## 1. Data Invariants
1. Organization document (`/organization/amds`) holds the single source of truth for the institutional branding. Modification is restricted to `SUPER_ADMIN` and `SECRETARY_GENERAL` (including bootstrapped email `rmdstetouan@gmail.com`).
2. Activity documents require valid identifiers, required core fields (`title`, `status`, `date`, `city`, `createdBy`), and must never overwrite `createdAt` or `createdBy`.
3. Audit log documents are immutable write-once records (`allow delete: if false`, `allow update: if false`).
4. Users cannot arbitrarily escalate their own privileges or modify immutable credentials without proper authorization.

## 2. The Dirty Dozen Payloads (Targeting Rejection)
1. **Ghost Field Poisoning**: Injected field `isAdmin: true` into Activity payload. -> *Must be rejected by validation schema*.
2. **Unverified Email Spoofing**: Attempt to impersonate `rmdstetouan@gmail.com` without `email_verified == true`. -> *Rejected*.
3. **ID Injection Attack**: Passing 2KB string as `activityId`. -> *Blocked by isValidId()*.
4. **Timestamp Manipulation**: Client providing forged `createdAt` in the future. -> *Rejected (must match request.time)*.
5. **Direct Status Shortcutting**: Modifying an archived activity without permission. -> *Rejected*.
6. **Immutable Field Tampering**: Modifying `createdBy` during update. -> *Rejected*.
7. **Blanket List Scraping**: Non-authenticated user listing organization records. -> *Rejected*.
8. **Audit Log Erasure**: Client attempting to delete an audit trail document. -> *Blocked by allow delete: if false*.
9. **Audit Log Rewriting**: Client attempting to alter an existing audit log. -> *Blocked by allow update: if false*.
10. **Excessive String Payload Attack**: Activity description exceeding 50,000 characters. -> *Blocked by size checks*.
11. **PII Harvesting**: Accessing private user records without ownership or admin role. -> *Blocked*.
12. **Role Self-Promotion**: Standard user modifying their own role to SUPER_ADMIN. -> *Blocked*.
