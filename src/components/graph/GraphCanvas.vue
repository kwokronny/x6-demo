<template>
  <div class="relative overflow-hidden size-full" v-bind="$attrs">
    <div class="size-full">
      <div ref="GraphDOM" class="select-none"></div>
    </div>
    <TeleportContainer />
  </div>
  <div
    :key="nextMenu.pos?.x"
    v-show="nextMenu.pos"
    ref="nextMenuRef"
    class="shadow-node rounded-sm absolute b-[1.5px] b-dashed b-border bg-white"
    @mousedown.stop
    :style="menuPosStyle"
  >
    <div class="p-m2 text-tl">Choose first step👇🏻</div>
    <div class="p-m2">
      <ChooseNextStep @select="handleChooseNode" />
    </div>
  </div>
</template>
<script setup lang="ts">
import "./graph";
import { Graph, Node, Edge, Cell } from "@antv/x6";
import { getTeleport } from "@antv/x6-vue-shape";
import { computed, onMounted, reactive, ref } from "vue";
import { randomID } from "./util";
import ChooseNextStep from "./components/ChooseNextStep.vue";

const TeleportContainer = getTeleport();
onMounted(() => {
  initGraph();
});

const GraphDOM = ref<HTMLDivElement>();
let graph = ref<Graph>();

const currentNode = ref<Node>();

function initGraph() {
  if (GraphDOM.value) {
    graph.value = new Graph({
      container: GraphDOM.value,
      autoResize: true,
      panning: true,
      connecting: {
        connector: "curveConnector",
        allowBlank: false,
        sourceAnchor: "port-right",
        targetAnchor: "node-left",
        connectionPoint: { name: "anchor" },

        // 创建连线时配置连线样式
        createEdge({ sourceMagnet }) {
          let portColor = sourceMagnet.getAttribute("color");
          const color = portColor || "var(--edge-border)";
          const attrs = {
            line: {
              color, // 记录原色彩，方便hover高亮变色后回复原色
              stroke: color,
            },
          };
          return this.createEdge({
            shape: "graph-edge",
            attrs,
          });
        },
        validateConnection: ({ sourceCell, targetCell, targetMagnet }) => {
          const ignoreNode = ["TriggerNode", "GuideNode"];
          return (
            !ignoreNode.includes(targetCell?.shape || "") &&
            sourceCell?.id !== targetCell?.id &&
            !targetMagnet?.getAttribute("port")
          );
        },
      },
      // 高亮器配置为className，但不设置args，取消默认的连线与拖动时节点高亮样式
      highlighting: {
        default: {
          name: "className",
        },
      },
      background: {
        color: "#f8fafb",
      },
    });
    settingNodeEffect();
    settingEdgeEffect();
    settingNextMenu();
    graph.value.addNode({
      id: "TriggerNode",
      shape: "TriggerNode",
      x: 300,
      y: 100,
    });
  }
}

const createGuide = () => {
  if (!graph.value) return;
  graph.value.addNode({
    id: "TriggerNode",
    shape: "TriggerNode",
    x: 300,
    y: 100,
  });
};

//#region 设置节点交互
const settingNodeEffect = () => {
  if (!graph.value) return;
  graph.value.on("node:click", ({ node }) => {
    if (currentNode.value?.id !== node.id) {
      checkGraphStatus();
    }
    setCurrentNode(node);
  });

  graph.value.on("cell:removed", ({ cell }) => {
    checkGraphStatus();
    if (cell.isNode() && currentNode.value?.id === cell.id) {
      setCurrentNode(undefined);
    }
  });

  graph.value.on("blank:click", () => {
    if (currentNode.value !== undefined) {
      setCurrentNode(undefined);
      checkGraphStatus();
    }
  });
};

// 设置聚焦节点
const setCurrentNode = (nodeOrId?: Node | string) => {
  if (!graph.value) return;
  // 先将所有节点的聚焦状态关闭
  graph.value.getNodes().forEach(async (node: Node) => {
    node.attr(".graph-node/focus", "false");
  });
  // 支持通过 ID 或直接 Node对象 设置
  let node: Cell;
  if (!nodeOrId) {
    currentNode.value = undefined;
    return;
  } else if (typeof nodeOrId === "string") {
    node = graph.value.getCellById(nodeOrId);
  } else {
    node = nodeOrId;
  }
  // 聚焦前确认节点是否有效与是否为节点
  if (!node?.isNode()) return;
  setTimeout(() => {
    currentNode.value = node;
    node.attr(".graph-node/focus", "true");
  }, 50);
  // 平移至当前节点的位置
  const translate = graph.value.translate();
  const zoom = graph.value.zoom();
  const bbox = node.getBBox();
  if (
    (bbox.x + translate.tx) * zoom < 360 ||
    (bbox.y + translate.ty) * zoom < 10
  ) {
    graph.value.positionPoint({ x: bbox.x, y: bbox.y }, 380, 100);
  }
};

