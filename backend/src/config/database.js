import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const useSsl =
  process.env.DB_SSL === "true" ||
  (process.env.DB_HOST && process.env.DB_HOST !== "localhost");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    dialect: "mysql",
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    dialectOptions: useSsl
      ? {
          ssl: {
            rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === "true",
          },
        }
      : {},

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },
);

export { sequelize };
export default sequelize;
