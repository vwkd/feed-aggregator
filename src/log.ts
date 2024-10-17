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

const logAdd = createLogger("add");
const logClean = createLogger("clean");
const logRead = createLogger("read");
const logRoot = createLogger("root");
const logToJSON = createLogger("toJSON");
const logWrite = createLogger("write");
log.rebuild();

export { log, logAdd, logClean, logRead, logRoot, logToJSON, logWrite };
