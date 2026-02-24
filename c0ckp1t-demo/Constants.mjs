/*
    Constants.mjs
 */
// ________________________________________________________________________________
// HELPER METHODS
// ________________________________________________________________________________
function findHostNamePortProtocol() {
    // "localhost:1992"
    // "192.168.1.105"
    let hostname = window.location.host
    // 'http:' or 'https:'
    let protocol = window.location.protocol
    let port = "80"
    let isSecure = false

    if (hostname.includes(":")) {
        port = hostname.split(':')[1].trim()
        // WARNING: overwrites hostname
        hostname = hostname.split(':')[0].trim()
    } else {
        if (protocol.toLowerCase() === 'https:') {
            port = "443"
            isSecure = true
        }
    }

    let apiBaseUrl = "https://sorsha.com/apiVersion1"
    if(hostname.includes("localhost")) {
        apiBaseUrl = "http://localhost:3040"
    }
    // for dev http://localhost:1993

    return {
        hostname, port, protocol, isSecure, apiBaseUrl
    }
}

// ________________________________________________________________________________
// PEROPERTIES
// ________________________________________________________________________________
// XMLHttpRequest from a different domain cannot set cookie values for their own
// domain unless withCredentials is set to true before making the request.
// https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/withCredentials
let WITH_CREDENTIALS = false
const {hostname, port, protocol, isSecure, apiBaseUrl} = findHostNamePortProtocol()


// ________________________________________________________________________________
// GLOBAL CONSTANTS
// ________________________________________________________________________________
const defaultInstanceId =  "default";

let Constants = {

    SERVER_API_URL: `${protocol}//${hostname}:${port}`,
    WITH_CREDENTIALS: WITH_CREDENTIALS,
    HOSTNAME: hostname,
    PORT: port,
    PROTOCOL: protocol,
    IS_SECURE: isSecure,

    appName:  "C0ckp1t",

    defaultLogLevel: "INFO",
    defaultLoggerLevels: {
        "VueUtils.js": "INFO",
        "Connection.mjs": "INFO",
        "default": "INFO",
        "anonymous": "INFO"
    },
    isDev: true,


    defaultRoutes: [
        { path: '/', name: 'root', children: [
            {path: '', redirect: '/default/demo/homepage'},
            {path: 'default', children :[
                    {path: 'connections', location: "/core/pages/Connections.vue"},
                    {path: 'connections/:id', location: "/core/pages/Connection.vue"},
                    {path: 'demo', location: "/c0ckp1t-demo/main.vue", children: [
                            {path: '', redirect: "/default/demo/homepage"},
                            {path: 'homepage', location: "/c0ckp1t-demo/pages/homepage.vue"},
                            {path: 'report', location: "/c0ckp1t-demo/pages/report.vue"},
                            {path: 'devices', location: "/c0ckp1t-demo/pages/devices.vue"},
                        ] },
            ]}
        ] },
        { path: '/:pathMatch(.*)*', name: '404', location: "/core/Page404.vue" }

    ],

    apiBaseUrl: apiBaseUrl,

    islands: { },
    defaultInstanceId: defaultInstanceId,
    defaultConfig: {
        instanceId: "default",
        root: {
            icon: "fa-house",
            depth: 0,
            endpoint: "/",
            isLeaf: false,
            isRoot: true,
            name: "",
            path: [],
            children: [
                {
                    depth: 1,
                    endpoint: `/${defaultInstanceId}/demo`,
                    isLeaf: true,
                    isRoot: false,
                    path: ["demo"],
                    name: "demo",
                    children: []
                }
            ]
        }
    },

} // end of Constants

// ________________________________________________________________________________
// EXPORT
// ________________________________________________________________________________
export default Constants;
