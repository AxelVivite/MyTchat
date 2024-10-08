/* eslint
mocha/no-top-level-hooks: 0
mocha/no-sibling-hooks: 0
*/

import { setTimeout } from 'timers/promises';
import assert from 'assert';
import jwt from 'jsonwebtoken';
import WebSocket from 'ws';

import Errors from '../../src/errors';

import { makeId } from '../utils/utils';
import { rndRegister, deleteUser } from '../utils/login';
import { createRoom, postMsg } from '../utils/room';
import { connectWs, wsNextNotif } from '../utils/websocket';

export default () => {
  it('Should connect to a websocket', async () => {
    const { token: token1, userId: userId1 } = await rndRegister();
    const { token: token2, userId: userId2 } = await rndRegister();
    const { data: { roomId } } = await createRoom(token1, [userId2]);

    const ws = await connectWs(token2);
    after(() => ws.close());
    const nextNotif = wsNextNotif(ws);

    const msg = makeId();
    await postMsg(token1, roomId, msg);

    const data = await nextNotif;

    assert.equal(data.userId, userId1);
    assert.equal(data.roomId, roomId);
    assert.equal(data.content, msg);
  });

  it('Missing token', async () => {
    let lastMessage = null;
    const ws = await new Promise((resolve) => {
      // eslint-disable-next-line no-shadow
      const ws = new WebSocket('ws://localhost:3000/room/websocket');

      ws.on('open', () => {
        resolve(ws);
      });

      ws.on('message', (msg) => {
        lastMessage = msg;
      });
    });

    await setTimeout(50);

    assert.equal(ws.readyState, WebSocket.CLOSED);
    assert.equal(lastMessage, Errors.Login.MissingToken);
  });

  it('Bad token', async () => {
    const { userId } = await rndRegister();

    const token = jwt.sign(
      { userId },
      makeId(),
      { expiresIn: '1h' },
    );

    let lastMessage = null;
    const ws = await new Promise((resolve) => {
      // eslint-disable-next-line no-shadow
      const ws = new WebSocket(`ws://localhost:3000/room/websocket?token=${token}`);

      ws.on('open', () => {
        resolve(ws);
      });

      ws.on('message', (msg) => {
        lastMessage = msg;
      });
    });

    await setTimeout(50);

    assert.equal(ws.readyState, WebSocket.CLOSED);
    assert.equal(lastMessage, Errors.Login.BadToken);
  });

  it('User deleted', async () => {
    const { token } = await rndRegister();

    await deleteUser(token);

    let lastMessage = null;
    const ws = await new Promise((resolve) => {
      // eslint-disable-next-line no-shadow
      const ws = new WebSocket(`ws://localhost:3000/room/websocket?token=${token}`);

      ws.on('open', () => {
        resolve(ws);
      });

      ws.on('message', (msg) => {
        lastMessage = msg;
      });
    });

    await setTimeout(50);

    assert.equal(ws.readyState, WebSocket.CLOSED);
    assert.equal(lastMessage, Errors.Login.UserIsDeleted);
  });
};
