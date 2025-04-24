<template>
  <NodeFrame
    header-class="bg-cyan-100"
    icon="/automation/condition.png"
    title="Condition #1"
  >
    <div class="flex flex-col gap-m2">
      <NodePort
        v-if="node"
        group="then"
        id="then"
        :offset="[16, 0]"
        :node="node"
        class="text-bm text-secondary text-right"
      >
        Then
      </NodePort>
      <NodePort
        v-if="node"
        group="else"
        id="else"
        :offset="[16, 0]"
        :node="node"
        class="text-bm text-secondary text-right"
      >
        Else
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
