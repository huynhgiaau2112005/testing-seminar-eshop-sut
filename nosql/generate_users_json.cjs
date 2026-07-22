const fs = require("node:fs");
const path = require("node:path");
const { faker } = require("@faker-js/faker");

const outputPath = path.join(__dirname, "users.json");
const userCount = 5;

// Make the lab output reproducible while keeping all PII synthetic.
faker.seed(20260722);

const users = Array.from({ length: userCount }, (_, index) => ({
  sourceUserId: index + 1,
  name: faker.person.fullName(),
  email: faker.internet.email({ provider: "example.test" }).toLowerCase(),
  phone: `09${faker.string.numeric(8)}`,
  role: index === 0 ? "admin" : "user",
  createdAt: "2026-07-22T00:00:00.000Z",
  masked: false,
}));

fs.writeFileSync(outputPath, `${JSON.stringify(users, null, 2)}\n`);
console.log(`Generated ${users.length} synthetic users: ${outputPath}`);
