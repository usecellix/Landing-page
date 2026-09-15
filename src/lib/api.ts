import { apiBaseUrl } from '@/config/site'

/**
 * Thin client over cellix_backend for the signed-in app surface (/app/*).
 *
 * Every call sends `credentials: 'include'` because auth is Better Auth's
 * httpOnly session cookie, set by the backend origin — not a token this app
 * can hold. That one fact shapes the whole design: there is nothing in
 * localStorage to read, so "am I signed in?" is always a question for the
 * server, never something the client answers from its own state.
 */

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly body: unknown

  constructor(message: string, status: number, body?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.body = body
    const maybeCode = (body as { code?: unknown } | undefined)?.code
    this.code = typeof maybeCode === 'string' ? maybeCode : undefined
  }

  /** The backend's 402 from WebChatController — drives the upgrade prompt. */
  get isInsufficientCredit(): boolean {
    return this.status === 402 || this.code === 'INSUFFICIENT_CREDIT'
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }
}

async function request<T>(
  path: string,
  init: RequestInit & { parseJson?: boolean } = {},
): Promise<T> {
  const { parseJson = true, ...rest } = init

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...rest,
    credentials: 'include',
    headers: {
      ...(rest.body ? { 'Content-Type': 'application/json' } : {}),
      ...rest.headers,
    },
  })

  if (!response.ok) {
    let body: unknown
    try {
      body = await response.json()
    } catch {
      body = undefined
    }
    const message = (body as { message?: unknown } | undefined)?.message
    throw new ApiError(
      typeof message === 'string' ? message : `Request failed (${response.status})`,
      response.status,
      body,
    )
  }

  if (!parseJson || response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}

export const api = {
  get: <T,>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T,>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  patch: <T,>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  delete: (path: string) => request<void>(path, { method: 'DELETE', parseJson: false }),
}
