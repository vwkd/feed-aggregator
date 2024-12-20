import log from "loglevel";

log.setDefaultLevel("warn");

/**
 * Create logger with name as prefix
 *
 * @param name logger name
 * @returns logger
 */
export function createLogger(name: string): log.Logger {
  const logger = log.getLogger(name);

  const originalFactory = logger.methodFactory;

  logger.methodFactory = function (methodName, logLevel, loggerName) {
    const originalMethod = originalFactory(methodName, logLevel, loggerName);

    return function (...message) {
      originalMethod(`[${name}]`, ...message);
    };
  };

  return logger;
}

const logRoot = createLogger("root");
const logRead = createLogger("read");
const logWrite = createLogger("write");
const logClean = createLogger("clean");
const logAdd = createLogger("add");
const logToJSON = createLogger("toJSON");
log.rebuild();

export { log, logAdd, logClean, logRead, logRoot, logToJSON, logWrite };
