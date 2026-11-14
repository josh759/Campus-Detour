// import './style.css'
// import { getRoute } from './routes.js'
// import { renderMap } from './map.js'

// document.querySelector('#app').innerHTML = `
//   <h1>Campus Detour</h1>
//   <div id="map"></div>
// `

// renderMap(
//   document.querySelector('#map'),
//   getRoute('union', 'library')
// )


import './style.css'
import { getRoute } from './routes.js'
import { renderMap } from './map.js'

document.querySelector('#app').innerHTML = `
  <h1>Campus Detour</h1>
  <button id="closure" type="button">Close path near The Beach</button>
  <p id="route-status"></p>
  <div id="map"></div>
`

let isClosed = false

function updateRoute() {
  const route = getRoute(
    'union',
    'library',
    isClosed ? ['c_d'] : []
  )

  renderMap(document.querySelector('#map'), route)
  document.querySelector('#route-status').textContent =
    isClosed ? 'Detour shown' : 'Usual route shown'
}

document.querySelector('#closure').addEventListener('click', () => {
  isClosed = !isClosed
  document.querySelector('#closure').textContent = isClosed
    ? 'Reopen path near The Beach'
    : 'Close path near The Beach'
  updateRoute()
})

updateRoute()