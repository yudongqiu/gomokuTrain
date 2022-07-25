from enum import Enum

# need to match frontend
class ServerStatus(Enum):
	NO_CONNECTION = 'no_connection'
	IDLE = 'idle'
	BUSY = 'busy'
	TRAINING = 'training'
    