/**
 * Sets up crash guards and graceful shutdown handling for the HTTP server and database pool.
 *
 * @param {import('http').Server} server - Node HTTP server instance
 * @param {import('pg').Pool} pool - PostgreSQL pool instance
 */
const setupProcessGuards = (server, pool) => {
  let isShuttingDown = false;

  const shutdown = async (signal) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log(`\n[SHUTDOWN] Received ${signal}. Gracefully closing HTTP server and database pools...`);

    // Force terminate after 10s if graceful shutdown hangs
    const forceExitTimeout = setTimeout(() => {
      console.error('[SHUTDOWN] Forced termination after timeout.');
      process.exit(1);
    }, 10000);
    forceExitTimeout.unref();

    if (server && server.close) {
      server.close(async () => {
        console.log('[SHUTDOWN] HTTP server closed.');
        try {
          if (pool && pool.end) {
            await pool.end();
            console.log('[SHUTDOWN] Database pool drained.');
          }
          process.exit(0);
        } catch (err) {
          console.error('[SHUTDOWN ERROR] Error while draining database pool:', err);
          process.exit(1);
        }
      });
    } else {
      try {
        if (pool && pool.end) {
          await pool.end();
        }
        process.exit(0);
      } catch (err) {
        process.exit(1);
      }
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('unhandledRejection', (reason, promise) => {
    console.error('[FATAL] Unhandled Promise Rejection at:', promise, 'reason:', reason);
  });

  process.on('uncaughtException', (err) => {
    console.error('[FATAL] Uncaught Exception:', err);
    shutdown('uncaughtException');
  });
};

module.exports = setupProcessGuards;
