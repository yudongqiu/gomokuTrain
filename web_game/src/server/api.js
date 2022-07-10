import io from 'socket.io-client';

export const SERVER_STATUS = {
	NO_CONNECTION: 'no_connection',
	IDLE: 'idle',
	BUSY: 'busy',
}

export default class AIServer {
	connected = false;

	constructor(state, setState) {
    this.state = state;
		this.setState = setState;
		this.socket = io('http://127.0.0.1:5005/api');
		this.trackStatus();
  }

	// track socket connection status
	trackStatus() {
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

	updateState(key, value) {
		this.setState(state => ({
			...state,
			[key]: value,
		}));
	}
}