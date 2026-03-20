# Tzolkin Guest URL Convention

Use one URL per guest stay, based on check-in and check-out dates.

## Canonical format

`/tzolkin/YYYY-MM-DD-to-YYYY-MM-DD/`

Example:

`/tzolkin/2026-02-10-to-2026-02-12/`

## Create a new page

From the repository root:

```bash
scripts/create-tzolkin-page.sh 2026-03-05 2026-03-08
```

This scaffolds:

- `/tzolkin/2026-03-05-to-2026-03-08/index.html`
- `/tzolkin/2026-03-05-to-2026-03-08/images/*`

## Important

The script updates visible dates and URL slug, but Tzolkin day-sign content may still need manual review per stay.
