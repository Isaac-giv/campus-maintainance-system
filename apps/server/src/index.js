// apps/server/src/index.js
// Server entry point. Loads env, starts Express, binds port.

import { createApp } from './app.js'
import { env } from './config/env.js'

const app = createApp()

app.listen(env.PORT, () => {
  console.log(
    `[server] Campus Maintenance API running on port ${env.PORT} (${env.NODE_ENV})`
  )
})
