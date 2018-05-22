declare var Buffer;
declare var require;
let yauzl = require("yauzl");
export default function(archive_path, onDone) {
	let result = {};
	yauzl.open(archive_path, {lazyEntries: true} , function(err, zipfile) {
		if (err) { throw err; }
		zipfile.readEntry();
		zipfile.on("entry", function(entry) {
			if (/\/$/.test(entry.fileName)) {
			} else {
				zipfile.openReadStream(entry, function(readerr, readstream) {
					if (readerr) { throw readerr; }
					let chunks:string[] = [];
					let chunks_length = 0;
					readstream.on("data", function(chunk) {
						chunks.push(chunk);
						chunks_length += chunk.length;
					});
					readstream.on("end", function() {
						let path_items = entry.fileName.split("/");
						let length = path_items.length;
						let result_object = result;
						path_items.map(function(path_item, index) {
							if (index === length - 1) {
								result_object[path_item] = Buffer.concat(chunks, chunks_length);
							} else {
								result_object[path_item] = result_object[path_item] || {};
								result_object = result_object[path_item];
							}
						});
						zipfile.readEntry();
					});

				});
			}
		});
		zipfile.on("end", function() {
			onDone(result);
		});
	});
}
