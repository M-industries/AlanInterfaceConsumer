function indexOfByteInBuffer(buffer, byteValue) {
	var i;

	for (i = 0; i < buffer.length; i += 1) {
		if (buffer[i] === byteValue) {
			return i;
		}
	}

	return -1;
}

function create_handler(callback) {
	var buffers = [];
	var buffers_length = 0;

	var cb_data = function (chunk) {
		buffers.push(chunk);
		buffers_length += chunk.length;
	};

	var cb_end = function () {
		callback(Buffer.concat(buffers, buffers_length));

		buffers = [];
		buffers_length = 0;
	};

	return function (raw_data) {
		var data = raw_data;

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

module.exports = {
	"create": create_handler
};
