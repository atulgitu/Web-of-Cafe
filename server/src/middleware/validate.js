import { badRequest } from "../utils/errors.js";

// validate(schema) checks req.body against a zod schema and replaces it with the parsed value.
export const validate = (schema, source = "body") => (req, _res, next) => {
  const result = schema.safeParse(req[source]);
  if (!result.success) {
    const fields = Object.fromEntries(result.error.issues.map((i) => [i.path.join(".") || "_", i.message]));
    return next(badRequest("Some details need fixing.", fields));
  }
  if (source === "body") req.body = result.data;
  else req.validated = result.data;
  next();
};
