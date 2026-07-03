# EShop Development Instructions

## Database reset and seed

Use the following command from the backend folder to reset the local SQLite database and reload the sample seed data:

```bash
npm run reset-db
```

This will remove the existing SQLite database file and recreate it with the default seed data.

## Environment setup

- Keep local development configuration in a `.env` file when you need configurable secrets or ports.
- For this project, using a local SQLite file is sufficient for development and testing.
- If you want to inspect the database visually, DBeaver is a good option.
