import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dialect = (process.env.DB_DIALECT as any) || 'sqlite';

export const sequelize = new Sequelize({
  dialect: dialect,
  storage: process.env.DB_STORAGE || 'database.sqlite',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  logging: false,
  define: {
    underscored: true,
    timestamps: true,
  },
});

export async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully.');
    // Sync models in dev mode
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log('Database synced.');
    }
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}
