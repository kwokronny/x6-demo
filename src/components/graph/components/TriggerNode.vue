<template>
  <NodeFrame
    header-class="bg-brand/10"
    icon="/automation/trigger.png"
    title="When..."
  >
    <div class="flex flex-col gap-m2">
      <div class="bg-brand/10 rounded-md p-m2">
        <div class="flex items-center gap-m1">
          <img class="w-[24px]" src="/automation/whatsapp.png" />
          <span class="text-tm text-primary">Trigger title #1</span>
        </div>
        <div class="b-t-1 b-t-solid b-t-border my-m1"></div>
        <div class="text-bm text-secondary">Trigger description</div>
      </div>
      <div class="bg-brand/10 rounded-md p-m2">
        <div class="flex items-center gap-m1">
          <img class="w-[24px]" src="/automation/whatsapp.png" />
          <span class="text-tm text-primary">Trigger title #2</span>
        </div>
        <div class="b-t-1 b-t-solid b-t-border my-m1"></div>
        <div class="text-bm text-secondary">Trigger description</div>
      </div>
      <button class="btn btn-outline w-full">Add new trigger</button>
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
