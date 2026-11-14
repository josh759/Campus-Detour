import { getRoute } from './routes.js'
export function mountRouteFinder(container, onRouteChange) {
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
          Apply the demo path closure
        </label>

        <button type="submit">Find Route</button>
        <p id="route-message" role="status" aria-live="polite"></p>
      </form>

      <section id="route-details" class="route-details" hidden aria-live="polite">
        <h3>Demo route estimate</h3>
        <dl class="route-details-list">
          <div><dt>Start</dt><dd id="detail-start"></dd></div>
          <div><dt>Destination</dt><dd id="detail-destination"></dd></div>
          <div><dt>Estimated distance</dt><dd id="detail-distance"></dd></div>
          <div><dt>Estimated walking time</dt><dd id="detail-time"></dd></div>
          <div><dt>Demo closure</dt><dd id="detail-closure"></dd></div>
        </dl>
        <p class="route-disclaimer">Routes and distances are demo estimates, not live closure information or verified accessible routes.</p>
        <button id="reset-route" type="button">Reset</button>
      </section>
      </section>
    `

  const form = container.querySelector('#route-form')
  const start = container.querySelector('#start-building')
  const destination = container.querySelector('#destination-building')
  const message = container.querySelector('#route-message')
  const closureToggle = container.querySelector('#closure-toggle')
  const routeDetails = container.querySelector('#route-details')
  const detailStart = container.querySelector('#detail-start')
  const detailDestination = container.querySelector('#detail-destination')
  const detailDistance = container.querySelector('#detail-distance')
  const detailTime = container.querySelector('#detail-time')
  const detailClosure = container.querySelector('#detail-closure')
  const resetRoute = container.querySelector('#reset-route')

  let hasRoute = false

  function updateRoute() {
    const closedEdgeIds = closureToggle.checked ? ['c_d'] : []
    if (start.value === destination.value) {
      message.textContent = 'Choose two different buildings.'
      routeDetails.hidden = true
      hasRoute = false
      onRouteChange({ nodes: [] }, closedEdgeIds)
      return
    }

    const result = getRoute(start.value, destination.value, closedEdgeIds)

    if (result.status === 'no_route') {
      message.textContent = 'No route is available for that selection.'
      routeDetails.hidden = true
      hasRoute = false
      onRouteChange(result, closedEdgeIds)
      return
    }

    hasRoute = true
    onRouteChange(result, closedEdgeIds)
    message.textContent = 'Demo route estimate ready.'
    routeDetails.removeAttribute('hidden')
    detailStart.textContent = start.options[start.selectedIndex].text
    detailDestination.textContent = destination.options[destination.selectedIndex].text
    detailDistance.textContent = `${result.meters} meters`
    const walkingSpeedMetersPerSecond = 1.4
    const minutes = Math.ceil(result.meters / (walkingSpeedMetersPerSecond * 60))
    detailTime.textContent = `~${minutes} minutes (assuming 1.4 m/s)`
    detailClosure.textContent = closureToggle.checked ? 'Applied' : 'Not applied'
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault()
    updateRoute()
  })

  closureToggle.addEventListener('change', () => {
    if (hasRoute) {
      updateRoute()
    } else {
      onRouteChange({ nodes: [] }, closureToggle.checked ? ['c_d'] : [])
    }
  })

  for (const select of [start, destination]) {
    select.addEventListener('change', () => {
      if (!hasRoute) return
      hasRoute = false
      routeDetails.hidden = true
      message.textContent = ''
      onRouteChange({ nodes: [] }, closureToggle.checked ? ['c_d'] : [])
    })
  }

  resetRoute.addEventListener('click', () => {
    form.reset()
    hasRoute = false
    routeDetails.hidden = true
    message.textContent = ''
    onRouteChange({ nodes: [] }, [])
  })
}