const checkGraphStatus = () => {
  if (!graph.value) return;
  //缓存所有连线对应的端口数据
  const connectedPort = graph.value.getEdges().map((edge) => {
    const originColor = edge.getAttrByPath<string>("line/color");
    edge.attr("line/stroke", originColor);
    edge.removeTools();
    return `${edge.getSourceCellId()}-${edge.getSourcePortId()}${
      edge.getTargetNode() ? "" : "-shortcut"
    }`;
  });
  graph.value.getNodes().forEach(async (node: Node) => {
    // 此处可以增加检验节点是否正确并为节点设置 error 状态
    const ports = node.getPorts();
    ports.forEach((port) => {
      // 判断端口是否已连接，
      const connected = connectedPort.indexOf(`${node.id}-${port.id}`) > -1;
      node.setPortProp(port.id!, {
        attrs: {
          circle: {
            connected,
            hover: false,
          },
        },
      });
    });
  });
};
//#endregion

//#region 设置连线交互效果
const settingEdgeEffect = () => {
  if (!graph.value) return;
  graph.value.on("edge:added", onlyOutgoingEdge);
  graph.value.on("edge:connected", onlyOutgoingEdge);
  graph.value.on("edge:mouseenter", ({ edge, e }) => {
    if (e.handleObj.originType === "mouseup" || !edge.getTargetNode()) return;
    // 设置连线颜色
    edge.attr("line/stroke", "var(--edge-hover)");
    // 对应连线的端口也要设置hover状态
    edge.getSourceNode()?.setPortProp(edge.getSourcePortId()!, {
      attrs: { circle: { hover: true } },
    });
    // 连线增加删除按钮，引导节点连线不添加
    if (!edge.hasTools() && edge.getTargetNode()?.shape !== "GuideNode") {
      edge.addTools([
        {
          name: "edge-remove",
          args: {
            distance: edge.getPolyline().length() * -0.3,
          },
        },
      ]);
    }
  });
  graph.value.on("edge:mouseleave", ({ edge }) => {
    // 获取连接原颜色，并设置
    const originColor = edge.getAttrByPath<string>("line/color");
    edge.attr("line/stroke", originColor);
    // 对应连线的端口也要设置hover状态
    edge.getSourceNode()?.setPortProp(edge.getSourcePortId()!, {
      attrs: { circle: { hover: false } },
    });
    // 移除连线上的所有按钮
    edge.removeTools();
  });
};

// 限制节点每个端口只可以连接一个节点
const onlyOutgoingEdge = ({ edge }: { edge: Edge }) => {
  if (graph.value && edge.getSourceCellId() && edge.getTargetCellId()) {
    // 设置连线对应的source端口为连接状态
    edge.getSourceNode()?.setPortProp(edge.getSourcePortId()!, {
      attrs: { circle: { connected: true } },
    });
    // 获取此节点端口的所有的连线，仅保留一条连线
    let outgoingEdges = graph.value.getOutgoingEdges(edge.getSourceCellId());
    if (outgoingEdges) {
      outgoingEdges.forEach((outEdge) => {
        if (
          outEdge.getSourcePortId() === edge.getSourcePortId() &&
          outEdge.id !== edge.id
        ) {
          graph.value?.removeEdge(outEdge);
        }
      });
    }
  }
};
//#endregion

//#region 显示快捷创建节点菜单
const nextMenuRef = ref<HTMLDivElement>();
const nextMenu = reactive<{
  pos?: { x: number; y: number };
  edge?: Edge;
}>({});

const menuPosStyle = computed(() => {
  return {
    left: `${nextMenu.pos?.x || 0}px`,
    top: `${(nextMenu.pos?.y || 0) - 25}px`,
  };
});

const settingNextMenu = () => {
  if (!graph.value) return;

  graph.value.on("edge:mouseup", ({ edge, e }) => {
    if (!edge.getTargetCell()) {
      hideNextMenu();
      if (nextMenuRef.value) {
        const bbox = nextMenuRef.value.getBoundingClientRect();
        let x = e.clientX;
        let y = e.clientY;
        x =
          bbox.width + x > window.innerWidth
            ? x - (bbox.width + x - window.innerWidth)
            : x;
        y =
          bbox.height + y > window.innerHeight
            ? y - (bbox.height + y - window.innerHeight)
            : y;
        nextMenu.pos = { x, y };
        const edgeProp = edge.getProp(),
          offsetX = x - e.clientX,
          offsetY = y - e.clientY;
        edgeProp.target.x += offsetX;
        edgeProp.target.y += offsetY;
        nextMenu.edge = graph.value?.addEdge(edgeProp);
      }
    }
  });

  window.addEventListener("mousedown", hideNextMenu);
};

const hideNextMenu = () => {
  nextMenu.pos = undefined;
  if (nextMenu.edge?.id) {
    graph.value?.removeCell(nextMenu.edge.id);
    nextMenu.edge = undefined;
  }
};
const handleChooseNode = (shape: string) => {
  nextMenu.pos = undefined;
  if (graph.value && nextMenu.edge && nextMenu.edge.isEdge()) {
    // 添加节点
    const newNode = graph.value.addNode({
      id: randomID(),
      shape,
      ...nextMenu.edge.getTargetPoint(),
    });
    // 将新建出来的连线设置target，完成连线
    nextMenu.edge.setTarget(newNode);
    nextMenu.edge
      .getSourceNode()
      ?.setPortProp(nextMenu.edge.getSourcePortId()!, {
        attrs: { circle: { connected: true } },
      });
    //手动触发仅支持一个
    onlyOutgoingEdge({ edge: nextMenu.edge });
    nextMenu.edge = undefined;
  }
};
//#endregion
</script>
<style lang="less">
@import "./graph.less";
</style>
