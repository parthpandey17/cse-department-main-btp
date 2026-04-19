import { sequelize } from "../src/config/database.js";

const requiredColumns = {
  users: ["id", "name", "email", "password_hash", "role"],
  events: ["id", "title", "startsAt", "dept"],
  achievements: ["id", "title", "category", "dept"],
  directory_entries: ["id", "name", "role", "dept"],
  info_blocks: ["id", "key", "title", "dept"],
  programs: ["id", "name", "level", "dept", "display_order"],
  curriculum_semesters: ["id", "section_id", "semester_number"],
  curriculum_courses: ["id", "semester_id", "course_name", "credits"],
};

try {
  const queryInterface = sequelize.getQueryInterface();
  await sequelize.authenticate();
  console.log("Database connection OK");

  const tables = (await queryInterface.showAllTables()).map((table) =>
    table.toString(),
  );

  let hasMissingItems = false;

  for (const [table, columns] of Object.entries(requiredColumns)) {
    if (!tables.includes(table)) {
      console.log(`Missing table: ${table}`);
      hasMissingItems = true;
      continue;
    }

    const description = await queryInterface.describeTable(table);
    const missingColumns = columns.filter((column) => !description[column]);
    if (missingColumns.length) {
      console.log(`Missing columns in ${table}: ${missingColumns.join(", ")}`);
      hasMissingItems = true;
    }
  }

  if (!hasMissingItems) console.log("Required tables and columns look OK");
  await sequelize.close();
  process.exit(hasMissingItems ? 1 : 0);
} catch (error) {
  console.error("Database check failed:", error);
  await sequelize.close().catch(() => {});
  process.exit(1);
}
