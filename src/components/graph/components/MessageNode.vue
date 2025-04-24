<template>
  <NodeFrame
    header-class="bg-success/10"
    icon="/automation/trigger.png"
    title="Message #1"
  >
    <div class="flex flex-col gap-m2">
      <NodePort
        v-if="node"
        group="then"
        id="then"
        color="success"
        :offset="[16, 0]"
        :node="node"
        class="text-bm text-secondary text-right"
      >
        Then
      </NodePort>
    </div>
  </NodeFrame>
</template>
<script setup lang="ts">
import { inject } from "vue";
import { Node } from "@antv/x6";
import NodePort from "./NodePort.vue";
import NodeFrame from "./NodeFrame.vue";

const getNode = inject<() => Node>("getNode");
const node = getNode!();
</script>
<style></style>
