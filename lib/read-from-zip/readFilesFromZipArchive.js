Object.defineProperty(exports, "__esModule", { value: true });
var yauzl = require("yauzl");
function default_1(archive_path, onDone) {
    var result = {};
    yauzl.open(archive_path, { lazyEntries: true }, function (err, zipfile) {
        if (err) {
            throw err;
        }
        zipfile.readEntry();
        zipfile.on("entry", function (entry) {
            if (/\/$/.test(entry.fileName)) {
            }
            else {
                zipfile.openReadStream(entry, function (readerr, readstream) {
                    if (readerr) {
                        throw readerr;
                    }
                    var chunks = [];
                    var chunks_length = 0;
                    readstream.on("data", function (chunk) {
                        chunks.push(chunk);
                        chunks_length += chunk.length;
                    });
                    readstream.on("end", function () {
                        var path_items = entry.fileName.split("/");
                        var length = path_items.length;
                        var result_object = result;
                        path_items.map(function (path_item, index) {
                            if (index === length - 1) {
                                result_object[path_item] = Buffer.concat(chunks, chunks_length);
                            }
                            else {
                                result_object[path_item] = result_object[path_item] || {};
                                result_object = result_object[path_item];
                            }
                        });
                        zipfile.readEntry();
                    });
                });
            }
        });
        zipfile.on("end", function () {
            onDone(result);
        });
    });
}
exports.default = default_1;
