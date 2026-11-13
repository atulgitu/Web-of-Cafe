import bcrypt from "bcryptjs";
import { signToken } from "../middleware/auth.js";
import { createUser, findUserWithHashByEmail, updateUser } from "../models/userModel.js";
import { conflict, unauthorized } from "../utils/errors.js";

const BCRYPT_ROUNDS = 10;

// Public registration always creates a CUSTOMER. Staff and partner accounts are
// created by the seed script (or, in a real deployment, by an admin).
export async function register(req, res) {
  const { name, email, password, phone } = req.body;
  if (await findUserWithHashByEmail(email)) throw conflict("An account with this email already exists. Try logging in.");
  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await createUser({ name, email, passwordHash, phone });
  res.status(201).json({ user, token: signToken(user) });
}

export async function login(req, res) {
  const { email, password } = req.body;
  const found = await findUserWithHashByEmail(email);
  // Same message whether the email or the password is wrong.
  if (!found || !(await bcrypt.compare(password, found.passwordHash))) throw unauthorized("That email and password don't match.");
  const { passwordHash: _omit, ...user } = found;
  res.json({ user, token: signToken(user) });
}

export const me = (req, res) => res.json({ user: req.user });

// Tokens are stateless (JWT), so logging out means the client forgets its token.
export const logout = (_req, res) => res.status(204).end();

export async function updateMe(req, res) {
  res.json({ user: await updateUser(req.user.id, req.body) });
}
