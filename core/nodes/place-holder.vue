<script setup>
/*
*/
// ________________________________________________________________________________
// IMPORTS
// ________________________________________________________________________________
import {reactive, onMounted, onUnmounted, defineAsyncComponent, watch, onErrorCaptured, computed} from 'vue'
import {store as storeMain, api as apiMain} from 'GlobalStore'

const InfoApi = defineAsyncComponent(() => import("../components/info-api.vue"))

const selectedNode = computed(() => {
  return storeMain.r[storeMain.selectedInstId]?.store?.selectedNode
})

</script>


<template>

  <div class="place-holder" v-if="selectedNode">
    <x-section extra="fs-4" :visible="true" :k="`Place Holder Node (endpoint=${selectedNode.endpoint})`">

      <template v-slot:header>
        <x-button icon="fa-info" @callback="apiMain.selectDocumentation(storeMain.documentation)"></x-button>
      </template>

      <x-section extra="fs-4" :visible="false" :k="`API Information`">
        <info-api :endpoint="selectedNode.endpoint" :instanceId="storeMain.selectedInstId"></info-api>
      </x-section>

      <x-section extra="fs-4" :visible="false" :k="`Node Information`">
        <div class="row mt-4 mb-4">
          <x-collapse k="Node Entity">
            <x-json :obj="selectedNode"></x-json>
          </x-collapse>
        </div>
      </x-section>

    </x-section>
  </div>
</template>

<style scoped>


</style>