<script setup>
/**
 * Root page for default registry
 *  should be for all registries?
 */
//________________________________________________________________________________
// IMPORTS
//________________________________________________________________________________
import {reactive, ref, onMounted, onUnmounted, watch, computed, onErrorCaptured} from 'vue'
import {store as storeMain, api as apiMain, store} from 'GlobalStore'
import {getLogger} from "Logging";

import {api as apiTheme, store as storeTheme} from "./Theme.mjs"
import PageFallback from "/core/PageFallback.vue"
import MainOffcanvas from "./main-offcanvas.vue";


// ________________________________________________________________________________
// LOGGING
// ________________________________________________________________________________
const LOG_HEADER = 'PageMain.vue'
const logger = getLogger(LOG_HEADER)
logger.debug("[INIT]")


// ________________________________________________________________________________
// LOCAL
// ________________________________________________________________________________
const local = reactive({
  id: LOG_HEADER,
  toggle: false,
  items: [
  ]
})


/**
 * In Bootstrap 5, the best practice for a full-page theme is to apply the data-bs-theme attribute
 *  to the <html> or <body>. This sets it on the <html> tag dynamically.
 */
watch(
    () => storeTheme.theme,
    (newTheme) => {
      document.documentElement.setAttribute('data-bs-theme', newTheme)
    },
    { immediate: true } // Run immediately on load
)

//________________________________________________________________________________
// INIT
//________________________________________________________________________________
onMounted(() => {

})
onUnmounted(() => {
})


onErrorCaptured((error, instance, info) => {
  logger.info(`[ERROR]`)
  console.log(instance)
  console.log(error)
  storeMain.componentErrors.push({
    errorStack: error.stack,
    errorMessage: error.message,
    info: info,
    dashboardName: storeMain.dashboardName,
    dashboard: storeMain.dashboard,
  })
  // Return false to prevent the error from propagating further
  return false;
})

// ________________________________________________________________________________
// COMPUTED
// ________________________________________________________________________________
const mainContentStyle = computed(() => ({
  marginLeft: storeMain.mainOffCanvasOpen ? `${storeMain.mainOffCanvasWidth}px` : '0',
  width: storeMain.mainOffCanvasOpen ? `calc(100% - ${storeMain.mainOffCanvasWidth}px)` : '100%',
}))

</script>


<template>
  <div class="page-main">


    <!-- ========== FIXED SIDEBAR ========== -->
    <main-offcanvas/>

    <!-- ==========  NAVIGATION ========== -->
    <nav class="navbar navbar-expand-lg fixed-top bg-body-tertiary border-bottom">
      <div class="container">

        <a class="navbar-brand" @click.prevent="apiMain.selectLogo()" >
          <span  class="me-2 text-warning" v-if="store.showSidebar"><<</span>
          <img src="/core/img/logo_v1.svg" alt="Logo" height="24" class="d-inline-block align-text-top" v-if="!store.showSidebar">
          <img src="/core/img/logo_v2.svg" alt="Logo" height="24" class="d-inline-block align-text-top" v-else>
          <span class="text-warning fw-bold ms-2 brand-text">{{ storeMain.name }}</span>
        </a>


        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText"
                aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarText">
          <ul class="navbar-nav flex-grow-1 justify-content-center">
            <li class="nav-item" v-for="item in local.items" :key="item.path">
              <RouterLink :to="item.path" class="nav-link">
                {{ item.name }}
              </RouterLink>
            </li>
          </ul>

          <form class="d-flex">
            <input class="form-control me-2" type="search" placeholder="Search" v-model="local.searchQuery">
            <button class="btn btn-outline-secondary me-2" type="button" @click="storeTheme.theme = storeTheme.theme === 'dark' ? 'light' : 'dark'" title="Toggle theme">
              <i class="fa-solid" :class="storeTheme.theme === 'dark' ? 'fa-sun' : 'fa-moon'"></i>
            </button>
            <button class="btn btn-outline-secondary" type="submit">
              <i class="fa-solid fa-search"></i>
            </button>
          </form>

        </div>
      </div>
    </nav>

    <!-- ==========  MAIN CONTENT ========== -->
    <main class="container-fluid main-content" :style="mainContentStyle">
            <page-fallback v-if="storeMain.componentErrors.length > 0 "></page-fallback>
            <RouterView/>
    </main>

    <!-- ==========  FOOTER ========== -->
    <footer class="container-fluid p-4 bg-body-tertiary border-top">
      <div class="row mt-4 align-items-center justify-content-center">
        <div class="col-6 d-flex flex-column align-items-center">
          <img src="/core/img/logo_v1.svg" width="24" height="24" class="d-block mb-3" alt="Product logo" role="img" />
          <small class="d-block mb-3 text-body-secondary">&copy; 2017–2025</small>
          <small class="d-block mb-3 text-body-secondary">Product of <a href="https://sorsha.com">sorsha.com</a></small>
          <small class="d-block mb-3 text-body-secondary">Made in USA</small>
          <img src="/core/img/Flag_of_the_United_States.svg" width="24" height="24" class="d-block mb-3" alt="Product logo" role="img" />
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
/* !# C0CKP1T_START style */

:root {
  --navbar-height: 56px;
}

.page-main{
  /* Ensure text color inherits the bootstrap variable */
  color: var(--bs-body-color);
  background-color: var(--bs-body-bg); /* Explicitly set background to match body */
  min-height: 100vh;
  overflow-x: hidden; /* Prevent horizontal scrollbar when sidebar is open */
}


/* Fixed navbar height compensation */
.navbar.fixed-top {
  z-index: 1030;
}

/* Main content area */
.main-content {
  min-height: 100vh;
  padding-top: var(--navbar-height); /* Space for the fixed navbar */
}

/* !# C0CKP1T_END style */
</style>
