// ________________________________________________________________________________
// Logging.mjs
// ________________________________________________________________________________
import Constants from '../Constants.mjs'

// Note: localStorage is global in browser environment object
// Note: window.log is provided by loglevel library (imported globally in index.html)
// https://github.com/kutuluk/loglevel-plugin-prefix

const loggerPrefixFn = (level, name, timestamp) => `[${name}]`;
const prefixer = prefix.noConflict();
prefixer.reg(log);
prefixer.apply(log, { format: loggerPrefixFn });

const localStorageKey = "loggers"

const loggers = { ...Constants.defaultLoggerLevels }

// https://www.npmjs.com/package/loglevel
export function getLogger(location) {
  const logger = log.getLogger(location)
  if(loggers.hasOwnProperty(location)) {
    logger.setLevel(loggers[location])
  } else {
    logger.setLevel(Constants.defaultLogLevel)
    loggers[location] = Constants.defaultLogLevel
  }
  return logger
}

export function setLogger(location, level) {
  const logger = log.getLogger(location)
  logger.setLevel(level)
  loggers[location] = level


  localStorage.setItem(localStorageKey, JSON.stringify(loggers));
}

export function listLoggers() {
  return loggers
}

export function clearLocalStorage() {
  localStorage.removeItem(localStorageKey)
}

function init() {
  const json = localStorage.getItem(localStorageKey)
  // Object.assign(loggers, JSON.parse(json));
}

log.info (`[INIT]`)
init()
// log.trace(`[INIT] - trace - enabled`)
// log.debug(`[INIT] - debug - enabled`)
// log.error(`[INIT] - error - enabled`)
// log.warn( `[INIT] - warn - enabled`)

