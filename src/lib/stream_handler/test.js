var stream_handler = require(".");

var result = "";

var sh = stream_handler.create(function (msg) {
	result += msg.toString("hex");
});

function send () {
	var bytes = Array.prototype.slice.call(arguments);
	sh(new Buffer(bytes));
}

function expect(outcome) {
	if (result !== outcome) {
		console.error("Expected: %s", outcome);
		console.error("Actual:   %s", result);

		throw new Error("Test failure");
	}
	result = "";
}

send(1, 1, 1, 0);
expect("010101");

send(2, 2, 2);
send(0);
expect("020202");

send();
send(3, 3, 3, 0, 4);
expect("030303");

send(4, 4);
send(0, 5, 5);
expect("040404");

send(5, 0, 6, 6, 6, 0);
expect("050505060606");

console.log("All tests OK!");
