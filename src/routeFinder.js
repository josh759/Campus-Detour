import { getRoute } from './routes.js'
export function mountRouteFinder(container) {
    const buildings = [
        { id: 'union', name: 'Union'},
        { id: 'burdick', name: 'Burdick Hall'},
        { id: 'liberal', name: 'Liberal Arts' },
        { id: 'library', name: 'Library' },
    ]
    
    const options = buildings
      .map(({ id, name}) => `<option value="${id}">${name}</option>`)
      .join('')
    
    container.innerHTML = `
      <section class="route-finder">
        <h2>Find a campus route</h2>

        <form id="route-form">
          <label for="start-building">Starting building</label>
        <select id="start-building" name="start" required>
          <option value="" selected disabled>Choose a start</option>
          ${options}
        </select>

        <label for="destination-building">Destination</label>
        <select id="destination-building" name="destination" required>
          <option value="" selected disabled>Choose a destination</option>
          ${options}
        </select>

        <label for="closure-toggle">
          <input id="closure-toggle" type="checkbox">
          Apply the agreed path closure
        </label>

        <button type="submit">Find Route</button>
        <p id="route-message" role="status" aria-live="polite"></p>
      </form>

      <section id="route-details" class="route-details" hidden aria-live="polite">
        <h3>Route details</h3>
        <p>Destination: <span id="detail-destination"></span></p>
        <p>Approximate distance: <span id="detail-distance"></span></p>
        <p>Approximate walking time: <span id="detail-time"></span></p>
        <p id="detail-closure"></p>
        <button id="reset-route" type="button">Reset</button>
      </section>
    `

  const form = container.querySelector('#route-form')
  const start = container.querySelector('#start-building')
  const destination = container.querySelector('#destination-building')
  const message = container.querySelector('#route-message')
  const closureToggle = container.querySelector('#closure-toggle')
  const routeDetails = container.querySelector('#route-details')
  const detailDestination = container.querySelector('#detail-destination')
  const detailDistance = container.querySelector('#detail-distance')
  const detailTime = container.querySelector('#detail-time')
  const detailClosure = container.querySelector('#detail-closure')
  const resetRoute = container.querySelector('#reset-route')

  form.addEventListener('submit', (event) => {
    event.preventDefault()

    if (start.value === destination.value) {
      message.textContent = 'Choose two different buildings.'
      return
    }

    // routes.js identifies c_d as the sample closed edge.
    const closedEdgeIds = closureToggle.checked ? ['c_d'] : []
    const result = getRoute(start.value, destination.value, closedEdgeIds)

    if (result.status === 'no_route') {
      message.textContent = 'No route is available for that selection.'
      return
    }

    message.textContent = `Route found: ${result.meters} meters.`
    routeDetails.removeAttribute('hidden')
    detailDestination.textContent = destination.options[destination.selectedIndex].text
    detailDistance.textContent = `${result.meters} meters`
    const walkingSpeedMetersPerSecond = 1.4
    const minutes = Math.ceil(result.meters / (walkingSpeedMetersPerSecond * 60))
    detailTime.textContent = `~${minutes} minutes (assuming 1.4 m/s)`
    detailClosure.textContent = closureToggle.checked ? 'The agreed path closure is applied.' : 'The agreed path closure is not applied.'
  })

  resetRoute.addEventListener('click', () => {
    form.reset()
    routeDetails.hidden = true
    message.textContent = ''
  })
}



