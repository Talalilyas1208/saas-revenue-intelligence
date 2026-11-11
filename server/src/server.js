import 'dotenv/config';
import app from './app.js';
import { sequelize } from './models/index.js';

const PORT = process.env.PORT || 5001;

async function bootstrap() {
  try {
    console.log(`[Database] Connecting to ${sequelize.getDialect()} database with Sequelize...`);
    await sequelize.authenticate();
    console.log('[Database] Connection established successfully.');

    await sequelize.sync();
    console.log('[Database] All models synchronized successfully.');

    const server = app.listen(PORT, () => {
      console.log(`[Server] RevTerm production server running on http://localhost:${PORT}`);
      console.log(`[Server] Health check available at http://localhost:${PORT}/health`);
    });

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
