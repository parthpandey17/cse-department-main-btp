import { DataTypes } from "sequelize";

export const up = async (queryInterface) => {
  await queryInterface.sequelize.query(`
    ALTER TABLE users
    MODIFY role ENUM('super_admin', 'admin', 'faculty') NOT NULL DEFAULT 'admin'
  `);

  await queryInterface.addColumn("users", "must_change_password", {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  });

  await queryInterface.addColumn("people", "user_id", {
    type: DataTypes.INTEGER,
    allowNull: true,
    unique: true,
    references: {
      model: "users",
      key: "id",
    },
    onUpdate: "CASCADE",
    onDelete: "SET NULL",
  });
};

export const down = async (queryInterface) => {
  await queryInterface.removeColumn("people", "user_id");
  await queryInterface.removeColumn("users", "must_change_password");

  await queryInterface.sequelize.query(`
    ALTER TABLE users
    MODIFY role ENUM('admin') NOT NULL DEFAULT 'admin'
  `);
};
