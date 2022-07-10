import io from 'socket.io-client';

import { SERVER_STATUS } from '../utils/constants';

export default class AIServer {
	connected = false;

	constructor(updateState) {
    this.updateState = updateState;
		this.socket = io('http://127.0.0.1:5005/api');
		this.trackStatus();
  }

	// track socket connection status
	trackStatus() {
		// default
		this.updateState('status', SERVER_STATUS.NO_CONNECTION);
		this.socket.on("connect", () => {
			this.connected = this.socket.connected;
			this.checkServerStatus();
		});
		this.socket.on("disconnect", () => {
			this.connected = this.socket.connected;
			this.updateState('status', SERVER_STATUS.NO_CONNECTION);
		});
	}

	checkServerStatus() {
		this.socket.emit("get_status", (data) => {
			this.updateState('status', data);
		});
	}
}