Object.defineProperty(exports, "__esModule", { value: true });
var read_api = require("./read_api");
exports.serialize = (function ($) {
    if (!($ instanceof read_api.Capplication_protocol_notify)) {
        throw new Error("HMMM");
    }
    var $_application_protocol_notify = $;
    var raw_data = {};
    raw_data["notification"] = $_application_protocol_notify.properties.notification;
    return raw_data;
});
