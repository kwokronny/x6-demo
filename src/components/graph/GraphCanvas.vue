<template>
  <div class="relative overflow-hidden" v-bind="$attrs">
    <div style="size-full">
      <div ref="GraphDOM" class="select-none"></div>
    </div>
    <TeleportContainer />
  </div>
</template>
<script setup lang="ts">
import './graph';
import { Graph, Node, Edge, Options, Cell, Model } from '@antv/x6';
import { getTeleport } from '@antv/x6-vue-shape';
import { onMounted, provide, reactive, ref, toRefs } from 'vue';

const TeleportContainer = getTeleport();

interface IProp {
  readonly?: boolean;
}
const props = withDefaults(defineProps<IProp>(), {
  readonly: false,
});

defineExpose({
  loadGraph,
  setCurrentNode,
  validNodes,
  toJSON,
  execGraph,
});

onMounted(() => {
  initGraph();
});

function execGraph(callback: (graph: Graph) => void) {
  if (graph.value) {
    callback(graph.value);
  }
}

let increment = 1;
const GraphDOM = ref<HTMLDivElement>();
let graph = ref<Graph>();

function initGraph() {
  if (GraphDOM.value) {
    const options: Partial<Options.Manual> = {
      container: GraphDOM.value,
      autoResize: true,
      scaling: {
        min: 0.5, // 默认值为 0.01
        max: 4, // 默认值为 16
      },
      panning: true,
      connecting: {
        connector: 'curveConnector',
        allowBlank: false,
        sourceAnchor: 'port',
        targetAnchor: 'node-left',
        connectionPoint: { name: 'anchor' },
      },
      interacting: false,
      background: {
        color: '#ccc',
      },
      mousewheel: {
        enabled: true,
        modifiers: ['ctrl', 'meta'],
        factor: 1.02,
      },
    };
    if (props.readonly === false) {
      options.interacting = {
        // 限制连接节点
        nodeMovable: function () {
          // 当有GuideNode时禁用交互
          return !this.getCellById('GuideNode');
        },
      };
      options.highlighting = {
        default: {
          name: 'hover',
        },
      };
      if (options.connecting) {
        // 创建连线时配置连线样式
        options.connecting.createEdge = (args) => {
          let attrs = {};
          let group = args.sourceMagnet.getAttribute('port-group');
          /** condition 特殊处理 */
          if (args.sourceCell.shape === 'ConditionNode' && group === 'then') {
            group = 'success';
          }
          const lineColorMap = {
            success: 'success',
            else: 'error',
            onReply: 'warning',
            notReply: 'error',
          };
          const color = `var(--pl-color-${
            lineColorMap[group as keyof typeof lineColorMap] || 'border'
          })`;
          attrs = {
            line: {
              condition: group === 'success' ? true : false,
              color, // 记录原色彩，方便hover高亮变色后回复原色
              stroke: color,
            },
          };
          return graph.value?.createEdge({
            shape: 'chat-edge',
            attrs,
          });
        };
        // 限制连接节点
        options.connecting.validateConnection = ({
          sourceCell,
          targetCell,
          targetMagnet,
        }) => {
          const ignoreNode = ['TriggerNode', 'GuideNode'];
          return (
            !ignoreNode.includes(targetCell?.shape || '') &&
            sourceCell?.id !== targetCell?.id &&
            !targetMagnet?.getAttribute('port')
          );
        };
      }
    }
    graph.value = new Graph(options);

    if (props.readonly === false) {
      graph.value.on('node:click', ({ node }) => {
        if (currentNode.value?.id !== node.id) {
          validNodes();
        }
        setCurrentNode(node);
      });

      graph.value.on('cell:removed', ({ cell }) => {
        validNodes();
        if (cell.isNode() && currentNode.value?.id === cell.id) {
          setCurrentNode(undefined);
        }
      });

      graph.value.on('blank:click', () => {
        if (currentNode.value !== undefined) {
          setCurrentNode(undefined);
          validNodes();
        }
      });

      //#region 显示快捷菜单
      graph.value.on('edge:mouseup', ({ edge, e }) => {
        if (!edge.getTargetCell()) {
          // const { portData, node } = getConnetedPortDataNodeByEdge(graph.value!, edge)
          // /** view-website button创建新的node */
          // if (node.shape === 'MessageNode' && portData?.actionType=== 'view-website') {
          //   console.log(11, portData, node)
          // }
          hideShortcutMenu();
          const menu = document.querySelector('.shortcut-menu');
          if (menu) {
            const bbox = menu.getBoundingClientRect();
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
            shortcut.pos = { x, y };
            const edgeProp = edge.getProp(),
              offsetX = x - e.clientX,
              offsetY = y - e.clientY;
            edgeProp.target.x += offsetX;
            edgeProp.target.y += offsetY;
            shortcut.edge = graph.value?.addEdge(edgeProp);
          }
        }
      });

      window.addEventListener('mousedown', hideShortcutMenu);
      //#endregion

      //#region 处理连线时一个连接村庄只可连接一个节点
      graph.value.on('edge:added', onlyOutgoingEdge);
      graph.value.on('edge:connected', onlyOutgoingEdge);
      //#endregion

      graph.value.on('edge:mouseenter', ({ edge, e }) => {
        if (e.handleObj.originType === 'mouseup' || !edge.getTargetNode())
          return;
        edge.attr('line/stroke', 'var(--pl-color-brand)');
        edge.getSourceNode()?.setPortProp(edge.getSourcePortId()!, {
          attrs: { circle: { hover: true } },
        });
        if (
          !edge.hasTools() &&
          edge.getTargetNode()?.shape !== 'GuideNode' &&
          edge.getSourceNode()?.shape !== 'BroadcastTriggerNode' // 禁止删除broadcast trigger连接的线
        ) {
          edge.addTools([
            {
              name: 'edge-remove',
              args: {
                distance: edge.getPolyline().length() * -0.3,
              },
            },
          ]);
        }
      });

      graph.value.on('edge:mouseleave', ({ edge }) => {
        edge.getSourceNode()?.setPortProp(edge.getSourcePortId()!, {
          attrs: { circle: { hover: false } },
        });
        const originColor = edge.getAttrByPath<string>('line/color');
        edge.attr('line/stroke', originColor);
        edge.removeTools();
      });

      graph.value.on('node:added', ({ node }) => {
        if (!graph.value) return;
        if (graph.value.getNodes().length > 1 && node.id !== 'GuideNode') {
          graph.value.removeCell('GuideNode', { history: false });
        }
        let data = Object.assign({}, node.getData());
        if (data.Title) {
          data.Title = `${data.Title.replace(/(\s#\d+)/, '')} #${increment++}`;
        }
        node.setData(data);
        setTimeout(() => {
          validNodes();
        }, 50);
      });
    }
  }
}

