<template>
  <div ref="portEl">
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, nextTick, toRefs, inject, onUnmounted } from "vue";
import { Node, Graph } from "@antv/x6";
import { GRAPH_NODE_PADDING } from "../util";

type PostionType = "top" | "right" | "left" | "bottom" | "bottom-right";
type Offset = [number, number];
const getGraph = inject("getGraph") as () => Graph;

const graph = getGraph();

const props = withDefaults(
  defineProps<{
    node: Node;
    id: string;
    color?: string;
    group: string; // 端口对应的组 groups
    position?: PostionType; // 对齐位置
    offset?: Offset; // 平面轴的偏移量
  }>(),
  {
    position: "right",
    color: "edge-border",
    offset: () => [0, 0],
  }
);

const { node } = props;
const { group, id, color } = toRefs(props);

const portEl = ref<HTMLDivElement>();

onMounted(() => {
  const nodeEl = document.querySelector(
    `[data-cell-id="${node.id}"] .graph-node`
  );
  if (nodeEl) {
    const observer = new ResizeObserver(() => {
      updatePostPosition();
    });
    observer.observe(nodeEl);
  }
});

onUnmounted(() => {
  removePort();
});

const removePort = () => {
  node.removePort(id.value);
};

/**
 * 更新连接桩位置
 */
const updatePostPosition = async () => {
  await nextTick();
  if (!portEl.value) return;
  const containerRect = portEl.value!.getBoundingClientRect();
  const zoom = graph.zoom();
  const wrap = document.querySelector(
    `[data-cell-id="${node.id}"] .graph-node`
  );
  if (!wrap) return;
  const wrapRect = wrap!.getBoundingClientRect();
  // 计算position位置
  const basicX = containerRect.left - wrapRect.left;
  const basicY = containerRect.top - wrapRect.top;
  const positionMap: Partial<Record<PostionType, Offset>> = {
    right: [basicX + containerRect.width, basicY + containerRect.height / 2],
    left: [basicX, basicY + containerRect.height / 2],
    top: [basicX + containerRect.width / 2, basicY],
    bottom: [basicX + containerRect.width / 2, basicY + containerRect.height],
  };
  const position = positionMap[props.position] || [0, 0];
  // 处理偏移量
  // 缩放时会影响到连接桩定位的计算，所以需要将缩放因素计算在内
  const offsetPosition = [
    position[0] + (props.offset[0] + GRAPH_NODE_PADDING) * zoom,
    position[1] + (props.offset[1] + GRAPH_NODE_PADDING) * zoom,
  ];
  const port = node.getPort(id.value);
  if (port) {
    node.setPortProp(id.value, "args", {
      x: offsetPosition[0] / zoom,
      y: offsetPosition[1] / zoom,
    });
  } else {
    node.addPort({
      id: id.value,
      group: group.value,
      color: color.value,
      args: {
        x: offsetPosition[0] / zoom,
        y: offsetPosition[1] / zoom,
      },
    });
  }
};
</script>
