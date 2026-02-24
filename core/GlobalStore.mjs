//________________________________________________________________________________
//
//  Global State used throught entire module
//
//    Note: To use in other modules:
//    import { store } from './global-store.js'
//
//________________________________________________________________________________
// IMPORTS
//________________________________________________________________________________
import {markRaw, reactive, watch, defineAsyncComponent, createApp} from 'vue'
import * as VueRouter from 'vue-router'
import {getLogger} from 'Logging';
import { transformRoutes} from "./VueUtils.mjs";
import { Theme} from "./Theme.mjs";
import IslandDefault from 'IslandDefault'
import Island from './Island.mjs'
import {substrAfterFirstSlash} from "JsUtils";

// ________________________________________________________________________________
// LOGGING
// ________________________________________________________________________________
const LOG_HEADER = 'GlobalStore.vue'
const logger = getLogger(LOG_HEADER)
logger.info("[INIT]")

const createAsyncComponent = (loader, name) => defineAsyncComponent({
    loader,
    onError(error, retry, fail, attempts) {
        console.error(`[ASYNC COMPONENT ERROR] ${name}:`, error)
        store.componentErrors.push({
            componentName: name,
            error: error,
            message: error.message,
            stack: error.stack,
            attempts
        })
        fail()  // or retry() if you want to attempt reloading
    }
})
// ________________________________________________________________________________
// STORE
// ________________________________________________________________________________
export const store = reactive({
    // ________________________________________________________________________________
    // Application
    // ________________________________________________________________________________
    // Text appears next to logo in pages/navigation.vue
    name: "C0ckp1t",
    id: LOG_HEADER,
    config: null,

    // ________________________________________________________________________________
    // Registries
    // ________________________________________________________________________________
    r: {},
    selectedInstId: null,
    router: null,

    // ________________________________________________________________________________
    // Login
    // ________________________________________________________________________________
    isAuthenticated: false,
    username: null,

    // ________________________________________________________________________________
    // Documentation
    // ________________________________________________________________________________
    isCollapsedTOC: false,

    // ________________________________________________________________________________
    // Vue App Instance - gets created in App.vue
    // ________________________________________________________________________________
    app: null,
    isReady: false,
    dashboard: null,
    dashboardName: "Nothing Loaded",
    componentErrors: [],

    // ________________________________________________________________________________
    // Main Offcanvas
    // ________________________________________________________________________________
    showSidebar: false,
    mainOffCanvas: null,
    mainOffCanvasOpen: false,
    mainOffCanvasWidth: 0,

    // ________________________________________________________________________________
    // Documentation
    // ________________________________________________________________________________
    documentation: "/v3/text-markdown/c0ckp1t/Introduction.md",

    // ________________________________________________________________________________
    // P1t Modal
    // ________________________________________________________________________________
    modal: null,
    modalComponent: null,
    modalTitle: "N/A",
    modalDefaultDashboard:  {
        name: "Documentation Main",
        id: "/c0ckp1t/actions/markdown/markdown.vue",
        location: "/c0ckp1t/actions/markdown/markdown.vue",
        type: "COMPONENT"
    },
    modalIsOpen: false,

    mdURL: "/c0ckp1t/docs/Introduction.md",
    mdDefaultURL: "/c0ckp1t/docs/Introduction.md",

    // ________________________________________________________________________________
    // OFFCANVAS
    // ________________________________________________________________________________
    offcanvas: null,
    offCanvasSel: null,
    offCanvasArr: [
        {id: 'connection', label: 'Connection'},
        {id: 'wspackets', label: 'WsPacket Logs'},
        {id: 'alerts', label: 'Alert Logs'},
        {id: 'help', label: 'Help'},
    ],
    offcanvasOpen: false,

})


