Object.defineProperty(exports, "__esModule", { value: true });
var read_api = require("./read_api");
var serialize_command_arguments = (function ($) {
    if (!($ instanceof read_api.Ccommand_arguments)) {
        throw new Error("HMMM");
    }
    var $_command_arguments = $;
    var raw_data = {};
    raw_data["properties"] = (function ($) {
        var k;
        var object = {};
        for (k in $_command_arguments.properties.properties["entries"]) {
            object[k] = (function ($) {
                if (!($ instanceof read_api.Cproperties)) {
                    throw new Error("HMMM");
                }
                var $_properties = $;
                var raw_data = {};
                switch ($_properties.properties.type.state.name) {
                    case 'file':
                        raw_data["type"] = [$_properties.properties.type.state.name, (function ($) {
                                if (!($ instanceof read_api.Cfile)) {
                                    throw new Error("HMMM");
                                }
                                var $_file = $;
                                var raw_data = {};
                                raw_data["extension"] = $_file.properties.extension;
                                raw_data["token"] = $_file.properties.token;
                                return raw_data;
                            }($_properties.properties.type.state.node))];
                        break;
                    case 'matrix':
                        raw_data["type"] = [$_properties.properties.type.state.name, (function ($) {
                                if (!($ instanceof read_api.Cmatrix)) {
                                    throw new Error("HMMM");
                                }
                                var $_matrix = $;
                                var raw_data = {};
                                raw_data["entries"] = (function ($) {
                                    var k;
                                    var object = {};
                                    for (k in $_matrix.properties.entries["entries"]) {
                                        object[k] = (function ($) {
                                            if (!($ instanceof read_api.Centries)) {
                                                throw new Error("HMMM");
                                            }
                                            var $_entries = $;
                                            var raw_data = {};
                                            raw_data["arguments"] = serialize_command_arguments($_entries.properties.arguments);
                                            return raw_data;
                                        }($_matrix.properties.entries["entries"][k]));
                                    }
                                    return object;
                                }($));
                                return raw_data;
                            }($_properties.properties.type.state.node))];
                        break;
                    case 'number':
                        raw_data["type"] = [$_properties.properties.type.state.name, (function ($) {
                                if (!($ instanceof read_api.Cnumber)) {
                                    throw new Error("HMMM");
                                }
                                var $_number = $;
                                var raw_data = {};
                                raw_data["number"] = $_number.properties.number;
                                return raw_data;
                            }($_properties.properties.type.state.node))];
                        break;
                    case 'reference':
                        raw_data["type"] = [$_properties.properties.type.state.name, (function ($) {
                                if (!($ instanceof read_api.Creference)) {
                                    throw new Error("HMMM");
                                }
                                var $_reference = $;
                                var raw_data = {};
                                raw_data["entry"] = $_reference.properties.entry;
                                return raw_data;
                            }($_properties.properties.type.state.node))];
                        break;
                    case 'state group':
                        raw_data["type"] = [$_properties.properties.type.state.name, (function ($) {
                                if (!($ instanceof read_api.Cstate_group)) {
                                    throw new Error("HMMM");
                                }
                                var $_state_group = $;
                                var raw_data = {};
                                raw_data["arguments"] = serialize_command_arguments($_state_group.properties.arguments);
                                raw_data["state"] = $_state_group.properties.state.entry;
                                return raw_data;
                            }($_properties.properties.type.state.node))];
                        break;
                    case 'text':
                        raw_data["type"] = [$_properties.properties.type.state.name, (function ($) {
                                if (!($ instanceof read_api.Ctext)) {
                                    throw new Error("HMMM");
                                }
                                var $_text = $;
                                var raw_data = {};
                                raw_data["text"] = $_text.properties.text;
                                return raw_data;
                            }($_properties.properties.type.state.node))];
                        break;
                    default:
                        throw new Error('Hmmm');
                }
                return raw_data;
            }($_command_arguments.properties.properties["entries"][k]));
        }
        return object;
    }($));
    return raw_data;
});
var serialize_context_keys = (function ($) {
    if (!($ instanceof read_api.Ccontext_keys__interface_request)) {
        throw new Error("HMMM");
    }
    var $_context_keys__interface_request = $;
    var raw_data = {};
    raw_data["context keys"] = (function ($) {
        var k;
        var object = {};
        for (k in $_context_keys__interface_request.properties.context_keys["entries"]) {
            object[k] = (function ($) {
                if (!($ instanceof read_api.Ccontext_keys__context_keys)) {
                    throw new Error("HMMM");
                }
                var $_context_keys__context_keys = $;
                var raw_data = {};
                raw_data["value"] = $_context_keys__context_keys.properties.value;
                return raw_data;
            }($_context_keys__interface_request.properties.context_keys["entries"][k]));
        }
        return object;
    }($));
    return raw_data;
});
var serialize_id_path = (function ($) {
    if (!($ instanceof read_api.Cid_path)) {
        throw new Error("HMMM");
    }
    var $_id_path = $;
    var raw_data = {};
    switch ($_id_path.properties.has_steps.state.name) {
        case 'no':
            raw_data["has steps"] = [$_id_path.properties.has_steps.state.name, (function ($) {
                    if (!($ instanceof read_api.Cno__has_steps)) {
                        throw new Error("HMMM");
                    }
                    var $_no__has_steps = $;
                    var raw_data = {};
                    return raw_data;
                }($_id_path.properties.has_steps.state.node))];
            break;
        case 'yes':
            raw_data["has steps"] = [$_id_path.properties.has_steps.state.name, (function ($) {
                    if (!($ instanceof read_api.Cyes__has_steps)) {
                        throw new Error("HMMM");
                    }
                    var $_yes__has_steps = $;
                    var raw_data = {};
                    raw_data["tail"] = serialize_id_path($_yes__has_steps.properties.tail);
                    switch ($_yes__has_steps.properties.type.state.name) {
                        case 'collection entry':
                            raw_data["type"] = [$_yes__has_steps.properties.type.state.name, (function ($) {
                                    if (!($ instanceof read_api.Ccollection_entry)) {
                                        throw new Error("HMMM");
                                    }
                                    var $_collection_entry = $;
                                    var raw_data = {};
                                    raw_data["collection"] = $_collection_entry.properties.collection.entry;
                                    raw_data["id"] = $_collection_entry.properties.id;
                                    return raw_data;
                                }($_yes__has_steps.properties.type.state.node))];
                            break;
                        case 'component':
                            raw_data["type"] = [$_yes__has_steps.properties.type.state.name, (function ($) {
                                    if (!($ instanceof read_api.Ccomponent)) {
                                        throw new Error("HMMM");
                                    }
                                    var $_component = $;
                                    var raw_data = {};
                                    raw_data["component"] = $_component.properties.component.entry;
                                    return raw_data;
                                }($_yes__has_steps.properties.type.state.node))];
                            break;
                        case 'group':
                            raw_data["type"] = [$_yes__has_steps.properties.type.state.name, (function ($) {
                                    if (!($ instanceof read_api.Cgroup)) {
                                        throw new Error("HMMM");
                                    }
                                    var $_group = $;
                                    var raw_data = {};
                                    raw_data["group"] = $_group.properties.group.entry;
                                    return raw_data;
                                }($_yes__has_steps.properties.type.state.node))];
                            break;
                        case 'state':
                            raw_data["type"] = [$_yes__has_steps.properties.type.state.name, (function ($) {
                                    if (!($ instanceof read_api.Cstate)) {
                                        throw new Error("HMMM");
                                    }
                                    var $_state = $;
                                    var raw_data = {};
                                    raw_data["state"] = $_state.properties.state.entry;
                                    raw_data["state group"] = $_state.properties.state_group.entry;
                                    return raw_data;
                                }($_yes__has_steps.properties.type.state.node))];
                            break;
                        default:
                            throw new Error('Hmmm');
                    }
                    return raw_data;
                }($_id_path.properties.has_steps.state.node))];
            break;
        default:
            throw new Error('Hmmm');
    }
    return raw_data;
});
exports.serialize = (function ($) {
    if (!($ instanceof read_api.Cinterface_request)) {
        throw new Error("HMMM");
    }
    var $_interface_request = $;
    var raw_data = {};
    switch ($_interface_request.properties.type.state.name) {
        case 'command execution':
            raw_data["type"] = [$_interface_request.properties.type.state.name, (function ($) {
                    if (!($ instanceof read_api.Ccommand_execution)) {
                        throw new Error("HMMM");
                    }
                    var $_command_execution = $;
                    var raw_data = {};
                    raw_data["arguments"] = serialize_command_arguments($_command_execution.properties.arguments);
                    raw_data["command"] = $_command_execution.properties.command.entry;
                    raw_data["context keys"] = serialize_context_keys($_command_execution.properties.context_keys);
                    raw_data["context node"] = serialize_id_path($_command_execution.properties.context_node);
                    return raw_data;
                }($_interface_request.properties.type.state.node))];
            break;
        case 'subscribe':
            raw_data["type"] = [$_interface_request.properties.type.state.name, (function ($) {
                    if (!($ instanceof read_api.Csubscribe)) {
                        throw new Error("HMMM");
                    }
                    var $_subscribe = $;
                    var raw_data = {};
                    raw_data["context keys"] = serialize_context_keys($_subscribe.properties.context_keys);
                    switch ($_subscribe.properties.initialization_data_requested.state.name) {
                        case 'no':
                            raw_data["initialization data requested"] = [$_subscribe.properties.initialization_data_requested.state.name, (function ($) {
                                    if (!($ instanceof read_api.Cno__initialization_data_requested)) {
                                        throw new Error("HMMM");
                                    }
                                    var $_no__initialization_data_requested = $;
                                    var raw_data = {};
                                    return raw_data;
                                }($_subscribe.properties.initialization_data_requested.state.node))];
                            break;
                        case 'yes':
                            raw_data["initialization data requested"] = [$_subscribe.properties.initialization_data_requested.state.name, (function ($) {
                                    if (!($ instanceof read_api.Cyes__initialization_data_requested)) {
                                        throw new Error("HMMM");
                                    }
                                    var $_yes__initialization_data_requested = $;
                                    var raw_data = {};
                                    return raw_data;
                                }($_subscribe.properties.initialization_data_requested.state.node))];
                            break;
                        default:
                            throw new Error('Hmmm');
                    }
                    return raw_data;
                }($_interface_request.properties.type.state.node))];
            break;
        case 'unsubscribe':
            raw_data["type"] = [$_interface_request.properties.type.state.name, (function ($) {
                    if (!($ instanceof read_api.Cunsubscribe)) {
                        throw new Error("HMMM");
                    }
                    var $_unsubscribe = $;
                    var raw_data = {};
                    return raw_data;
                }($_interface_request.properties.type.state.node))];
            break;
        default:
            throw new Error('Hmmm');
    }
    return raw_data;
});
