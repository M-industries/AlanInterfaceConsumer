function indexOfByteInBuffer(buffer: Buffer, byteValue: number) {
	var i;

	for (i = 0; i < buffer.length; i += 1) {
		if (buffer[i] === byteValue) {
			return i;
		}
	}

	return -1;
}

export default function create_handler(callback: (result: Buffer) => void) {
	var buffers: Buffer[] = [];
	var buffers_length = 0;

	var cb_data = function (chunk: Buffer) {
		buffers.push(chunk);
		buffers_length += chunk.length;
	};

	var cb_end = function () {
		callback(Buffer.concat(buffers, buffers_length));

		buffers = [];
		buffers_length = 0;
	};

	return function (raw_data: Buffer) {
		var data: Buffer = raw_data;

		while (true) {
			var i = indexOfByteInBuffer(data, 0);

			if (i === -1) {
				cb_data(data);
				break;
			} else {
				cb_data(data.slice(0, i));
				cb_end();
				data = data.slice(i + 1);
			}

			if (0 === data.length) {
				break;
			}
		}
	};
}
