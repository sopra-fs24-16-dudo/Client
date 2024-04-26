import axios from 'axios';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { getDomain } from 'helpers/getDomain';

export const api = axios.create({
  baseURL: `${getDomain()}`,
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
});

export const handleError = error => {
  const response = error.response;

  // catch 4xx and 5xx status codes
  if (response && !!`${response.status}`.match(/^[4|5]\d{2}$/)) {
    let info = ``;
    // info = `\nrequest to: ${response.request.responseURL}`;

    if (response.data.status) {
      // info += `\nstatus code: ${response.data.status}`;
      // info += `\nerror: ${response.data.error}`;
      info += `${response.data.message}`;
    } else {
      // info += `\nstatus code: ${response.status}`;
      info += `${response.data}`;
    }

    console.log('The request was made and answered but was unsuccessful.', error.response);
    return info;
  } else {
    if (error.message.match(/Network Error/)) {
      alert('The server cannot be reached.\nDid you start it?');
    }

    console.log('Something else happened.', error);
    return error.message;
  }
};

const websocket = new SockJS(`${getDomain()}/ws`);

websocket.onopen = () => {
  console.log('Connected to websocket server');
};

websocket.onmessage = function (msg) {
  console.log("WebSocket message: ", msg);
};

websocket.onerror = function (event) {
  console.error("WebSocket error: ", event);
};

export const client = Stomp.over(websocket);