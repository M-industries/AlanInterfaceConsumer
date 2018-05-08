Object.defineProperty(exports, "__esModule", { value: true });
var read_api = require("./read_api");
var serialize_delete_node = (function ($) {
    if (!($ instanceof read_api.Cdelete_node)) {
        throw new Error("HMMM");
    }
    var $_delete_node = $;
    var raw_data = {};
    return raw_data;
});
var serialize_initialize_node = (function ($) {
    if (!($ instanceof read_api.Cinitialize_node)) {
        throw new Error("HMMM");
    }
    var $_initialize_node = $;
    var raw_data = {};
    raw_data["properties"] = (function ($) {
        var k;
        var object = {};
        for (k in $_initialize_node.properties.properties["entries"]) {
            object[k] = (function ($) {
                if (!($ instanceof read_api.Cproperties__initialize_node)) {
                    throw new Error("HMMM");
                }
                var $_properties__initialize_node = $;
                var raw_data = {};
                switch ($_properties__initialize_node.properties.type.state.name) {
                    case 'collection':
                        raw_data["type"] = [$_properties__initialize_node.properties.type.state.name, (function ($) {
                                if (!($ instanceof read_api.Ccollection__type__properties__initialize_node)) {
                                    throw new Error("HMMM");
                                }
                                var $_collection__type__properties__initialize_node = $;
                                var raw_data = {};
                                raw_data["entries"] = (function ($) {
                                    var k;
                                    var object = {};
                                    for (k in $_collection__type__properties__initialize_node.properties.entries["entries"]) {
                                        object[k] = (function ($) {
                                            if (!($ instanceof read_api.Centries__collection__type__properties__initialize_node)) {
                                                throw new Error("HMMM");
                                            }
                                            var $_entries__collection__type__properties__initialize_node = $;
                                            var raw_data = {};
                                            raw_data["node"] = serialize_initialize_node($_entries__collection__type__properties__initialize_node.properties.node);
                                            return raw_data;
                                        }($_collection__type__properties__initialize_node.properties.entries["entries"][k]));
                                    }
                                    return object;
                                }($));
                                switch ($_collection__type__properties__initialize_node.properties.type.state.name) {
                                    case 'dictionary':
                                        raw_data["type"] = [$_collection__type__properties__initialize_node.properties.type.state.name, (function ($) {
                                                if (!($ instanceof read_api.Cdictionary__type__collection__type__properties__initialize_node)) {
                                                    throw new Error("HMMM");
                                                }
                                                var $_dictionary__type__collection__type__properties__initialize_node = $;
                                                var raw_data = {};
                                                return raw_data;
                                            }($_collection__type__properties__initialize_node.properties.type.state.node))];
                                        break;
                                    case 'matrix':
                                        raw_data["type"] = [$_collection__type__properties__initialize_node.properties.type.state.name, (function ($) {
                                                if (!($ instanceof read_api.Cmatrix__type__collection__type__properties__initialize_node)) {
                                                    throw new Error("HMMM");
                                                }
                                                var $_matrix__type__collection__type__properties__initialize_node = $;
                                                var raw_data = {};
                                                return raw_data;
                                            }($_collection__type__properties__initialize_node.properties.type.state.node))];
                                        break;
                                    default:
                                        throw new Error('Hmmm');
                                }
                                return raw_data;
                            }($_properties__initialize_node.properties.type.state.node))];
                        break;
                    case 'component':
                        raw_data["type"] = [$_properties__initialize_node.properties.type.state.name, (function ($) {
                                if (!($ instanceof read_api.Ccomponent__type__properties__initialize_node)) {
                                    throw new Error("HMMM");
                                }
                                var $_component__type__properties__initialize_node = $;
                                var raw_data = {};
                                raw_data["node"] = serialize_initialize_node($_component__type__properties__initialize_node.properties.node);
                                return raw_data;
                            }($_properties__initialize_node.properties.type.state.node))];
                        break;
                    case 'file':
                        raw_data["type"] = [$_properties__initialize_node.properties.type.state.name, (function ($) {
                                if (!($ instanceof read_api.Cfile__type__properties__initialize_node)) {
                                    throw new Error("HMMM");
                                }
                                var $_file__type__properties__initialize_node = $;
                                var raw_data = {};
                                raw_data["extension"] = $_file__type__properties__initialize_node.properties.extension;
                                raw_data["token"] = $_file__type__properties__initialize_node.properties.token;
                                return raw_data;
                            }($_properties__initialize_node.properties.type.state.node))];
                        break;
                    case 'group':
                        raw_data["type"] = [$_properties__initialize_node.properties.type.state.name, (function ($) {
                                if (!($ instanceof read_api.Cgroup__type__properties__initialize_node)) {
                                    throw new Error("HMMM");
                                }
                                var $_group__type__properties__initialize_node = $;
                                var raw_data = {};
                                raw_data["node"] = serialize_initialize_node($_group__type__properties__initialize_node.properties.node);
                                return raw_data;
                            }($_properties__initialize_node.properties.type.state.node))];
                        break;
                    case 'number':
                        raw_data["type"] = [$_properties__initialize_node.properties.type.state.name, (function ($) {
                                if (!($ instanceof read_api.Cnumber__type__properties__initialize_node)) {
                                    throw new Error("HMMM");
                                }
                                var $_number__type__properties__initialize_node = $;
                                var raw_data = {};
                                switch ($_number__type__properties__initialize_node.properties.type.state.name) {
                                    case 'integer':
                                        raw_data["type"] = [$_number__type__properties__initialize_node.properties.type.state.name, (function ($) {
                                                if (!($ instanceof read_api.Cinteger__type__number__type__properties__initialize_node)) {
                                                    throw new Error("HMMM");
                                                }
                                                var $_integer__type__number__type__properties__initialize_node = $;
                                                var raw_data = {};
                                                raw_data["value"] = $_integer__type__number__type__properties__initialize_node.properties.value;
                                                return raw_data;
                                            }($_number__type__properties__initialize_node.properties.type.state.node))];
                                        break;
                                    case 'natural':
                                        raw_data["type"] = [$_number__type__properties__initialize_node.properties.type.state.name, (function ($) {
                                                if (!($ instanceof read_api.Cnatural__type__number__type__properties__initialize_node)) {
                                                    throw new Error("HMMM");
                                                }
                                                var $_natural__type__number__type__properties__initialize_node = $;
                                                var raw_data = {};
                                                raw_data["value"] = $_natural__type__number__type__properties__initialize_node.properties.value;
                                                return raw_data;
                                            }($_number__type__properties__initialize_node.properties.type.state.node))];
                                        break;
                                    default:
                                        throw new Error('Hmmm');
                                }
                                return raw_data;
                            }($_properties__initialize_node.properties.type.state.node))];
                        break;
                    case 'reference':
                        raw_data["type"] = [$_properties__initialize_node.properties.type.state.name, (function ($) {
                                if (!($ instanceof read_api.Creference__type__properties__initialize_node)) {
                                    throw new Error("HMMM");
                                }
                                var $_reference__type__properties__initialize_node = $;
                                var raw_data = {};
                                raw_data["referenced node"] = $_reference__type__properties__initialize_node.properties.referenced_node;
                                return raw_data;
                            }($_properties__initialize_node.properties.type.state.node))];
                        break;
                    case 'state group':
                        raw_data["type"] = [$_properties__initialize_node.properties.type.state.name, (function ($) {
                                if (!($ instanceof read_api.Cstate_group__type__properties__initialize_node)) {
                                    throw new Error("HMMM");
                                }
                                var $_state_group__type__properties__initialize_node = $;
                                var raw_data = {};
                                raw_data["node"] = serialize_initialize_node($_state_group__type__properties__initialize_node.properties.node);
                                raw_data["state"] = $_state_group__type__properties__initialize_node.properties.state.entry;
                                return raw_data;
                            }($_properties__initialize_node.properties.type.state.node))];
                        break;
                    case 'text':
                        raw_data["type"] = [$_properties__initialize_node.properties.type.state.name, (function ($) {
                                if (!($ instanceof read_api.Ctext__type__properties__initialize_node)) {
                                    throw new Error("HMMM");
                                }
                                var $_text__type__properties__initialize_node = $;
                                var raw_data = {};
                                raw_data["value"] = $_text__type__properties__initialize_node.properties.value;
                                return raw_data;
                            }($_properties__initialize_node.properties.type.state.node))];
                        break;
                    default:
                        throw new Error('Hmmm');
                }
                return raw_data;
            }($_initialize_node.properties.properties["entries"][k]));
        }
        return object;
    }($));
    return raw_data;
});
var serialize_update_node = (function ($) {
    if (!($ instanceof read_api.Cupdate_node)) {
        throw new Error("HMMM");
    }
    var $_update_node = $;
    var raw_data = {};
    raw_data["properties"] = (function ($) {
        var k;
        var object = {};
        for (k in $_update_node.properties.properties["entries"]) {
            object[k] = (function ($) {
                if (!($ instanceof read_api.Cproperties__update_node)) {
                    throw new Error("HMMM");
                }
                var $_properties__update_node = $;
                var raw_data = {};
                switch ($_properties__update_node.properties.type.state.name) {
                    case 'collection':
                        raw_data["type"] = [$_properties__update_node.properties.type.state.name, (function ($) {
                                if (!($ instanceof read_api.Ccollection__type__properties__update_node)) {
                                    throw new Error("HMMM");
                                }
                                var $_collection__type__properties__update_node = $;
                                var raw_data = {};
                                raw_data["entries"] = (function ($) {
                                    var k;
                                    var object = {};
                                    for (k in $_collection__type__properties__update_node.properties.entries["entries"]) {
                                        object[k] = (function ($) {
                                            if (!($ instanceof read_api.Centries__collection__type__properties__update_node)) {
                                                throw new Error("HMMM");
                                            }
                                            var $_entries__collection__type__properties__update_node = $;
                                            var raw_data = {};
                                            switch ($_entries__collection__type__properties__update_node.properties.type.state.name) {
                                                case 'create':
                                                    raw_data["type"] = [$_entries__collection__type__properties__update_node.properties.type.state.name, (function ($) {
                                                            if (!($ instanceof read_api.Ccreate__type__entries)) {
                                                                throw new Error("HMMM");
                                                            }
                                                            var $_create__type__entries = $;
                                                            var raw_data = {};
                                                            raw_data["node"] = serialize_initialize_node($_create__type__entries.properties.node);
                                                            return raw_data;
                                                        }($_entries__collection__type__properties__update_node.properties.type.state.node))];
                                                    break;
                                                case 'remove':
                                                    raw_data["type"] = [$_entries__collection__type__properties__update_node.properties.type.state.name, (function ($) {
                                                            if (!($ instanceof read_api.Cremove__type__entries)) {
                                                                throw new Error("HMMM");
                                                            }
                                                            var $_remove__type__entries = $;
                                                            var raw_data = {};
                                                            raw_data["delete node"] = serialize_delete_node($_remove__type__entries.properties.delete_node);
                                                            return raw_data;
                                                        }($_entries__collection__type__properties__update_node.properties.type.state.node))];
                                                    break;
                                                case 'rename':
                                                    raw_data["type"] = [$_entries__collection__type__properties__update_node.properties.type.state.name, (function ($) {
                                                            if (!($ instanceof read_api.Crename)) {
                                                                throw new Error("HMMM");
                                                            }
                                                            var $_rename = $;
                                                            var raw_data = {};
                                                            raw_data["old id"] = $_rename.properties.old_id.entry;
                                                            return raw_data;
                                                        }($_entries__collection__type__properties__update_node.properties.type.state.node))];
                                                    break;
                                                case 'update':
                                                    raw_data["type"] = [$_entries__collection__type__properties__update_node.properties.type.state.name, (function ($) {
                                                            if (!($ instanceof read_api.Cupdate__type__entries)) {
                                                                throw new Error("HMMM");
                                                            }
                                                            var $_update__type__entries = $;
                                                            var raw_data = {};
                                                            switch ($_update__type__entries.properties.invalidate_referencer.state.name) {
                                                                case 'no':
                                                                    raw_data["invalidate referencer"] = [$_update__type__entries.properties.invalidate_referencer.state.name, (function ($) {
                                                                            if (!($ instanceof read_api.Cno__invalidate_referencer)) {
                                                                                throw new Error("HMMM");
                                                                            }
                                                                            var $_no__invalidate_referencer = $;
                                                                            var raw_data = {};
                                                                            return raw_data;
                                                                        }($_update__type__entries.properties.invalidate_referencer.state.node))];
                                                                    break;
                                                                case 'yes':
                                                                    raw_data["invalidate referencer"] = [$_update__type__entries.properties.invalidate_referencer.state.name, (function ($) {
                                                                            if (!($ instanceof read_api.Cyes__invalidate_referencer)) {
                                                                                throw new Error("HMMM");
                                                                            }
                                                                            var $_yes__invalidate_referencer = $;
                                                                            var raw_data = {};
                                                                            return raw_data;
                                                                        }($_update__type__entries.properties.invalidate_referencer.state.node))];
                                                                    break;
                                                                default:
                                                                    throw new Error('Hmmm');
                                                            }
                                                            raw_data["update node"] = serialize_update_node($_update__type__entries.properties.update_node);
                                                            return raw_data;
                                                        }($_entries__collection__type__properties__update_node.properties.type.state.node))];
                                                    break;
                                                default:
                                                    throw new Error('Hmmm');
                                            }
                                            return raw_data;
                                        }($_collection__type__properties__update_node.properties.entries["entries"][k]));
                                    }
                                    return object;
                                }($));
                                switch ($_collection__type__properties__update_node.properties.type.state.name) {
                                    case 'dictionary':
                                        raw_data["type"] = [$_collection__type__properties__update_node.properties.type.state.name, (function ($) {
                                                if (!($ instanceof read_api.Cdictionary__type__collection__type__properties__update_node)) {
                                                    throw new Error("HMMM");
                                                }
                                                var $_dictionary__type__collection__type__properties__update_node = $;
                                                var raw_data = {};
                                                return raw_data;
                                            }($_collection__type__properties__update_node.properties.type.state.node))];
                                        break;
                                    case 'matrix':
                                        raw_data["type"] = [$_collection__type__properties__update_node.properties.type.state.name, (function ($) {
                                                if (!($ instanceof read_api.Cmatrix__type__collection__type__properties__update_node)) {
                                                    throw new Error("HMMM");
                                                }
                                                var $_matrix__type__collection__type__properties__update_node = $;
                                                var raw_data = {};
                                                return raw_data;
                                            }($_collection__type__properties__update_node.properties.type.state.node))];
                                        break;
                                    default:
                                        throw new Error('Hmmm');
                                }
                                return raw_data;
                            }($_properties__update_node.properties.type.state.node))];
                        break;
                    case 'component':
                        raw_data["type"] = [$_properties__update_node.properties.type.state.name, (function ($) {
                                if (!($ instanceof read_api.Ccomponent__type__properties__update_node)) {
                                    throw new Error("HMMM");
                                }
                                var $_component__type__properties__update_node = $;
                                var raw_data = {};
                                raw_data["update node"] = serialize_update_node($_component__type__properties__update_node.properties.update_node);
                                return raw_data;
                            }($_properties__update_node.properties.type.state.node))];
                        break;
                    case 'file':
                        raw_data["type"] = [$_properties__update_node.properties.type.state.name, (function ($) {
                                if (!($ instanceof read_api.Cfile__type__properties__update_node)) {
                                    throw new Error("HMMM");
                                }
                                var $_file__type__properties__update_node = $;
                                var raw_data = {};
                                raw_data["new extension"] = $_file__type__properties__update_node.properties.new_extension;
                                raw_data["new token"] = $_file__type__properties__update_node.properties.new_token;
                                return raw_data;
                            }($_properties__update_node.properties.type.state.node))];
                        break;
                    case 'group':
                        raw_data["type"] = [$_properties__update_node.properties.type.state.name, (function ($) {
                                if (!($ instanceof read_api.Cgroup__type__properties__update_node)) {
                                    throw new Error("HMMM");
                                }
                                var $_group__type__properties__update_node = $;
                                var raw_data = {};
                                raw_data["update node"] = serialize_update_node($_group__type__properties__update_node.properties.update_node);
                                return raw_data;
                            }($_properties__update_node.properties.type.state.node))];
                        break;
                    case 'number':
                        raw_data["type"] = [$_properties__update_node.properties.type.state.name, (function ($) {
                                if (!($ instanceof read_api.Cnumber__type__properties__update_node)) {
                                    throw new Error("HMMM");
                                }
                                var $_number__type__properties__update_node = $;
                                var raw_data = {};
                                switch ($_number__type__properties__update_node.properties.type.state.name) {
                                    case 'integer':
                                        raw_data["type"] = [$_number__type__properties__update_node.properties.type.state.name, (function ($) {
                                                if (!($ instanceof read_api.Cinteger__type__number__type__properties__update_node)) {
                                                    throw new Error("HMMM");
                                                }
                                                var $_integer__type__number__type__properties__update_node = $;
                                                var raw_data = {};
                                                raw_data["new value"] = $_integer__type__number__type__properties__update_node.properties.new_value;
                                                return raw_data;
                                            }($_number__type__properties__update_node.properties.type.state.node))];
                                        break;
                                    case 'natural':
                                        raw_data["type"] = [$_number__type__properties__update_node.properties.type.state.name, (function ($) {
                                                if (!($ instanceof read_api.Cnatural__type__number__type__properties__update_node)) {
                                                    throw new Error("HMMM");
                                                }
                                                var $_natural__type__number__type__properties__update_node = $;
                                                var raw_data = {};
                                                raw_data["new value"] = $_natural__type__number__type__properties__update_node.properties.new_value;
                                                return raw_data;
                                            }($_number__type__properties__update_node.properties.type.state.node))];
                                        break;
                                    default:
                                        throw new Error('Hmmm');
                                }
                                return raw_data;
                            }($_properties__update_node.properties.type.state.node))];
                        break;
                    case 'reference':
                        raw_data["type"] = [$_properties__update_node.properties.type.state.name, (function ($) {
                                if (!($ instanceof read_api.Creference__type__properties__update_node)) {
                                    throw new Error("HMMM");
                                }
                                var $_reference__type__properties__update_node = $;
                                var raw_data = {};
                                raw_data["new referenced node"] = $_reference__type__properties__update_node.properties.new_referenced_node;
                                return raw_data;
                            }($_properties__update_node.properties.type.state.node))];
                        break;
                    case 'state group':
                        raw_data["type"] = [$_properties__update_node.properties.type.state.name, (function ($) {
                                if (!($ instanceof read_api.Cstate_group__type__properties__update_node)) {
                                    throw new Error("HMMM");
                                }
                                var $_state_group__type__properties__update_node = $;
                                var raw_data = {};
                                raw_data["state"] = $_state_group__type__properties__update_node.properties.state.entry;
                                switch ($_state_group__type__properties__update_node.properties.type.state.name) {
                                    case 'set':
                                        raw_data["type"] = [$_state_group__type__properties__update_node.properties.type.state.name, (function ($) {
                                                if (!($ instanceof read_api.Cset)) {
                                                    throw new Error("HMMM");
                                                }
                                                var $_set = $;
                                                var raw_data = {};
                                                raw_data["delete node"] = serialize_delete_node($_set.properties.delete_node);
                                                raw_data["node"] = serialize_initialize_node($_set.properties.node);
                                                return raw_data;
                                            }($_state_group__type__properties__update_node.properties.type.state.node))];
                                        break;
                                    case 'update':
                                        raw_data["type"] = [$_state_group__type__properties__update_node.properties.type.state.name, (function ($) {
                                                if (!($ instanceof read_api.Cupdate__type__state_group)) {
                                                    throw new Error("HMMM");
                                                }
                                                var $_update__type__state_group = $;
                                                var raw_data = {};
                                                raw_data["update node"] = serialize_update_node($_update__type__state_group.properties.update_node);
                                                return raw_data;
                                            }($_state_group__type__properties__update_node.properties.type.state.node))];
                                        break;
                                    default:
                                        throw new Error('Hmmm');
                                }
                                return raw_data;
                            }($_properties__update_node.properties.type.state.node))];
                        break;
                    case 'text':
                        raw_data["type"] = [$_properties__update_node.properties.type.state.name, (function ($) {
                                if (!($ instanceof read_api.Ctext__type__properties__update_node)) {
                                    throw new Error("HMMM");
                                }
                                var $_text__type__properties__update_node = $;
                                var raw_data = {};
                                raw_data["new value"] = $_text__type__properties__update_node.properties.new_value;
                                return raw_data;
                            }($_properties__update_node.properties.type.state.node))];
                        break;
                    default:
                        throw new Error('Hmmm');
                }
                return raw_data;
            }($_update_node.properties.properties["entries"][k]));
        }
        return object;
    }($));
    return raw_data;
});
exports.serialize = (function ($) {
    if (!($ instanceof read_api.Cinterface_reply)) {
        throw new Error("HMMM");
    }
    var $_interface_reply = $;
    var raw_data = {};
    switch ($_interface_reply.properties.type.state.name) {
        case 'initialization':
            raw_data["type"] = [$_interface_reply.properties.type.state.name, (function ($) {
                    if (!($ instanceof read_api.Cinitialization)) {
                        throw new Error("HMMM");
                    }
                    var $_initialization = $;
                    var raw_data = {};
                    switch ($_initialization.properties.has_initialization_data.state.name) {
                        case 'no':
                            raw_data["has initialization data"] = [$_initialization.properties.has_initialization_data.state.name, (function ($) {
                                    if (!($ instanceof read_api.Cno__has_initialization_data)) {
                                        throw new Error("HMMM");
                                    }
                                    var $_no__has_initialization_data = $;
                                    var raw_data = {};
                                    return raw_data;
                                }($_initialization.properties.has_initialization_data.state.node))];
                            break;
                        case 'yes':
                            raw_data["has initialization data"] = [$_initialization.properties.has_initialization_data.state.name, (function ($) {
                                    if (!($ instanceof read_api.Cyes__has_initialization_data)) {
                                        throw new Error("HMMM");
                                    }
                                    var $_yes__has_initialization_data = $;
                                    var raw_data = {};
                                    switch ($_yes__has_initialization_data.properties.context_exists.state.name) {
                                        case 'no':
                                            raw_data["context exists"] = [$_yes__has_initialization_data.properties.context_exists.state.name, (function ($) {
                                                    if (!($ instanceof read_api.Cno__context_exists)) {
                                                        throw new Error("HMMM");
                                                    }
                                                    var $_no__context_exists = $;
                                                    var raw_data = {};
                                                    return raw_data;
                                                }($_yes__has_initialization_data.properties.context_exists.state.node))];
                                            break;
                                        case 'yes':
                                            raw_data["context exists"] = [$_yes__has_initialization_data.properties.context_exists.state.name, (function ($) {
                                                    if (!($ instanceof read_api.Cyes__context_exists)) {
                                                        throw new Error("HMMM");
                                                    }
                                                    var $_yes__context_exists = $;
                                                    var raw_data = {};
                                                    raw_data["root"] = serialize_initialize_node($_yes__context_exists.properties.root);
                                                    return raw_data;
                                                }($_yes__has_initialization_data.properties.context_exists.state.node))];
                                            break;
                                        default:
                                            throw new Error('Hmmm');
                                    }
                                    return raw_data;
                                }($_initialization.properties.has_initialization_data.state.node))];
                            break;
                        default:
                            throw new Error('Hmmm');
                    }
                    return raw_data;
                }($_interface_reply.properties.type.state.node))];
            break;
        case 'notification':
            raw_data["type"] = [$_interface_reply.properties.type.state.name, (function ($) {
                    if (!($ instanceof read_api.Cnotification)) {
                        throw new Error("HMMM");
                    }
                    var $_notification = $;
                    var raw_data = {};
                    switch ($_notification.properties.type.state.name) {
                        case 'create':
                            raw_data["type"] = [$_notification.properties.type.state.name, (function ($) {
                                    if (!($ instanceof read_api.Ccreate__type__notification)) {
                                        throw new Error("HMMM");
                                    }
                                    var $_create__type__notification = $;
                                    var raw_data = {};
                                    raw_data["initialize node"] = serialize_initialize_node($_create__type__notification.properties.initialize_node);
                                    return raw_data;
                                }($_notification.properties.type.state.node))];
                            break;
                        case 'remove':
                            raw_data["type"] = [$_notification.properties.type.state.name, (function ($) {
                                    if (!($ instanceof read_api.Cremove__type__notification)) {
                                        throw new Error("HMMM");
                                    }
                                    var $_remove__type__notification = $;
                                    var raw_data = {};
                                    return raw_data;
                                }($_notification.properties.type.state.node))];
                            break;
                        case 'update':
                            raw_data["type"] = [$_notification.properties.type.state.name, (function ($) {
                                    if (!($ instanceof read_api.Cupdate__type__notification)) {
                                        throw new Error("HMMM");
                                    }
                                    var $_update__type__notification = $;
                                    var raw_data = {};
                                    raw_data["update node"] = serialize_update_node($_update__type__notification.properties.update_node);
                                    return raw_data;
                                }($_notification.properties.type.state.node))];
                            break;
                        default:
                            throw new Error('Hmmm');
                    }
                    return raw_data;
                }($_interface_reply.properties.type.state.node))];
            break;
        default:
            throw new Error('Hmmm');
    }
    return raw_data;
});
