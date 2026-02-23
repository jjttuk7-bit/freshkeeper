// FreshKeeper Service Worker - Push Notifications

self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', (event) => {
  if (!event.data) return

  let data
  try {
    data = event.data.json()
  } catch {
    data = { title: 'FreshKeeper', body: event.data.text() }
  }

  const { title = 'FreshKeeper', body = '', icon, tag, data: payload } = data

  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: icon || '/icons/icon-192.png',
      badge: '/icons/icon-72.png',
      tag: tag || 'freshkeeper-notification',
      data: payload || {},
      actions: getActionsForType(payload?.type),
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const payload = event.notification.data || {}
  let url = '/'

  switch (payload.type) {
    case 'expiry_d3':
    case 'expiry_d1':
    case 'expiry_today':
      url = payload.ingredientId ? `/fridge/${payload.ingredientId}` : '/fridge'
      break
    case 'weekly_summary':
      url = '/fridge'
      break
    case 'recipe':
      url = payload.recipeId ? `/chef/recipe/${payload.recipeId}` : '/chef'
      break
    case 'shopping':
      url = '/shopping'
      break
    default:
      url = '/fridge'
  }

  if (event.action === 'view_recipe') {
    url = '/chef'
  }

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    })
  )
})

function getActionsForType(type) {
  switch (type) {
    case 'expiry_d3':
    case 'expiry_d1':
    case 'expiry_today':
      return [
        { action: 'view_recipe', title: '레시피 보기' },
        { action: 'open', title: '냉장고 열기' },
      ]
    default:
      return [{ action: 'open', title: '열기' }]
  }
}
