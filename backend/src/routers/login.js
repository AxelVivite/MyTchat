/* eslint no-underscore-dangle: 0 */ // --> OFF

import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import Errors from '../errors';
import { checkToken, checkUserExists, getUser } from './middlewares';
import User from '../models/user';

// todo: use better secret + put in .env file
const SECRET = 'secret';
// Format for describing time: https://github.com/vercel/ms#examples
const TOKEN_EXPIRES_IN = '10 days';

const loginRouter = express.Router();

// todo: body should be form
/**
 * @openapi
 * /login/register:
 *   post:
 *     tags:
 *       - login
 *     description: Registers a new user
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       409:
 *         description: Email is already taken
 *       200:
 *         description: >-
 *           Returns the new user id, a token, and the time it will take for the token to expire
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SigninResult'
 */
loginRouter.post('/register', async (req, res) => {
  // todo: check email
  const { body: { email } } = req;

  const userExists = await User.findOne({ email });

  if (userExists !== null) {
    return res.status(409).json({
      error: Errors.Registration.EmailTaken,
    });
  }

  // todo: check password
  const passwordHash = await bcrypt.hash(req.body.password, 10);

  const user = new User({
    email,
    passwordHash,
  });

  await user.save();

  const token = jwt.sign(
    { userId: user._id.toString() },
    SECRET,
    { expiresIn: TOKEN_EXPIRES_IN },
  );

  return res.status(200).json({
    userId: user._id.toString(),
    token,
    expiresIn: TOKEN_EXPIRES_IN,
  });
});

/**
 * @openapi
 * /login/signin/{email}:
 *   get:
 *     tags:
 *       - login
 *     description: Sign in and get a token
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *     security:
 *       - basicAuth: []
 *     responses:
 *       400:
 *         description: >-
 *           Bad request, details are returned, can be because of:
 *           MissingToken, BadAuthType (ex: Bearer instead of Basic)
 *       401:
 *         description: Invalid password
 *       404:
 *         description: User not found
 *       200:
 *         description: >-
 *           Returns the user id, a token, and the time it will take for the token to expire
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SigninResult'
 */
loginRouter.get('/signin/:email', async (req, res) => {
  // todo: check email
  const { params: { email } } = req;
  const user = await User.findOne({ email });

  if (user === null) {
    return res.status(404).json({
      error: Errors.Login.AccountNotFound,
    });
  }

  const auth = req.headers.Authorization || req.headers.authorization;

  if (auth === undefined) {
    return res.status(400).json({
      error: Errors.Login.MissingToken,
    });
  }

  const authMatch = auth.match(/^Basic (?<password>.+)$/);

  if (authMatch === null) {
    return res.status(400).json({
      error: Errors.Login.BadAuthType,
    });
  }

  const { groups: { password } } = authMatch;
  const passwordCorrect = await bcrypt.compare(password, user.passwordHash);

  if (!passwordCorrect) {
    return res.status(401).json({
      error: Errors.Login.InvalidPassword,
    });
  }

  const token = jwt.sign(
    { userId: user._id.toString() },
    SECRET,
    { expiresIn: TOKEN_EXPIRES_IN },
  );

  return res.status(200).json({
    userId: user._id.toString(),
    token,
    expiresIn: TOKEN_EXPIRES_IN,
  });
});

/**
 * @openapi
 * /login/info:
 *   get:
 *     tags:
 *       - login
 *     description: Get info on a user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       400:
 *         description: >-
 *           Bad request, details are returned, can be because of:
 *           MissingToken, BadAuthType (ex: Basic instead of Bearer)
 *       401:
 *         description: Bad token (not created by this server or expired)
 *       404:
 *         description: User not found
 *       200:
 *         description: Returns the user's email and the ids of the rooms they're in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - email
 *                 - rooms
 *               properties:
 *                 email:
 *                   type: string
 *                   format: string
 *                 rooms:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MongoId'
 */
loginRouter.get('/info', [checkToken, getUser], async (req, res) => {
  res.status(200).json({
    user: {
      email: req.state.user.email,
      rooms: req.state.user.rooms,
    },
  });
});

// todo: remove user from rooms
// todo: maybe archive account instead so there aren't posts pointing to deleted users
// todo: update webSockets
/**
 * @openapi
 * /login/delete:
 *   delete:
 *     tags:
 *       - login
 *     description: Delete a user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       400:
 *         description: >-
 *           Bad request, details are returned, can be because of:
 *           MissingToken, BadAuthType (ex: Basic instead of Bearer)
 *       401:
 *         description: Bad token (not created by this server or expired)
 *       404:
 *         description: User not found
 *       200:
 *         description: Returns the user's email and the ids of the rooms they're in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - email
 *                 - rooms
 *               properties:
 *                 email:
 *                   type: string
 *                   format: string
 *                 rooms:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MongoId'
 */
loginRouter.delete('/delete', [checkToken, checkUserExists], async (req, res) => {
  await User.findByIdAndRemove(req.state.userId);

  res.status(201).send();
});

export default loginRouter;
