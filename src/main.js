import './style.css'
import { getRoute } from './routes.js'
import { renderMap } from './map.js'

const places = [
  ['union', 'University Union'],
  ['burdick', 'Burdick Hall'],
  ['liberal', 'Liberal Arts'],
  ['library', 'Albert S. Cook Library'],
]

const WALK_METERS_PER_MIN = 84 // about 3.1 mph, a typical walking pace

const labelOf = (id) => places.find(([key]) => key === id)[1]

function walkMinutes(meters) {
  if (meters === 0) return 0
  return Math.max(1, Math.round(meters / WALK_METERS_PER_MIN))
}

function formatDistance(meters) {
  const feet = Math.round(meters * 3.28084)
  return `${meters} m <small>(${feet.toLocaleString()} ft)</small>`
}

const options = (selected) =>
    places
        .map(
            ([id, label]) =>
                `<option value="${id}" ${id === selected ? 'selected' : ''}>${label}</option>`
        )
        .join('')

document.querySelector('#app').innerHTML = `
  <h1>Campus Detour</h1>

  <div class="menus">
    <label>
      <span>From</span>
      <select id="start">${options('union')}</select>
    </label>
    <label>
      <span>To</span>
      <select id="destination">${options('library')}</select>
    </label>
  </div>

  <button id="closure" type="button">Close path near The Beach</button>
  <p id="route-status"></p>

  <div class="stats">
    <div class="stat">
      <span class="stat-label">Distance</span>
      <strong id="stat-distance">–</strong>
    </div>
    <div class="stat">
      <span class="stat-label">Walking time</span>
      <strong id="stat-time">–</strong>
    </div>
  </div>

  <div id="map"></div>

  <section class="trips">
    <h2 id="trips-title"></h2>
    <ul id="trips"></ul>
  </section>
`

let isClosed = false

const startEl = document.querySelector('#start')
const destEl = document.querySelector('#destination')

function updateTrips(start, closedEdgeIds) {
  document.querySelector('#trips-title').textContent =
      `From ${labelOf(start)}`

  document.querySelector('#trips').innerHTML = places
      .filter(([id]) => id !== start)
      .map(([id, label]) => {
        const trip = getRoute(start, id, closedEdgeIds)
        const detail =
            trip.status === 'ok'
                ? `<span>${trip.meters} m</span><span>${walkMinutes(trip.meters)} min</span>`
                : `<span class="none">No route</span>`
        return `
        <li>
          <button type="button" data-id="${id}" class="${id === destEl.value ? 'active' : ''}">
            <b>${label}</b>
            <span class="trip-detail">${detail}</span>
          </button>
        </li>
      `
      })
      .join('')
}

function updateRoute() {
  const start = startEl.value
  const destination = destEl.value
  const closedEdgeIds = isClosed ? ['c_d'] : []
  const route = getRoute(start, destination, closedEdgeIds)

  renderMap(document.querySelector('#map'), route, closedEdgeIds)

  const status = document.querySelector('#route-status')
  const distance = document.querySelector('#stat-distance')
  const time = document.querySelector('#stat-time')

  if (start === destination) {
    status.textContent = 'Pick two different places'
    distance.textContent = '–'
    time.textContent = '–'
  } else if (route.status === 'no_route') {
    status.textContent = 'No route available'
    distance.textContent = '–'
    time.textContent = '–'
  } else {
    status.textContent = isClosed ? 'Detour shown' : 'Usual route shown'
    distance.innerHTML = formatDistance(route.meters)
    time.textContent = `${walkMinutes(route.meters)} min`
  }

  updateTrips(start, closedEdgeIds)
}

startEl.addEventListener('change', updateRoute)
destEl.addEventListener('change', updateRoute)

document.querySelector('#trips').addEventListener('click', (event) => {
  const button = event.target.closest('button[data-id]')
  if (!button) return
  destEl.value = button.dataset.id
  updateRoute()
})

document.querySelector('#closure').addEventListener('click', () => {
  isClosed = !isClosed
  document.querySelector('#closure').textContent = isClosed
      ? 'Reopen path near The Beach'
      : 'Close path near The Beach'
  updateRoute()
})

updateRoute()