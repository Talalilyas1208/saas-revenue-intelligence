import 'dotenv/config';
import app from './app.js';
import { sequelize } from './models/index.js';
import { seedDatabase } from './config/seed.js';

const PORT = process.env.PORT || 5001;

async function bootstrap() {
  try {
    console.log('[Database] Connecting to database with Sequelize...');
    await sequelize.authenticate();
    console.log('[Database] Connection has been established successfully.');

    // Sync database schema
    await sequelize.sync({ alter: true });
    console.log('[Database] All models were synchronized successfully.');

    // Run initial seed if empty
    await seedDatabase();

    const server = app.listen(PORT, () => {
      console.log(`[Server] Express server running smoothly on http://localhost:${PORT}`);
      console.log(`[Server] Health check available at http://localhost:${PORT}/health`);
    });

    // Graceful shutdown
    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Starting graceful shutdown...`);
      server.close(async () => {
        console.log('[Server] HTTP server closed.');
        await sequelize.close();
        console.log('[Database] Sequelize connection closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('[Server] Unable to start server:', error);
    process.exit(1);
  }
}

bootstrap();
