# Database: migrations vs `db push`

## Your error: `passwordResetOtp` undefined / table missing

1. **Regenerate the client** (after any `schema.prisma` change):
   ```bash
   npx prisma generate --schema=src/prisma/schema.prisma
   ```

2. **Create / update tables**  
   - **Fresh DB or CI:**  
     `npx prisma migrate deploy --schema=src/prisma/schema.prisma`  
   - **Existing DB but Prisma says “schema is not empty” (P3005):** your DB was not created only from migrations. Either [baseline](https://www.prisma.io/docs/guides/migrate/developing-and-production#baselining-a-database) or sync schema with:  
     ```bash
     npx prisma db push --schema=src/prisma/schema.prisma
     ```

3. **Seed**
   ```bash
   npm run seed
   ```

**One-liner (generate + push + seed):**
```bash
npm run generate && npx prisma db push --schema=src/prisma/schema.prisma && npm run seed
```

Or use `npm run seed:full` after migrations are aligned (see `package.json`).

## Prisma Studio

Studio needs the **same** `DATABASE_URL` and a DB that **matches** `schema.prisma`. After `db push` or `migrate deploy`, Studio should open without the `PasswordResetOtp` missing-table error.
