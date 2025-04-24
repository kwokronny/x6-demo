import { register } from "@antv/x6-vue-shape";
import TriggerNode from "./components/TriggerNode.vue";
import MessageNode from "./components/MessageNode.vue";
import GuideNode from "./components/GuideNode.vue";
import ConditionNode from "./components/ConditionNode.vue";
import { EdgeView, Graph, Path } from "@antv/x6";
import { GRAPH_NODE_PADDING } from "./util";

export const portStyles = (color = "var(--edge-border)") => {
  return {
    circle: {
      class: "graph-port",
      color,
      style: `--port-color: ${color};`,
      magnet: true,
      r: 7,
    },
  };
};

register({
  shape: "TriggerNode",
  width: 362,
  component: TriggerNode,
  ports: {
    groups: {
      then: {
        position: {
          name: "absolute",
        },
        attrs: portStyles(),
      },
    },
  },
});

register({
  shape: "MessageNode",
  width: 362,
  component: MessageNode,
  ports: {
    groups: {
      then: {
        position: {
          name: "absolute",
        },
        attrs: portStyles(),
      },
    },
  },
});

register({
  shape: "ConditionNode",
  width: 362,
  component: ConditionNode,
  ports: {
    groups: {
      then: {
        position: {
          name: "absolute",
        },
        attrs: portStyles("var(--edge-success)"),
      },
      else: {
        position: {
          name: "absolute",
        },
        attrs: portStyles("var(--edge-danger)"),
      },
    },
  },
});

register({
  shape: "GuideNode",
  width: 362,
  component: GuideNode,
  ports: {
    groups: {
      then: {
        position: {
          name: "absolute",
        },
        attrs: portStyles(),
      },
    },
  },
});

// 注册连线样式
Graph.registerConnector(
  "curveConnector",
  function (...args) {
    const { targetPoint: e, sourcePoint: s } = args[4];
    let offset = Math.abs(e.x - s.x);
    offset = offset < 100 ? 100 : offset;
    return Path.normalize(
      `M ${s.x} ${s.y} C ${s.x + offset} ${s.y} ${e.x - offset} ${e.y} ${
        e.x - 4
      } ${e.y}`
    );
  },
  true
);

// 注册线连接端点连接时的锚点
Graph.registerAnchor("port-right", function (view, magnet) {
  const bbox = view.getBBoxOfElement(magnet);
  const result = bbox.getRightMiddle();
  return result;
});

// 注册线连接节点连接时的锚点
Graph.registerAnchor("node-left", function (view, magnet) {
  const bbox = view.getBBoxOfElement(magnet);
  const result = bbox.getTopLeft();
  result.x = bbox.x + GRAPH_NODE_PADDING;
  result.y = bbox.y + 25 + GRAPH_NODE_PADDING;
  return result;
});

// 注册连线的箭头样式
Graph.registerMarker("arrow-storke", () => {
  return {
    tagName: "path",
    strokeWidth: 3,
    width: 14,
    height: 14,
    d: "M7 -7L0 0L7 7",
    strokeLinecap: "round",
    fill: "none",
  };
});

// 注册主题样式的连线样式
Graph.registerEdge("graph-edge", {
  inherit: "edge",
  attrs: {
    line: {
      class: "graph-edge",
      color: "var(--edge-border)",
      stroke: "var(--edge-border)",
      strokeWidth: 3,
      strokeLinecap: "round",
      targetMarker: "arrow-storke",
    },
  },
});

Graph.registerEdgeTool("edge-remove", {
  inherit: "button",
  className: "edge-remove",
  markup: [
    {
      tagName: "g",
      attrs: {
        filter: "url(#drop_shadow)",
      },
      children: [
        {
          tagName: "rect",
          attrs: {
            x: -17,
            y: -17,
            width: 34,
            height: 34,
            rx: 8,
          },
        },
        {
          tagName: "path",
          attrs: {
            fill: "#F03D3D",
            stroke: "#F03D3D",
            strokeWidth: "0.1",
            strokeLinecap: "round",
            d: "m1.56,-6.79c0.18,0 0.33,0.16 0.33,0.34l0,0.73l-3.78,0l0,-0.73c0,-0.18 0.15,-0.34 0.33,-0.34l3.12,0zm-4.72,0.34l0,0.73l-3.26,0c-0.35,0 -0.63,0.28 -0.63,0.63c0,0.35 0.28,0.63 0.63,0.63l0.93,0l0,10.46c0,0.89 0.71,1.61 1.6,1.61l7.78,0c0.89,0 1.6,-0.72 1.6,-1.61l0,-10.46l0.93,0c0.35,0 0.63,-0.28 0.63,-0.63c0,-0.35 -0.28,-0.63 -0.63,-0.63l-3.26,0l0,-0.73c0,-0.88 -0.72,-1.6 -1.6,-1.6l-3.12,0c-0.88,0 -1.6,0.72 -1.6,1.6zm7.39,1.99l0,10.46c0,0.19 -0.15,0.34 -0.34,0.34l-7.78,0c-0.19,0 -0.34,-0.15 -0.34,-0.34l0,-10.46l8.46,0zm-3.11,1.7l0,7.37c0,0.35 0.28,0.63 0.63,0.63c0.35,0 0.63,-0.28 0.63,-0.63l0,-7.37c0,-0.35 -0.28,-0.63 -0.63,-0.63c-0.35,0 -0.63,0.28 -0.63,0.63zm-3.5,0l0,7.37c0,0.35 0.28,0.63 0.63,0.63c0.35,0 0.63,-0.28 0.63,-0.63l0,-7.37c0,-0.35 -0.28,-0.63 -0.63,-0.63c-0.35,0 -0.63,0.28 -0.63,0.63z",
          },
        },
      ],
    },
    {
      tagName: "filter",
      attrs: {
        id: "drop_shadow",
        width: 46,
        height: 46,
      },
      children: [
        {
          tagName: "feDropShadow",
          attrs: {
            stdDeviation: 6,
            dx: 0,
            dy: 3,
            floodColor: "rgba(0,0,0,.12)",
          },
        },
      ],
    },
  ],
  onClick({ view }: { view: EdgeView }) {
    view.cell.removeTools();
    view.cell.remove();
  },
});
