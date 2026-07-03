const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');

function slugify(value) {
  return (value || 'user')
    .toString()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 24) || 'user';
}

function makeMaskedEmail(user) {
  const base = slugify(user.name || 'user');
  return `${base}-${user.id}@example.test`;
}

function makeMaskedPhone(user) {
  const suffix = String(10000000 + Number(user.id)).slice(-8);
  return `09${suffix}`;
}

function openDatabase() {
  return new sqlite3.Database(dbPath);
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

async function maskSensitiveData() {
  const db = openDatabase();

  try {
    const users = await all(
      db,
      'SELECT id, name, email, phone FROM users ORDER BY id',
    );

    if (users.length === 0) {
      console.log('No users found. Nothing to mask.');
      return { maskedCount: 0 };
    }

    await run(db, 'BEGIN TRANSACTION');

    for (const user of users) {
      const maskedEmail = makeMaskedEmail(user);
      const maskedPhone = makeMaskedPhone(user);

      await run(
        db,
        'UPDATE users SET email = ?, phone = ? WHERE id = ?',
        [maskedEmail, maskedPhone, user.id],
      );
    }

    await run(db, 'COMMIT');

    console.log(`Masked ${users.length} user row(s) in ${dbPath}`);
    console.log('Sample masked values:');
    users.slice(0, 3).forEach((user) => {
      console.log(
        `- #${user.id}: ${user.email || '(empty)'} -> ${makeMaskedEmail(user)}, ${user.phone || '(empty)'} -> ${makeMaskedPhone(user)}`,
      );
    });

    return { maskedCount: users.length };
  } catch (error) {
    try {
      await run(db, 'ROLLBACK');
    } catch (rollbackError) {
      console.error('Rollback failed:', rollbackError.message);
    }
    throw error;
  } finally {
    db.close();
  }
}

if (require.main === module) {
  maskSensitiveData().catch((error) => {
    console.error('Failed to mask sensitive data:', error.message);
    process.exitCode = 1;
  });
}

module.exports = {
  maskSensitiveData,
  makeMaskedEmail,
  makeMaskedPhone,
};