import meetings from './meetings.js'
import metrics from './metrics.js'
import recordings from './recordings.js'
import reports from './reports.js'
import users from './users.js'
import webinars from './webinars.js'
import webhooks from './webhooks.js'
import oauth from './oauth.js'

import { ZoomOptions } from './common.js'
import request from './util/request.js'

export default function (zoomApiOpts: ZoomOptions) {
  const zoomRequest = request(zoomApiOpts)

  return {
    meetings: meetings(zoomRequest),
    metrics: metrics(zoomRequest),
    recordings: recordings(zoomRequest),
    reports: reports(zoomRequest),
    users: users(zoomRequest),
    webinars: webinars(zoomRequest),
    webhooks: webhooks(zoomApiOpts),
    oauth: oauth(zoomApiOpts),
  }
}

export * from './common.js'
export * from './meetings.js'
export * from './metrics.js'
export * from './recordings.js'
export * from './reports.js'
export * from './users.js'
export * from './webhooks.js'
export * from './webinars.js'
export * from './oauth.js'
