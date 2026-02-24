/*
  [VARS] - dashboards, endpoint, extra-api, import, init, store, instanceId, events
  Usage:
    import {api as apiLocal, store as storeLocal} from "/v3/workflows/wf/www/store.mjs";
*/
// ________________________________________________________________________________
// IMPORT
// ________________________________________________________________________________
import {reactive, watch, computed} from 'vue'
import {api as notify} from "NotifyUtils"
import {getLogger} from "Logging";
import {fromBinary, tryCallLoading, fromByteArray, eventBus} from 'WsUtils'
import {store as storeMain, api as apiMain} from 'GlobalStore'
import {endpointToRouterName} from 'JsUtils'

// !# C0CKP1T_START import

// !# C0CKP1T_END import

export const instanceId = "default"
export const registry = storeMain.r[instanceId]
export const routerEndpoint = `/${instanceId}/demo`

// ________________________________________________________________________________
// LOGGING
// ________________________________________________________________________________
const LOG_HEADER = "/wf"
const logger = getLogger(LOG_HEADER)
logger.debug("[INIT]")

// ________________________________________________________________________________
// STORE
// ________________________________________________________________________________
const MAXIMUM_EVENTS = 16

export const store = reactive({
  id: LOG_HEADER,
  isLoading: false,
  isReady: true,
  currentDocs: '/v3/workflows/wf/www/docs/Introduction.md',
  homeDocs: '/v3/workflows/wf/www/docs/Introduction.md',
  endpoint: '/wf',

  theme: "dark",
  events: [],

// !# C0CKP1T_START store

// !# C0CKP1T_END store
})

// ________________________________________________________________________________
// API - PRIVATE
// ________________________________________________________________________________
function handleEvent(pkt) {
  const message = fromByteArray(pkt.bytes)
  logger.debug(`[EVENT] - ${message}`)

  const result = JSON.parse(message)
  store.events.unshift(result)

  // If the buffer exceeds the set size, remove the oldest item
  if (store.events.length > MAXIMUM_EVENTS) {
    store.events.pop()
  }
// !# C0CKP1T_START events

// !# C0CKP1T_END events
}

// ________________________________________________________________________________
// API - PUBLIC
// ________________________________________________________________________________
export const api = {
    // ________________________________________________________________________________
    // DASHBOARDS
    // ________________________________________________________________________________
    async selectDefaultDashboard() {
        logger.debug(`selectDefaultDashboard - endpoint=${store.endpoint}/homepage`)
        await registry.routeByEndpoint(`${store.endpoint}/homepage`)
    },

    // ________________________________________________________________________________
    // API: wf
    // ________________________________________________________________________________
    async shutdownById(wfId) {
      const args = ["shutdownById", wfId]
      const resp = await registry.exec(store.endpoint, args)
      logger.debug(resp)
      if (!resp.isOk) {
          notify.badDetails(`[${store.id}] - shutdownById failed`, `${resp.result}`)
          return
      }
      return resp.result // STRING
    },
    async startById(wfId) {
      const args = ["startById", wfId]
      const resp = await registry.exec(store.endpoint, args)
      logger.debug(resp)
      if (!resp.isOk) {
          notify.badDetails(`[${store.id}] - startById failed`, `${resp.result}`)
          return
      }
      return JSON.parse(resp.result) // JSON
    },

// !# C0CKP1T_START extra-api

// !# C0CKP1T_END

  // ________________________________________________________________________________
  // INIT
  // ________________________________________________________________________________
  async init() {
    logger.debug(`[INIT] - ${store.endpoint}`)
// !# C0CKP1T_START init

// !# C0CKP1T_END
  }

} // end of api

// ________________________________________________________________________________
// INIT
// ________________________________________________________________________________
async function init() {
  if (registry.state.isReady) {
    api.init()
  } else {
    setTimeout(async () => { await init() }, 1000)
  }
}
init()
