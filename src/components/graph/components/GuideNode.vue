<template>
  <NodeFrame title="" class="guide-node">
    <template #header>
      <div class="pt-m2 text-tl">Choose first step👇🏻</div>
    </template>
    <ChooseNextStep @select="handleChooseNode" />
  </NodeFrame>
</template>
<script setup lang="ts">
import { Graph, Node } from "@antv/x6";
import { inject } from "vue";
import { randomID } from "../util";
import NodeFrame from "./NodeFrame.vue";
import ChooseNextStep from "./ChooseNextStep.vue";
const getNode = inject("getNode") as () => Node;
const getGraph = inject("getGraph") as () => Graph;

const graph = getGraph();
const node = getNode();

const handleChooseNode = (shape: string) => {
  const incomingEdge = graph.getIncomingEdges(node);
  if (node && incomingEdge?.length) {
    const bbox = node.getBBox();
    const newNode = graph.addNode({
      id: randomID(),
      shape,
      x: bbox.x,
      y: bbox.y,
    });
    incomingEdge[0].setTarget(newNode);
    graph.removeNode(node);
  }
};
</script>
<style lang="less" scoped>
.guide-node {
  --at-apply: "b-dashed b-[1.5px] b-border cursor-default";
  &:hover {
    --at-apply: "ring-0";
  }
}
</style>
