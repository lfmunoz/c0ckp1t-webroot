<script setup>
/*
  [VARS] - name, init, imports, template, script, style

  Usage:
    const PageXXXX = defineAsyncComponent(() => import("/v3/workflows/c0ckp1t/www/pages/page-homepage.vue"))
    <page-xxxx></page-xxxx>
*/
// ________________________________________________________________________________
// IMPORTS
// ________________________________________________________________________________
import {reactive, computed, ref, onMounted, onUnmounted, defineAsyncComponent, watch} from 'vue'
import {getLogger} from "Logging";
// !# C0CKP1T_START imports
import Constants from "Constants";
import ComponentView from "./component-view.vue";
import XTerminal from "/components/xterminal.vue";
import CodeMirror from "/components/code-mirror.vue";
// !# C0CKP1T_END imports

// ________________________________________________________________________________
// LOGGING
// ________________________________________________________________________________
const LOG_HEADER = "pages/page-components.vue"
const logger = getLogger(LOG_HEADER)
logger.debug("[INIT]")

// !# C0CKP1T_START script
// ________________________________________________________________________________
// STATE
// ________________________________________________________________________________
const local = reactive({
  id: LOG_HEADER,
  isLoading: false,
  updated: Date.now(),

  tree: [
    {
      label: "src",
      path: "/src",
      isDirectory: true,
      expanded: true,
      children: [
        {
          label: "components",
          path: "/src/components",
          isDirectory: true,
          expanded: true,
          children: [
            { label: "xtree.vue", path: "/src/components/xtree.vue", isDirectory: false, expanded: false, children: [] },
            { label: "xbutton.vue", path: "/src/components/xbutton.vue", isDirectory: false, expanded: false, children: [] },
            { label: "xcard.vue", path: "/src/components/xcard.vue", isDirectory: false, expanded: false, children: [] },
            { label: "xinput.vue", path: "/src/components/xinput.vue", isDirectory: false, expanded: false, children: [] },
          ]
        },
        {
          label: "pages",
          path: "/src/pages",
          isDirectory: true,
          expanded: false,
          children: [
            {
              label: "demo",
              path: "/src/pages/demo",
              isDirectory: true,
              expanded: false,
              children: [
                { label: "page-components.vue", path: "/src/pages/demo/page-components.vue", isDirectory: false, expanded: false, children: [] },
                { label: "page-components-adv.vue", path: "/src/pages/demo/page-components-adv.vue", isDirectory: false, expanded: false, children: [] },
              ]
            },
            { label: "Main.vue", path: "/src/pages/Main.vue", isDirectory: false, expanded: false, children: [] },
            { label: "About.vue", path: "/src/pages/About.vue", isDirectory: false, expanded: false, children: [] },
          ]
        },
        {
          label: "core",
          path: "/src/core",
          isDirectory: true,
          expanded: false,
          children: [
            { label: "Logging.mjs", path: "/src/core/Logging.mjs", isDirectory: false, expanded: false, children: [] },
            { label: "JsUtils.mjs", path: "/src/core/JsUtils.mjs", isDirectory: false, expanded: false, children: [] },
          ]
        },
        { label: "App.vue", path: "/src/App.vue", isDirectory: false, expanded: false, children: [] },
        { label: "main.mjs", path: "/src/main.mjs", isDirectory: false, expanded: false, children: [] },
        { label: "router.mjs", path: "/src/router.mjs", isDirectory: false, expanded: false, children: [] },
      ]
    },
    {
      label: "public",
      path: "/public",
      isDirectory: true,
      expanded: false,
      children: [
        {
          label: "css",
          path: "/public/css",
          isDirectory: true,
          expanded: false,
          children: [
            { label: "bootstrap.min.css", path: "/public/css/bootstrap.min.css", isDirectory: false, expanded: false, children: [] },
          ]
        },
        { label: "favicon.ico", path: "/public/favicon.ico", isDirectory: false, expanded: false, children: [] },
      ]
    },
    {
      label: "node_modules",
      path: "/node_modules",
      isDirectory: true,
      expanded: false,
      children: []
    }
  ],
  treeEmpty: [],
  selectedItem: null,

  myTextEditor: "",
})

function onTreeSelect(item) {
  local.selectedItem = item
  logger.debug(`[onTreeSelect] - ${item.path}`)
}

async function delay() {
  await new Promise(r => setTimeout(r, 1000))
}



// !# C0CKP1T_END script

</script>

<template>
  <!--  !# C0CKP1T_START template -->
  <x-section :level="3" k="Components Advanced">

    <ComponentView name="x-upload" url="/components/xupload.vue">
      <x-upload>Hello Title</x-upload>
    </ComponentView>

    <ComponentView name="x-tree" url="/components/xtree.vue">
      <div class="row">
        <div class="col-md-6">
          <h6>File Tree (with nested folders)</h6>
          <x-tree :items="local.tree" @select="onTreeSelect"></x-tree>
        </div>
        <div class="col-md-6">
          <h6>Empty Tree</h6>
          <x-tree :items="local.treeEmpty"></x-tree>
          <div class="mt-3" v-if="local.selectedItem">
            <h6>Selected Item</h6>
            <code>{{ local.selectedItem.path }}</code>
            <span class="ms-2 badge" :class="local.selectedItem.isDirectory ? 'bg-warning' : 'bg-info'">
              {{ local.selectedItem.isDirectory ? 'Directory' : 'File' }}
            </span>
          </div>
        </div>
      </div>
    </ComponentView>


    <ComponentView name="v-ace-editor" url="/components/vue3-ace-editor.vue">
        <v-ace-editor height="400px" :fontSize="17" v-model="local.myTextEditor" lang="kotlin" theme="twilight" debug/>
    </ComponentView>

    <ComponentView name="x-terminal" url="/components/xterminal.vue">
      <XTerminal height="400px" :fontSize="17" v-model="local.myTextEditor" theme="twilight" />
    </ComponentView>

    <ComponentView name="code-mirror" url="/components/code-mirror.vue">
      <code-mirror
          v-model="local.myTextEditor"
          lang="javascript"
          theme="oneDark"
          height="500px"
          :debug="true"
      />
    </ComponentView>

    <ComponentView name="x-sound" url="/components/xsound.vue">
      <XSound
          :url="`${Constants.SERVER_API_URL}/core/img/state-uniqueId-8k.wav`"
          id="stateId" :autoLoad="true"/>
    </ComponentView>



  </x-section>
  <!--  !# C0CKP1T_END template -->
</template>

<style scoped>
/* !# C0CKP1T_START style */


/* !# C0CKP1T_END style */
</style>

