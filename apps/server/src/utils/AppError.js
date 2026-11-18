// apps/server/src/utils/AppError.js
// Operational error class for the Express application.
//
// Throw AppError for all expected, handleable errors (auth failures, not found,
// validation issues, state-machine violations).
// The global error handler in error.middleware.js serialises these into
// consistent JSON responses.

export class AppError extends Error {
  /**
   * @param {string} message - Human-readable error description.
   * @param {number} statusCode - HTTP status code to send to the client.
   * @param {Array|null} [details] - Optional structured field-level details (Zod errors).
   */
  constructor(message, statusCode = 500, details = null) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.details = details
    // Maintains proper stack trace in V8 engines
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError)
    }
  }
}
