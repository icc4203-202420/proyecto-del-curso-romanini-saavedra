import { BACKEND_URL } from '@env';

let ws = null;

export const connectWebSocket = (userId) => {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    ws = new WebSocket(`ws://${BACKEND_URL}/cable`);
    console.log('WebSocket connecting...');

    ws.onopen = () => {
      console.log('WebSocket connected.');

      const subscribeMessage = JSON.stringify({
        command: 'subscribe',
        identifier: JSON.stringify({
          channel: 'FeedChannel',
          user_id: userId,
        }),
      });
      ws.send(subscribeMessage);
    };

    ws.onclose = () => {
      console.log('WebSocket closed.');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  return ws;
};

export const disconnectWebSocket = () => {
  if (ws) {
    ws.close();
    ws = null;
  }
};
