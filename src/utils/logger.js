// Simple logger wrapper to control console output in the client
const ENABLE_LOGS = process.env.REACT_APP_VERBOSE_LOGS === "true";

export const log = (...args) => {
  if (!ENABLE_LOGS) return;
  // eslint-disable-next-line no-console
  console.log(...args);
};

export const warn = (...args) => {
  if (!ENABLE_LOGS) return;
  // eslint-disable-next-line no-console
  console.warn(...args);
};

// Always forward errors so they are visible in dev/production
export const error = (...args) => {
  // eslint-disable-next-line no-console
  console.error(...args);
};

const logger = {
  log,
  warn,
  error,
};

export default logger;
