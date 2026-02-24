<script setup>
/*
    page-fallback.vue
*/

//________________________________________________________________________________
// IMPORTS
//________________________________________________________________________________
import {reactive, onMounted, defineAsyncComponent, watch, computed} from 'vue'
import {store as storeMain, api as apiMain } from 'GlobalStore'
import {useRoute, useRouter, NavigationFailureType} from 'vue-router'
import {getLogger} from "Logging";
import {api as notify} from "NotifyUtils"
import {substrAfterFirstSlash, substrWithoutLeadingSlash} from "JsUtils";
import {parentPath} from "JsUtils";

// ________________________________________________________________________________
// LOGGING
// ________________________________________________________________________________
const LOG_HEADER = "page-404.vue"
const logger = getLogger(LOG_HEADER)
logger.debug("[INIT]")

const route = useRoute()
const router = useRouter()
//________________________________________________________________________________
// STATE
//________________________________________________________________________________
const local = reactive({
  id: LOG_HEADER,
  isLoading: false,
  isResolving: false,
  route: null,

  noRegistryFound: false,
  resolved: null
})

const instanceId = computed(() => {
  return substrAfterFirstSlash(router.currentRoute.value.fullPath)
})
//________________________________________________________________________________
// INIT
//________________________________________________________________________________
async function init() {
  // 4 = aborted
  // 8 = cancelled
  // 16  = duplicated
  local.isResolving = true
  if (storeMain.isReady) {
    await waitForRouteAndReplace(substrWithoutLeadingSlash(route.fullPath));
    local.isResolving = false
    return
  }
  setTimeout(async () => {
    init()
  }, 1000)
}

async function waitForRouteAndReplace(fullPath) {
  const instanceId = substrAfterFirstSlash(fullPath)
  logger.debug(`instanceId=${instanceId}`)

  const resolved = router.resolve(fullPath);
  local.resolved = JSON.parse(JSON.stringify(resolved))
  logger.info(resolved)
  const registry = storeMain.r[instanceId]
  if(!registry){
    logger.info("No registry found for instanceId:", instanceId)
    local.noRegistryFound = true
    return
  } else {
    local.noRegistryFound = false
  }
  // if (resolved.matched.length > 0 && resolved.matched[resolved.matched.length - 1].path === fullPath && registry) {
  if (resolved.matched.length > 0 && resolved.name !== '404' && registry) {
      await registry.routeByEndpoint(fullPath.replace(`/${instanceId}`, ""))
    return
  }

  const parent = parentPath(fullPath);

  if (parent && parent !== fullPath) {
    logger.info(`Could not load ${fullPath}. Trying parent: ${parent}`);
    await waitForRouteAndReplace(parent)
    // logger.info(`Re-checking if child route is now available: ${fullPath}`);
    // await waitForRouteAndReplace(fullPath);
  } else {
    notify.badDetails(`[${local.id}] - Failed to resolve route after multiple attempts:`, fullPath)
  }
}

onMounted(() => {
  init()
})

</script>


<template>
  <div class="page-404">
    <x-section extra="fs-3 text-danger" k="Invalid Route!">

      <div class="row">
        <div class="col-auto">
          <div v-if="local.isResolving" class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
        <div class="col-auto">
          <h5 v-if="local.isResolving">Waiting for routes to be ready...</h5>
        </div>
      </div>

      <div class="row mt-4 mb-4">
        <x-collapse k="Resolved" v-if="local.resolved"  :modelValue="true">
          <x-json :obj="local.resolved"></x-json>
        </x-collapse>
        <div v-else>
          <span class="fw-bold">No resolved route available</span>
        </div>
      </div>

      <div class="row mt-4 mb-4">
        <x-collapse k="componentErrors Entity"  :modelValue="true" v-if="storeMain.componentErrors">
          <x-json :obj="storeMain.componentErrors"></x-json>
        </x-collapse>
        <div v-else>
          <span class="fw-bold">No componentErrors</span>
        </div>
      </div>

      <div class="row mb-2">
        <div class="col-auto">
          <x-label k="Selected Instance Id:">{{ storeMain.selectedInstId }}</x-label>
        </div>
        <div class="col-auto" v-if="storeMain.selectedInstId">
          <ExecButton icon="fa-rotate-right me-1" :callback="() => storeMain.r[storeMain.selectedInstId].selectDefaultDashboard()">Default Component</ExecButton>
        </div>
        <div class="col-auto" >
          <ExecButton icon="fa-rotate-right me-1" :callback="() => apiMain.routeByEndpoint(local.resolved.fullPath)">Retry</ExecButton>
        </div>
      </div>

    </x-section>

  </div>
</template>

<style scoped>

</style>