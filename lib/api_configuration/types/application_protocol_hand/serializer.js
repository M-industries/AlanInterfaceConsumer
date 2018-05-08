Object.defineProperty(exports, "__esModule", { value: true });
var read_api = require("./read_api");
exports.serialize = (function ($) {
    if (!($ instanceof read_api.Capplication_protocol_hand)) {
        throw new Error("HMMM");
    }
    var $_application_protocol_hand = $;
    var raw_data = {};
    raw_data["interface version"] = $_application_protocol_hand.properties.interface_version;
    switch ($_application_protocol_hand.properties.subscribe.state.name) {
        case 'no':
            raw_data["subscribe"] = [$_application_protocol_hand.properties.subscribe.state.name, (function ($) {
                    if (!($ instanceof read_api.Cno)) {
                        throw new Error("HMMM");
                    }
                    var $_no = $;
                    var raw_data = {};
                    return raw_data;
                }($_application_protocol_hand.properties.subscribe.state.node))];
            break;
        case 'yes':
            raw_data["subscribe"] = [$_application_protocol_hand.properties.subscribe.state.name, (function ($) {
                    if (!($ instanceof read_api.Cyes)) {
                        throw new Error("HMMM");
                    }
                    var $_yes = $;
                    var raw_data = {};
                    raw_data["subscription"] = $_yes.properties.subscription;
                    return raw_data;
                }($_application_protocol_hand.properties.subscribe.state.node))];
            break;
        default:
            throw new Error('Hmmm');
    }
    return raw_data;
});
