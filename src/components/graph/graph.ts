import { EdgeView, Graph, Path } from '@antv/x6'
import { register } from '@antv/x6-vue-shape'



// 注册连线样式
Graph.registerConnector(
  'curveConnector',
  function (...args) {
    const { targetPoint: e, sourcePoint: s } = args[4]
    let offset = Math.abs(e.x - s.x)
    offset = offset < 100 ? 100 : offset
    return Path.normalize(
      `M ${s.x} ${s.y} C ${s.x + offset} ${s.y} ${e.x - offset} ${e.y} ${e.x - 4} ${e.y}`
    )
  },
  true
)

// 注册高亮节点
Graph.registerHighlighter('hover', {
  highlight(cellView) {
    cellView.cell.attr('.graph-node/focus', true)
  },
  unhighlight(cellView) {
    cellView.cell.attr('.graph-node/focus', false)
    // NodeUtil.removeClass(cellView.cell, 'hover')
  }
})

// 注册连接
Graph.registerAnchor('port', function (view, magnet) {
  const bbox = view.getBBoxOfElement(magnet)
  const result = bbox.getRightMiddle()
  return result
})

Graph.registerAnchor('node-left', function (view, magnet) {
  const bbox = view.getBBoxOfElement(magnet)
  const result = bbox.getTopLeft()
  result.x = bbox.x + GRAPH_NODE_PADDING
  result.y = bbox.y + GRAPH_NODE_PADDING + 25
  return result
})


Graph.registerMarker('arrow-storke', () => {
  return {
    tagName: 'path',
    strokeWidth: 3,
    width: 14,
    height: 14,
    d: 'M7 -7L0 0L7 7',
    strokeLinecap: 'round',
    fill: 'none'
  }
})

Graph.registerEdge('chat-edge', {
  inherit: 'edge',
  attrs: {
    line: {
      class: 'chat-edge',
      color: 'var(--pl-color-border)',
      stroke: 'var(--pl-color-border)',
      strokeWidth: 3,
      strokeLinecap: 'round',
      targetMarker: 'arrow-storke'
    }
  }
})

Graph.registerEdgeTool('edge-remove', {
  inherit: 'button',
  className: 'edge-remove',
  markup: [
    {
      tagName: 'g',
      attrs: {
        filter: 'url(#drop_shadow)'
      },
      children: [
        {
          tagName: 'rect',
          attrs: {
            x: -17,
            y: -17,
            width: 34,
            height: 34,
            rx: 8,
            fill: 'var(--edge-remove-bg-color)'
          }
        },
        {
          tagName: 'path',
          attrs: {
            fill: '#F03D3D',
            stroke: '#F03D3D',
            strokeWidth: '0.1',
            strokeLinecap: 'round',
            d: 'm1.56,-6.79c0.18,0 0.33,0.16 0.33,0.34l0,0.73l-3.78,0l0,-0.73c0,-0.18 0.15,-0.34 0.33,-0.34l3.12,0zm-4.72,0.34l0,0.73l-3.26,0c-0.35,0 -0.63,0.28 -0.63,0.63c0,0.35 0.28,0.63 0.63,0.63l0.93,0l0,10.46c0,0.89 0.71,1.61 1.6,1.61l7.78,0c0.89,0 1.6,-0.72 1.6,-1.61l0,-10.46l0.93,0c0.35,0 0.63,-0.28 0.63,-0.63c0,-0.35 -0.28,-0.63 -0.63,-0.63l-3.26,0l0,-0.73c0,-0.88 -0.72,-1.6 -1.6,-1.6l-3.12,0c-0.88,0 -1.6,0.72 -1.6,1.6zm7.39,1.99l0,10.46c0,0.19 -0.15,0.34 -0.34,0.34l-7.78,0c-0.19,0 -0.34,-0.15 -0.34,-0.34l0,-10.46l8.46,0zm-3.11,1.7l0,7.37c0,0.35 0.28,0.63 0.63,0.63c0.35,0 0.63,-0.28 0.63,-0.63l0,-7.37c0,-0.35 -0.28,-0.63 -0.63,-0.63c-0.35,0 -0.63,0.28 -0.63,0.63zm-3.5,0l0,7.37c0,0.35 0.28,0.63 0.63,0.63c0.35,0 0.63,-0.28 0.63,-0.63l0,-7.37c0,-0.35 -0.28,-0.63 -0.63,-0.63c-0.35,0 -0.63,0.28 -0.63,0.63z'
          }
        }
      ]
    },
    {
      tagName: 'filter',
      attrs: {
        id: 'drop_shadow',
        width: 46,
        height: 46
      },
      children: [
        {
          tagName: 'feDropShadow',
          attrs: {
            stdDeviation: 6,
            dx: 0,
            dy: 3,
            floodColor: 'rgba(0,0,0,.12)'
          }
        }
      ]
    }
  ],
  onClick({ view }: { view: EdgeView }) {
    view.cell.removeTools()
    view.cell.remove()
  }
})