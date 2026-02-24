// ________________________________________________________________________________
// IMPORT
// ________________________________________________________________________________
import {markRaw, reactive, watch, defineAsyncComponent, getCurrentInstance} from 'vue'
import {ok, nok, sha1} from "JsUtils"
import {Http} from "WsUtils"
import {getLogger} from 'Logging';
import {loadModule, options } from "./VueUtils.mjs";

// ________________________________________________________________________________
// Default Island
// ________________________________________________________________________________
/**
 *  state
 *      isLoading
 *      isReady
 *  store
 *      id
 *  connection
 */
export default class IslandDefault {
    constructor(apiMain, config) {

        this.instanceId = config.instanceId
        this.config = config

        this.LOG_HEADER = `${this.instanceId}`;
        this.logger = getLogger(this.LOG_HEADER);
        this.logger.debug('[INIT]');

        this.connection = {
            state: {
                isConnected: true,
                isAuthenticated: false,
                isReady: true,
                sessionStateString: "INITIALIZED",
                connStateString: "CONNECTED",
                errorMessages: [],
                subscriptionCount: 0,
            },
            store: {
                username: "default",
            }
        };

        // ________________________________________________________________________________
        // STATE - NOT saved in browser storage
        // ________________________________________________________________________________
        this.state = reactive({
            isLoading: false,
            isReady: false,
        })

        // ________________________________________________________________________________
        // STORE - saved in browser storage
        // ________________________________________________________________________________
        this.store = reactive({
            id: this.LOG_HEADER,
            updated: null,

            showRegistry: true,
            root: null,
            selectedNode: null,
        })
        this.apiMain = apiMain
        this.sfcOptions = options

    } // end of constructor

    // ________________________________________________________________________________
    // NODE METHODS
    // ________________________________________________________________________________
    routeByEndpoint = async (endpoint) => {
        this.logger.debug(`routeByEndpoint - endpoint=${endpoint}`);
        await this.apiMain.routeByEndpoint(
            this.instanceId,
            `/${this.instanceId}${endpoint}`
        );
    }

    /**
     * Select the default dashboard (root).
     * @returns {Promise<void>}
     */
    selectDefaultDashboard = async () => {
        await this.apiMain.routerPush(`/${this.instanceId}`);
    }

    /**
     * Select a node and navigate to its endpoint.
     * A node has:
     *   - endpoint = "/documentation"
     *   - name = "documentation"
     * @param {Object} node
     * @returns {Promise<void>}
     */
    selectNode = async (node) => {
        this.logger.info(`selectNode - node.endpoint=${node.endpoint}`);
        this.store.selectedNode = null;
        this.store.selectedNode = node;
        await this.apiMain.routeByEndpoint( node.endpoint );
    }

    // ________________________________________________________________________________
    // MODULE API
    // ________________________________________________________________________________
    loadModule = async (path) => {
        try {
            this.logger.debug(`[loadModule] - path=${path}`);
            return await loadModule(path, options);
        } catch(e) {
            this.logger.error(`[loadModule] - ERROR - path=${path} - ${e}`);
            throw e // Rethrow the error so Vue can handle it
        }
    }

    // ________________________________________________________________________________
    // USER API
    // ________________________________________________________________________________
    userContext = async () => {
        return this.store.context
    }

    /**
     * Fetch and set the root node.
     * @returns {Promise<void>}
     */
    rootNode = async () => {
        this.logger.debug('[rootNode]');
        console.log(this.config)
        const root = this.config.root
        adjustNode(root)
        this.store.root = root
    }

    // ________________________________________________________________________________
    // EXEC API
    // ________________________________________________________________________________
    /**
     * Execute a command on the given endpoint.
     * @param {string} endpointId
     * @param {Array} args
     * @param {*} bytes
     * @returns {Promise<Object>}
     */
    exec = async (endpointId, args = [], bytes = null) => {
        if (typeof endpointId !== 'string') {
            return nok('[INVALID_ARGUMENT] - endpointId must be string', ['exec']);
        }
        if (!Array.isArray(args)) {
            return nok('[INVALID_ARGUMENT] - args must be an array', ['exec']);
        }
        if (!endpointId) {
            return nok(`[INVALID_ARGUMENT] - endpointId=${endpointId}`, ['exec']);
        }

        try {
            return nok("[NOT_IMPLEMENTED]", ['exec']);
        } catch (e) {
            const errorMsg = `[EXCEPTION] - endpointId=${endpointId} - args=${args}`;
            this.logger.info(errorMsg);
            this.logger.info(e);
            return nok(e.toLocaleString(), ['exec', errorMsg]);
        }
    }

    // ________________________________________________________________________________
    // HTTP
    // ________________________________________________________________________________
    /**
     *
     * @param path
     * @param type
     * @returns {Promise<Response>}
     */
    resolver =  async (path, type) => {
        this.logger.debug(`[resolver] - fetching - ${path} - ${type}`)
        const res = await fetch(path);
        if (!res.ok) throw Object.assign(new Error(res.statusText + ' ' + path), {res});
        return res
    }


    getText = async (endpoint) => {
            const path = `${this.config.SERVER_API_URL}${endpoint}`;
            this.logger.debug(`[getText] - ${path}`);
            return await Http.getText(path)
    }

    async getBinary(endpoint) {
        const path = `${this.config.SERVER_API_URL}${endpoint}`;
        this.logger.debug(`[getBinary] - ${path}`);
        return await Http.getBinary(path)
    }

    async getJson(endpoint, params = {}) {
        const path = `${this.config.SERVER_API_URL}${endpoint}`;
        this.logger.debug(`[getJson] - ${path}`);
        return await Http.getJson(path)
    }

    async postJson(endpoint, body) {
        const path = `${this.config.SERVER_API_URL}${endpoint}`;
        this.logger.debug(`[postJson] - ${path}`);
        return await Http.postJson(path, body)
    }

    // ________________________________________________________________________________
    // init
    // ________________________________________________________________________________
    init = async ()   => {
       await this.rootNode()
       this.state.isReady = true
    }

} // end of IslandDefault class


// ________________________________________________________________________________
// HELPER METHODS
// ________________________________________________________________________________
function adjustNode(node) {
    node._expanded = true;
    node.children.forEach((child) => {
        adjustNode(child);
    });
}

