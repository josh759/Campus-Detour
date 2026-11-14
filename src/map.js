import { edges } from './routes.js'

// Map-specific anchors use visible paths or building edges rather than the
// draft graph coordinates, some of which fall inside buildings.
const anchors = {
  union: [435, 319],
  burdick: [330, 190],
  liberal: [480, 176],
  library: [878, 349],
  a: [468, 280],
  b: [511, 219],
  c: [667, 307],
  d: [837, 337],
  e: [850, 291],
}

const buildings = [
  ['union', 'Union'],
  ['burdick', 'Burdick'],
  ['liberal', 'Liberal Arts'],
  ['library', 'Library'],
]

// Intermediate points are in edge.from -> edge.to order.
// The plaza paths on c_d and the approaches to b and the two other buildings
// are approximate and should be checked on the ground.
const edgeGeometry = {
  union_a: [[452, 298], [465, 280]],
  a_c: [[490, 281], [523, 280], [545, 283], [580, 289],
    [610, 295], [642, 302]],
  c_d: [[684, 311], [691, 320], [706, 342], [736, 321], [747, 313],
    [775, 320], [800, 327], [824, 335]],
  d_library: [[846, 343], [861, 346]],
  union_b: [[452, 298], [465, 280], [475, 266], [490, 247]],
  b_e: [[527, 220], [538, 214], [579, 224], [620, 234], [660, 244],
    [700, 254], [741, 264], [780, 274], [812, 282]],
  e_d: [[849, 323], [844, 330]],
  burdick_b: [[341, 194], [356, 199], [358, 205], [400, 211],
    [440, 216], [473, 224], [496, 221]],
  liberal_b: [[485, 185], [480, 196], [492, 207]],
}

function routeSegments(path) {
  return path.slice(0, -1).map((from, index) => {
    const to = path[index + 1]
    const edge = edges.find(
      (item) =>
        (item.from === from && item.to === to) ||
        (item.from === to && item.to === from)
    )

    if (!edge || !edgeGeometry[edge.id] || !anchors[edge.from] || !anchors[edge.to]) {
      throw new Error(`Missing map geometry for route segment ${from} -> ${to}`)
    }

    const points = [
      anchors[edge.from],
      ...edgeGeometry[edge.id],
      anchors[edge.to],
    ]
    if (from !== edge.from) points.reverse()

    return points.map(([x, y]) => `${x},${y}`).join(' ')
  })
}

export function renderMap(container, route, closedEdgeIds = []) {
  const segments = routeSegments(route.nodes)
  const isDetour = closedEdgeIds.includes('c_d')

  container.innerHTML = `
    <div class="campus-map">
      <img src="/campus-map.png" alt="Towson campus map" />

      <svg viewBox="0 0 1344 630" role="img" aria-label="${isDetour ? 'Detour route with path closure' : 'Campus route'}">
        ${segments.map((points) => `
          <polyline class="route-outline" points="${points}" />
        `).join('')}
        ${segments.map((points) => `
          <polyline class="route-line ${isDetour ? 'detour' : ''}" points="${points}" />
        `).join('')}

        ${isDetour ? `
          <g class="closure-marker" aria-label="Path near The Beach closed">
            <title>Path near The Beach closed</title>
            <path class="closure-outline" d="M 781 317 L 799 335 M 799 317 L 781 335" />
            <path class="closure-cross" d="M 781 317 L 799 335 M 799 317 L 781 335" />
          </g>
        ` : ''}

        ${buildings.map(([id, label]) => `
          <g>
            <circle class="building-pin" cx="${anchors[id][0]}" cy="${anchors[id][1]}" r="8" />
            <title>${label}</title>
          </g>
        `).join('')}
      </svg>
    </div>
  `
}
