Object.defineProperty(exports, "__esModule", { value: true });
var read_api = require("./read_api");
exports.serialize = (function ($) {
    if (!($ instanceof read_api.Capplication_protocol_invoke)) {
        throw new Error("HMMM");
    }
    var $_application_protocol_invoke = $;
    var raw_data = {};
    raw_data["command"] = $_application_protocol_invoke.properties.command;
    return raw_data;
});
