import './style.css'
import { renderMap } from './map.js'
import { mountRouteFinder } from './routeFinder.js'

document.querySelector('#app').innerHTML = `
  <h1>Campus Detour</h1>
  <div id="route-finder"></div>
  <div id="map"></div>
`

const map = document.querySelector('#map')
renderMap(map, { nodes: [] }, [])
mountRouteFinder(document.querySelector('#route-finder'), (route, closedEdgeIds) => {
  renderMap(map, route, closedEdgeIds)
})
