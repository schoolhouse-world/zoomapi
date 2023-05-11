import { WebinarDetails } from './webinars'
import { Meeting } from './meetings'
import { Registrant, ZoomOptions } from './common'
import { IncomingHttpHeaders } from 'http'
import crypto from 'crypto'

type Payload<T> = {
  account_id: string
  object: T
}
type ChangePayload<T> = {
  account_id: string
  object: T
  old_object: T
}
type Response<E, P> = {
  event: E
  payload: P
}
type WebhookResponse<E, T> = Response<E, Payload<T>>
type WebhookChangeResponse<E, T> = Response<E, ChangePayload<T>>

export type WebhookParticipant = {
  user_name: string
  user_id?: string
  id?: string
  join_time?: string
}

export type WebhookMeeting = Pick<
  Meeting,
  'duration' | 'start_time' | 'timezone' | 'topic' | 'id' | 'type' | 'uuid' | 'host_id'
>

export type WebhookMeetingWithParticipant = WebhookMeeting & {
  participant: WebhookParticipant
}

export type WebhookMeetingStarted = WebhookResponse<'meeting.started', WebhookMeeting>

export type WebhookJoinBeforeHost = WebhookResponse<'meeting.participant_jbh_joined', WebhookMeetingWithParticipant>

export type WebhookParticipantJoined = WebhookResponse<'meeting.participant_joined', WebhookMeetingWithParticipant>

export type WebhookParticipantLeft = WebhookResponse<'meeting.participant_left', WebhookMeetingWithParticipant>

export type WebhookMeetingEnded = WebhookResponse<'meeting.ended', WebhookMeeting>

export type WebhookWebinar = Pick<
  WebinarDetails,
  | 'id'
  | 'uuid'
  | 'host_id'
  | 'topic'
  | 'type'
  | 'start_time'
  | 'timezone'
  | 'duration'
  | 'password'
  | 'agenda'
  | 'occurrences'
  | 'recurrence'
  | 'settings'
  | 'registration_url'
>

export type WebhookWebinarCreated = WebhookResponse<'webinar.created', WebhookWebinar>

export type WebhookWebinarUpdated = WebhookChangeResponse<'webinar.updated', WebhookWebinar>

export type WebhookWebinarDeleted = WebhookResponse<'webinar.deleted', WebhookWebinar>

export type WebhookWebinarRegistrant = WebhookWebinar & {
  registrant: Registrant
}

export type WebhookWebinarRegistrationCreated = WebhookResponse<'webinar.registration_created', WebhookWebinarRegistrant>

export type WebhookWebinarRegistrationApproved = WebhookResponse<'webinar.registration_approved', WebhookWebinarRegistrant>

export type WebhookWebinarRegistrationDenied = WebhookResponse<'webinar.registration_denied', WebhookWebinarRegistrant>

export type WebhookWebinarRegistrationCancelled = WebhookResponse<'webinar.registration_cancelled', WebhookWebinarRegistrant>

export type WebhookEndpointValidation = Response<'endpoint.url_validation', { plainToken: string }>

export type WebhookEvent =
  | WebhookMeetingStarted
  | WebhookJoinBeforeHost
  | WebhookParticipantJoined
  | WebhookParticipantLeft
  | WebhookMeetingEnded
  | WebhookWebinarCreated
  | WebhookWebinarUpdated
  | WebhookWebinarDeleted
  | WebhookWebinarRegistrationCreated
  | WebhookWebinarRegistrationApproved
  | WebhookWebinarRegistrationDenied
  | WebhookWebinarRegistrationCancelled
  | WebhookEndpointValidation

export type VerifyWebhookEventParams = {
  headers: IncomingHttpHeaders
  webhook: WebhookEvent
}
export default function (zoomApiOpts: ZoomOptions) {
  const VerifyWebhookEvent = function (params: VerifyWebhookEventParams) {
    if (!zoomApiOpts.webhookSecretToken) {
      throw new Error('Missing webhookSecretToken')
    }
    const message = `v0:${params.headers['x-zm-request-timestamp']}:${JSON.stringify(params.webhook)}`

    const hashForVerify = crypto.createHmac('sha256', zoomApiOpts.webhookSecretToken).update(message).digest('hex')

    const signature = `v0=${hashForVerify}`

    if (params.headers['x-zm-signature'] === signature) {
      return true
    } else {
      return false
    }
  }
  const GetEndpointValidationResponse = function (webhook: WebhookEvent) {
    if (!zoomApiOpts.webhookSecretToken) {
      throw new Error('Missing webhookSecretToken')
    }
    if (webhook.event !== 'endpoint.url_validation') {
      return null
    }
    const hashForValidate = crypto
      .createHmac('sha256', zoomApiOpts.webhookSecretToken)
      .update(webhook.payload.plainToken)
      .digest('hex')
    return {
      plainToken: webhook.payload.plainToken,
      encryptedToken: hashForValidate,
    }
  }

  return {
    VerifyWebhookEvent,
    GetEndpointValidationResponse,
  }
}