// ________________________________________________________________________________
// API
// ________________________________________________________________________________
export const api = {

    // ________________________________________________________________________________
    // Islands
    // ________________________________________________________________________________
    registerStaticIsland: async (config) => {
        const islandDefault = new IslandDefault(api, config)
        await islandDefault.init()
        store.r[islandDefault.instanceId] = islandDefault
    },

    // ________________________________________________________________________________
    // DASHBOARDS
    // ________________________________________________________________________________
    async selectLogo() {
        logger.debug("[selectLogo]")
        if (!store.mainOffCanvas) {
            logger.warn("[selectLogo] - store.mainOffCanvas=null")
            return
        }
        if(store.showSidebar){
            api.closeSideBar()
        } else {
            api.openSideBar()
        }
    },

    /**
     * return get an array with all the route records.
     */
    getRoutes: () => {
        return store.router.getRoutes()
    },
    /**
     *
     * @returns Vue ref to the current route
     */
    getCurrentRoute: () => {
        return store.router.currentRoute
    },

    getRouter: () => {
        return store.router
    },

    routeByEndpoint: async (endpoint) => {
        logger.info(`[routeByEndpoint] - endpoint=${endpoint}`)
        try {
            await store.router.push(endpoint)
        } catch (err) {
            console.error("Failed to navigate:", err)
        }
    },

    /**
     *  [
     *      { path: String, routes: [], name: "" },
     *      { path: String, routes: [], name: "" },
     *  ]
     */
    insertRoutes: async (endpoint, config) => {
        const endpointCleaned = endpoint.replace(/\/+$/, '')
        const routerName = endpointCleaned.replaceAll('/', '-').replace(/^\-+/, '')
        const routerPath = endpointCleaned
        logger.debug(`insertRoutes \n endpoint=${endpointCleaned} \n routerName=${routerName} \n routerPath=${routerPath}`);

        const vueNestedRoutes = transformRoutes( store.r[store.config.defaultInstanceId].loadModule, config)
        logger.debug(`vueNestedRoutes:`)
        logger.debug(vueNestedRoutes)

        await store.router.addRoute({
            name: routerName,
            path: routerPath,
            component: vueNestedRoutes[0].component,
            children: vueNestedRoutes[0].children
        })
    },


    // ________________________________________________________________________________
    // REGISTRY SIDEBAR
    // ________________________________________________________________________________
    openSideBar() {
        store.mainOffCanvas.show()
        store.showSidebar = true
    },
    closeSideBar() {
        store.mainOffCanvas.hide()
        store.showSidebar = false
    },

    // ________________________________________________________________________________
    // OFFCANVAS
    // ________________________________________________________________________________
    toggleOffCanvas() {
        store.offcanvasOpen = !store.offcanvasOpen;
    },

    // ________________________________________________________________________________
    // INIT
    // ________________________________________________________________________________
    async init(id, config) {
        logger.info(`[INIT] - ${id}`)

        store.name = config.appName || "C0ckp1t"
        store.config = config

        const selector = `#${id}`
        const el = document.querySelector(selector)
        if (!el) {
            logger.warn(`Mount point "${selector}" not found`)
            return null
        }
        //________________________________________________________________________________
        // CREATE APP
        //________________________________________________________________________________
        const app = createApp({
            mounted() {
                console.log(`[${store.name}] - Mounted Application`)
            }
        })
        store.app = markRaw(app)
        app.config.globalProperties.$moment = window.moment
        app.config.errorHandler = (err, vm, info) => {
            console.error('Global error handler:', err, vm, info);
        };


        const islandDefault = new IslandDefault(api, config.defaultConfig)
        store.r[islandDefault.instanceId] = islandDefault
        await islandDefault.init()

        const router = VueRouter.createRouter({
            history: VueRouter.createWebHistory(),
            routes: transformRoutes(islandDefault.loadModule, config.defaultRoutes)
        })
        store.router = markRaw(router)


        app.component('app-main', createAsyncComponent(() => islandDefault.loadModule('/core/PageMain.vue')))

        app.component("ExecButton", defineAsyncComponent(() => islandDefault.loadModule('/components/ExecButton.vue')))
        app.component("XInput", defineAsyncComponent(() => islandDefault.loadModule('/components/xinput.vue')))
        app.component("XLabel", defineAsyncComponent(() => islandDefault.loadModule('/components/xlabel.vue')))
        app.component("XDropdown", defineAsyncComponent(() => islandDefault.loadModule('/components/xdropdown.vue')))
        app.component("XDropdown2", defineAsyncComponent(() => islandDefault.loadModule('/components/xdropdown2.vue')))
        app.component("XSection", defineAsyncComponent(() => islandDefault.loadModule('/components/xsection.vue')))
        app.component("XTableOpen", defineAsyncComponent(() => islandDefault.loadModule('/components/xtable-open.vue')))
        app.component("XCollapse", defineAsyncComponent(() => islandDefault.loadModule('/components/xcollapse.vue')))
        app.component("XToggle", defineAsyncComponent(() => islandDefault.loadModule('/components/xtoggle.vue')))
        app.component("XToggle3", defineAsyncComponent(() => islandDefault.loadModule('/components/xtoggle3.vue')))
        app.component("XCheck", defineAsyncComponent(() => islandDefault.loadModule('/components/xcheck.vue')))
        app.component("XCheckbox", defineAsyncComponent(() => islandDefault.loadModule('/components/xcheckbox.vue')))
        app.component("XTextarea", defineAsyncComponent(() => islandDefault.loadModule('/components/xtextarea.vue')))
        app.component("XHidden", defineAsyncComponent(() => islandDefault.loadModule('/components/xhidden.vue')))

        app.component("XTabs", defineAsyncComponent(() => islandDefault.loadModule('/components/xtabs.vue')))
        app.component("XKv", defineAsyncComponent(() => islandDefault.loadModule('/components/xkv.vue')))
        app.component("XNav", defineAsyncComponent(() => islandDefault.loadModule('/components/xnav.vue')))
        app.component("XMap", defineAsyncComponent(() => islandDefault.loadModule('/components/xmap.vue')))
        app.component("XList", defineAsyncComponent(() => islandDefault.loadModule('/components/xlist.vue')))
        app.component("XJson", defineAsyncComponent(() => islandDefault.loadModule('/components/xjson.vue')))
        app.component("XCard", defineAsyncComponent(() => islandDefault.loadModule('/components/xcard.vue')))
        app.component("XCardH", defineAsyncComponent(() => islandDefault.loadModule('/components/xcard-h.vue')))
        app.component("XColor", defineAsyncComponent(() => islandDefault.loadModule('/components/xcolor.vue')))

        // app.component('CodeMirror', defineAsyncComponent(() => islandDefault.loadModule('/components/CodeMirror.vue')))
        // app.component('XTerminal', defineAsyncComponent(() => islandDefault.loadModule('/components/XTerminal.vue')))
        app.component('v-ace-editor', defineAsyncComponent(() => islandDefault.loadModule('/components/vue3-ace-editor.vue')))
        app.component("XMarkdown", defineAsyncComponent(() => islandDefault.loadModule('/components/xmarkdown.vue')))
        app.component("XSound", defineAsyncComponent(() => islandDefault.loadModule('/components/xsound.vue')))
        app.component("XUpload", defineAsyncComponent(() => islandDefault.loadModule('/components/xupload.vue')))
        app.component("XTree", defineAsyncComponent(() => islandDefault.loadModule('/components/xtree.vue')))

        app.use(router)
        app.mount(selector)
        await router.isReady()
        const currentInstanceId = substrAfterFirstSlash(api.getCurrentRoute().value.fullPath)
        if(currentInstanceId === islandDefault.instanceId) {
            store.selectedInstId = islandDefault.instanceId
            store.isReady = true
        }


        for (const [key, value] of Object.entries(config.islands || {})) {
            const config = {
                sfcOptions: islandDefault.sfcOptions,
                ...value
            }
            const island= new Island(api, config)
            store.r[island.instanceId] = island
            await island.init()
            if(currentInstanceId === island.instanceId) {
                store.selectedInstId = island.instanceId
            }
        }

        store.isReady = true
    }
}

