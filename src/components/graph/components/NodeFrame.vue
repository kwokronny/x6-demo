<template>
  <div ref="NodeRef" class="graph-node">
    <div :class="['p-m2 flex justify-between items-center', props.headerClass]">
      <slot name="header">
        <div class="text-tm flex items-center gap-m1">
          <img class="w-[24px]" :src="props.icon" />
          {{ title }}
        </div>
      </slot>
    </div>
    <div>
      <div class="p-m2">
        <slot v-bind:data="data"></slot>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Graph, Node } from "@antv/x6";
import { inject, onMounted, ref } from "vue";
import { GRAPH_NODE_PADDING } from "../util";
const getGraph = inject<() => Graph>("getGraph");
const getNode = inject<() => Node>("getNode");

const graph = getGraph!();
const node = getNode!();

const NodeRef = ref<HTMLDivElement>();
const data = ref<Record<string, any>>({});

interface IProp {
  icon?: string;
  title: string;
  headerClass?: string;
}
const props = withDefaults(defineProps<IProp>(), {
  icon: "",
  title: "",
  headerClass: "",
});

onMounted(() => {
  if (!NodeRef.value) return;
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      rerender(entry.contentRect);
    }
    console.log("size change");
  });
  observer.observe(NodeRef.value);
  node.on("change:data", () => {
    data.value = node.getData();
  });
});

const rerender = (rect: DOMRectReadOnly) => {
  if (!NodeRef.value) return;
  const padding = GRAPH_NODE_PADDING * 2;
  const height = rect.height / graph.zoom();
  const width = rect.width / graph.zoom();
  node.size(width + padding, height + padding);
};
</script>
