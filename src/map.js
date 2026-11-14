import { nodes } from './routes.js'

const buildings = [
  ['union', 'Union'],
  ['burdick', 'Burdick'],
  ['liberal', 'Liberal Arts'],
  ['library', 'Library'],
]

export function renderMap(container, route) {
  const points = route.nodes
    .map((id) => `${nodes[id].x},${nodes[id].y}`)
    .join(' ')

  container.innerHTML = `
    <div class="campus-map">
      <img src="/campus-map.png" alt="Towson campus map" />

      <svg viewBox="0 0 1344 630" aria-label="Campus route">
        <polyline class="route-outline" points="${points}" />
        <polyline class="route-line" points="${points}" />

        ${buildings.map(([id, label]) => `
          <g>
            <circle class="building-pin" cx="${nodes[id].x}" cy="${nodes[id].y}" r="8" />
            <title>${label}</title>
          </g>
        `).join('')}
      </svg>
    </div>
  `
}