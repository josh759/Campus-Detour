// Coordinates refer to the 1344 × 630 campus map.
// These are draft demo points; check them against the actual walkways.
export const nodes = {
  union:    { x: 439, y: 281 },
  burdick:  { x: 332, y: 193 },
  liberal:  { x: 620, y: 152 },
  library:  { x: 886, y: 350 },
  a:        { x: 499, y: 281 },
  b:        { x: 523, y: 213 },
  c:        { x: 694, y: 312 },
  d:        { x: 846, y: 343 },
  e:        { x: 847, y: 279 },
};

export const edges = [
  { id: "union_a", from: "union", to: "a", meters: 60 },
  { id: "a_c", from: "a", to: "c", meters: 200 },
  { id: "c_d", from: "c", to: "d", meters: 160 },
  { id: "d_library", from: "d", to: "library", meters: 45 },

  // Alternate route when c_d is closed.
  { id: "union_b", from: "union", to: "b", meters: 115 },
  { id: "b_e", from: "b", to: "e", meters: 350 },
  { id: "e_d", from: "e", to: "d", meters: 85 },

  // Other demo buildings.
  { id: "burdick_b", from: "burdick", to: "b", meters: 150 },
  { id: "liberal_b", from: "liberal", to: "b", meters: 130 },
];

export function getRoute(start, destination, closedEdgeIds = []) {
  if (!nodes[start] || !nodes[destination]) {
    return { nodes: [], meters: 0, status: "no_route" };
  }

  const closed = new Set(closedEdgeIds);
  const distances = Object.fromEntries(
    Object.keys(nodes).map((id) => [id, Infinity])
  );
  const previous = {};
  const unvisited = new Set(Object.keys(nodes));

  distances[start] = 0;

  while (unvisited.size > 0) {
    let current = null;

    for (const id of unvisited) {
      if (current === null || distances[id] < distances[current]) {
        current = id;
      }
    }

    if (distances[current] === Infinity) break;
    if (current === destination) break;

    unvisited.delete(current);

    for (const edge of edges) {
      if (closed.has(edge.id)) continue;

      let neighbor = null;
      if (edge.from === current) neighbor = edge.to;
      if (edge.to === current) neighbor = edge.from;
      if (!neighbor || !unvisited.has(neighbor)) continue;

      const newDistance = distances[current] + edge.meters;

      if (newDistance < distances[neighbor]) {
        distances[neighbor] = newDistance;
        previous[neighbor] = current;
      }
    }
  }

  if (distances[destination] === Infinity) {
    return { nodes: [], meters: 0, status: "no_route" };
  }

  const path = [];
  for (let id = destination; id !== undefined; id = previous[id]) {
    path.unshift(id);
  }

  return {
    nodes: path,
    meters: distances[destination],
    status: "ok",
  };
}