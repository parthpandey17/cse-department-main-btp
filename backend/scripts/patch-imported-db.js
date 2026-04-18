import bcrypt from "bcrypt";
import { DataTypes } from "sequelize";
import { sequelize } from "../src/config/database.js";

const deptTables = [
  "sliders",
  "people",
  "programs",
  "news",
  "events",
  "achievements",
  "newsletters",
  "directory_entries",
  "info_blocks",
  "research",
  "facilities",
  "opportunity_blocks",
];

const requiredProgramColumns = {
  short_name: { type: DataTypes.STRING(20), allowNull: true },
  overview: { type: DataTypes.TEXT, allowNull: true },
  duration: { type: DataTypes.STRING(50), allowNull: true },
  total_credits: { type: DataTypes.INTEGER, allowNull: true },
  display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
};

const tableExists = async (queryInterface, table) => {
  const tables = await queryInterface.showAllTables();
  return tables.map((name) => name.toString()).includes(table);
};

const ensureColumn = async (queryInterface, table, column, definition) => {
  if (!(await tableExists(queryInterface, table))) return;
  const columns = await queryInterface.describeTable(table);
  if (!columns[column]) {
    await queryInterface.addColumn(table, column, definition);
    console.log(`Added ${table}.${column}`);
  }
};

const ensureUsersTable = async (queryInterface) => {
  if (await tableExists(queryInterface, "users")) return;

  await queryInterface.createTable("users", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("admin"), defaultValue: "admin" },
    createdAt: { type: DataTypes.DATE, allowNull: false },
    updatedAt: { type: DataTypes.DATE, allowNull: false },
  });
  console.log("Created users table");
};

const ensureAdminUser = async (queryInterface) => {
  const email = process.env.ADMIN_EMAIL || "admin@lnmiit.ac.in";
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.log("Skipped admin user: set ADMIN_PASSWORD in .env to create one");
    return;
  }

  const [rows] = await sequelize.query("SELECT id FROM users WHERE email = ?", {
    replacements: [email],
  });

  if (rows.length) {
    console.log(`Admin user already exists: ${email}`);
    return;
  }

  const now = new Date();
  await queryInterface.bulkInsert("users", [
    {
      name: process.env.ADMIN_NAME || "Admin",
      email,
      password_hash: await bcrypt.hash(password, 12),
      role: "admin",
      createdAt: now,
      updatedAt: now,
    },
  ]);
  console.log(`Created admin user: ${email}`);
};

try {
  const queryInterface = sequelize.getQueryInterface();
  await sequelize.authenticate();

  await ensureUsersTable(queryInterface);
  await ensureAdminUser(queryInterface);

  for (const table of deptTables) {
    await ensureColumn(queryInterface, table, "dept", {
      type: DataTypes.ENUM("cse", "cce", "me", "ece"),
      allowNull: false,
      defaultValue: "cse",
    });
  }

  await ensureColumn(queryInterface, "achievements", "category", {
    type: DataTypes.ENUM("student", "faculty"),
    allowNull: false,
    defaultValue: "student",
  });

  for (const [column, definition] of Object.entries(requiredProgramColumns)) {
    await ensureColumn(queryInterface, "programs", column, definition);
  }

  console.log("Imported database patch completed");
  await sequelize.close();
} catch (error) {
  console.error("Imported database patch failed:", error);
  await sequelize.close().catch(() => {});
  process.exit(1);
}
