import { isProduction } from "../config.js";
import { HttpError } from "../utils/errors.js";

export function notFoundHandler(req, res) {
  res.status(404).json({ error: `No API route for ${req.method} ${req.path}` });
}

// Known errors return their message; anything unexpected is logged and hidden from the client.
// eslint-disable-next-line no-unused-vars -- Express identifies error handlers by their 4 arguments
export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, ...(err.details && { fields: err.details }) });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "The request body isn't valid JSON." });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong on our side. Please try again.", ...(!isProduction && { debug: err.message }) });
}