function setCurrentNode(nodeOrId?: Node | string) {
  if (!graph.value) return;
  graph.value.getNodes().forEach(async (node: Node) => {
    node.attr('.graph-node/focus', 'false');
  });
  let node: Cell;
  if (!nodeOrId) {
    currentNode.value = undefined;
    return;
  } else if (typeof nodeOrId === 'string') {
    node = graph.value.getCellById(nodeOrId);
  } else {
    node = nodeOrId;
  }
  if (!node.isNode() || node.shape === 'GuideNode') return;
  setTimeout(() => {
    currentNode.value = node;
    node.attr('.graph-node/focus', 'true');
  }, 50);
  const translate = graph.value.translate();
  const zoom = graph.value.zoom();
  const bbox = node.getBBox();
  if (
    (bbox.x + translate.tx) * zoom < 360 ||
    (bbox.y + translate.ty) * zoom < 10
  ) {
    graph.value.positionPoint({ x: bbox.x, y: bbox.y }, 380, 100);
  }
}

emitter.on('setCurrentNode', setCurrentNode);

function validNodes() {
  if (!graph.value) return;
  const connectedPort = graph.value.getEdges().map((edge) => {
    const originColor = edge.getAttrByPath<string>('line/color');
    edge.attr('line/stroke', originColor);
    edge.removeTools();
    return `${edge.getSourceCellId()}-${edge.getSourcePortId()}${
      edge.getTargetNode() ? '' : '-shortcut'
    }`;
  });
  graph.value.getNodes().forEach(async (node: Node) => {
    if (node.shape !== 'GuideNode') {
      const valid = await graphData.nodeValid(node.shape, node.getData());
      node.attr('.graph-node/error', `${!valid}`);
      // node.attr('.graph-node/focus', `${currentNode.value?.id === node.id}`)
      const ports = node.getPorts();
      ports.forEach((port) => {
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
    }
  });
}

function loadGraph(data: Model.ToJSONData & { increment?: number }) {
  if (!graph.value) return;
  graph.value.clearCells();
  increment = data.increment || 1;
  graph.value.fromJSON(data.cells);
  validNodes();
}

function toJSON() {
  const data = graph.value?.toJSON();
  data?.cells.forEach((cell) => {
    if (cell.attrs?.['.graph-node']?.focus) {
      cell.attrs['.graph-node'].focus = false;
    }
  });
  return Object.assign({ increment }, data);
}

// 节点仅保留一个 outgoing 边处理
function onlyOutgoingEdge({ edge }: { edge: Edge }) {
  if (graph.value && edge.getSourceCellId() && edge.getTargetCellId()) {
    edge.getSourceNode()?.setPortProp(edge.getSourcePortId()!, {
      attrs: { circle: { connected: true } },
    });
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
}

//#endregion
</script>
<style scoped>
.graph-drawer {
  width: 350px;
  height: 100%;
  position: absolute;
  overflow: auto;
  left: 0;
  top: 0;
  z-index: 1;
  background: white;
}
</style>
<style>
.edge-remove {
  --edge-remove-bg-color: white;
  cursor: pointer;
}
.edge-remove:hover {
  --edge-remove-bg-color: var(--pl-color-brand-light-9);
}
</style>
