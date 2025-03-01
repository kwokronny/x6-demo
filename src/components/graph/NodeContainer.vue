<template>
  <div ref="NodeRef" class="graph-node">
    <div :class="['p-s2 flex justify-between items-center', props.headerClass]">
      <slot name="header">
        <div class="text-tm flex items-center gap-s1">
          <img class="w-[24px]" :src="props.icon" />
          {{ data.title }}
        </div>
        <div class="flex items-center text-secondary gap-s1">
          <el-tooltip :content="Copy">
            <el-icon
              class="cursor-pointer"
              name="copy"
              size="18px"
              @click="handleClone"
            />
          </el-tooltip>
          <el-tooltip :content="Delete">
            <el-icon
              class="cursor-pointer"
              name="delete"
              size="18px"
              @click="handleRemove"
            />
          </el-tooltip>
        </div>
      </slot>
    </div>
    <div>
      <div class="p-s2">
        <slot v-bind:data="data"></slot>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Graph, Node } from '@antv/x6';
import { ElMessageBox } from 'element-plus';
import { computed, inject, nextTick, onMounted, ref, toRefs } from 'vue';
import { randomID, GRAPH_NODE_PADDING } from './util';
import { GRAPH_NODE_PADDING } from './graph';
import { cloneDeep } from 'lodash';
const getGraph = inject<() => Graph>('getGraph');
const getNode = inject<() => Node>('getNode');

const graph = getGraph!();
const node = getNode!();

const NodeRef = ref<HTMLDivElement>();
const data = ref<Record<string, any>>({});

interface IProp {
  icon: string;
  headerClass: string;
}
const props = withDefaults(defineProps<IProp>(), {
  icon: '',
  headerClass: '',
});

onMounted(() => {
  data.value = node.getData();
  node.on('change:data', () => {
    data.value = node.getData();
    nextTick(rerender);
  });
  nextTick(rerender);
});

function rerender() {
  if (!NodeRef.value) return;
  const nodeRect = NodeRef.value.getBoundingClientRect();
  const padding = GRAPH_NODE_PADDING * 2;
  const height = nodeRect.height / graph.zoom();
  node.size(362 + padding, height + padding);
}

async function handleRemove() {
  try {
    const isConfirm = await ElMessageBox.confirm(
      t('graph.deleteNodeDesc', [data.value.Title]),
      t('graph.deleteNodeTitle', [data.value.Title]),
      {
        center: true,
        confirmButtonText: t('btns.delete'),
        cancelButtonText: t('btns.cancel'),
        cancelButtonClass: 'el-button--primary is-outlined',
        roundButton: true,
        type: 'warning',
        icon: 'pl-icon-warning',
      }
    );
    if (isConfirm) {
      if (deleteBeforeConfirm.value) {
        const isConfirm = await deleteBeforeConfirm.value();
        if (!isConfirm) return;
      }
      graph.removeNode(node.id);
    }
  } catch (e) {
    console.error(e);
  }
}

/**
 * 克隆node
 * 备注: x6提供的克隆有问题
 */
function handleClone() {
  let newData = node.data;
  /**
   * 更新克隆节点数据
   */
  const bbox = node.getBBox();
  graph.addNode({
    id: randomID(),
    shape: node.shape,
    x: bbox.x + 50,
    y: bbox.y + 50,
    attrs: cloneDeep(node.attrs!),
    data: newData,
  });
}
</script>
<style>
.x6-node foreignObject body {
  padding: var(--node-padding);
}
.graph-node {
  width: 362px;
  border-radius: plCssVar(radius-lg);
  background: plCssVar(color-white);
  box-shadow: plCssVar(shadow-drawer);
  overflow: hidden;
  box-sizing: border-box;

  &[focus='true'],
  &:hover {
    box-shadow: 0 0 0 3px plCssVar(color-brand), plCssVar(shadow-drawer) !important;
  }
  &[error='true'] {
    box-shadow: 0 0 0 3px plCssVar(color-error), plCssVar(shadow-drawer);
  }
  .el-icon {
    position: static !important;
  }
}
.x6-node {
  .chat-port {
    fill: white;
    stroke-width: 3;
    stroke: var(--pl-color-border);
    &:hover {
      opacity: 1;
      transform: scale(1.2);
    }
    &.cond-then {
      stroke: var(--pl-color-success);
    }
    &.cond-else {
      stroke: var(--pl-color-error);
    }
    &.cond-warning {
      stroke: var(--pl-color-warning);
    }
    &[hover='true'] {
      fill: var(--pl-color-brand) !important;
      stroke: var(--pl-color-brand) !important;
    }
    &[connected='true'] {
      fill: var(--pl-color-border);
      &.cond-then {
        fill: var(--pl-color-success);
      }
      &.cond-else {
        fill: var(--pl-color-error);
      }
      &.cond-warning {
        fill: var(--pl-color-warning);
      }
    }
  }
}
</style>
