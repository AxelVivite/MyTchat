import WebSocket from 'ws';

import { rndRegister } from './login';

export const wsUrl = 'ws://localhost:3000/room/websocket';

export async function connectWs(token, closeCallback = () => {}, errorCallback = () => {}) {
  return new Promise((resolve) => {
    const ws = new WebSocket(`ws://localhost:3000/room/websocket?token=${token}`);

    ws.on('open', () => {
      resolve(ws);
    });

    ws.on('close', closeCallback);
    ws.on('error', errorCallback);
  });
}

export async function wsNextNotif(ws, timeout = 300) {
  return new Promise((resolve, reject) => {
    ws.on('message', (data) => {
      resolve(JSON.parse(data));
    });

    setTimeout(() => {
      reject(new Error(`Timeout while waiting for websocket notification (${timeout}ms)`));
    }, timeout);
  });
}

export function wsMakeQueue(ws) {
  const queue = {
    data: [],
    shift() {
      if (this.size() === 0) {
        throw new Error('Queue is empty');
      }

      const x = this.data[0];
      this.data = this.data.slice(1);
      return x;
    },
    size() {
      return this.data.length;
    },
    empty() {
      this.data = [];
    },
  };

  ws.on('message', (data) => {
    queue.data.push(JSON.parse(data));
  });

  return queue;
}

export async function rndRegistersWithWs(n) {
  return Promise.all([...new Array(n)].map(async () => {
    const user = await rndRegister();
    const ws = await connectWs(user.token);
    const msgQueue = wsMakeQueue(ws);

    return {
      ...user,
      ws,
      msgQueue,
    };
  }));
}
