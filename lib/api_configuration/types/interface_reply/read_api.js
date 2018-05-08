var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var id = require("./identifier");
var AlanNode = (function () {
    function AlanNode() {
        this.reference_count = 0;
        this.properties = {};
    }
    AlanNode.prototype.isRemoved = function () {
        return this.removed === true;
    };
    return AlanNode;
}());
exports.AlanNode = AlanNode;
var DictionaryNode = (function (_super) {
    __extends(DictionaryNode, _super);
    function DictionaryNode() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DictionaryNode.prototype.getParent = function () {
        return this.parent;
    };
    DictionaryNode.prototype.getCollectionParent = function () {
        return this.parent;
    };
    DictionaryNode.prototype.getKey = function () {
        return this.key;
    };
    DictionaryNode.prototype.getDictionaryKey = function () {
        return this.key;
    };
    return DictionaryNode;
}(AlanNode));
exports.DictionaryNode = DictionaryNode;
var MatrixNode = (function (_super) {
    __extends(MatrixNode, _super);
    function MatrixNode() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MatrixNode.prototype.getParent = function () {
        return this.parent;
    };
    MatrixNode.prototype.getCollectionParent = function () {
        return this.parent;
    };
    MatrixNode.prototype.getKey = function () {
        return this.key.referenced_node;
    };
    MatrixNode.prototype.getMatrixKey = function () {
        return this.key.referenced_node;
    };
    return MatrixNode;
}(AlanNode));
exports.MatrixNode = MatrixNode;
var StateNode = (function (_super) {
    __extends(StateNode, _super);
    function StateNode() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    StateNode.prototype.getParent = function () {
        return this.parent;
    };
    StateNode.prototype.getStateParent = function () {
        return this.parent;
    };
    return StateNode;
}(AlanNode));
exports.StateNode = StateNode;
var GroupNode = (function (_super) {
    __extends(GroupNode, _super);
    function GroupNode() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    GroupNode.prototype.getParent = function () {
        return this.parent;
    };
    GroupNode.prototype.getGroupParent = function () {
        return this.parent;
    };
    return GroupNode;
}(AlanNode));
exports.GroupNode = GroupNode;
var Collection = (function () {
    function Collection(parent, collection_name, entries) {
        this.entries = {};
        this.parent = parent;
        this.collection_name = collection_name;
        this.entries = entries;
    }
    Collection.prototype.walk = function (walkFunc) {
        var k;
        for (k in this.entries) {
            walkFunc(this.entries[k]);
        }
    };
    Collection.prototype.toList = function (sortFunc, mapFunc) {
        var mapped_array = [];
        var k;
        for (k in this.entries) {
            mapped_array.push(this.entries[k]);
        }
        return mapped_array.sort(sortFunc).map(mapFunc);
    };
    Collection.prototype.getEntry = function (key) {
        var entry;
        if ((entry = this.entries[key]) === undefined) {
            throw new Error('Entry ' + key + ' does not exist in collection "' + this.collection_name + '" in ' + this.parent.getPath() + '.');
        }
        return entry;
    };
    Collection.prototype.switchOnEntryExists = function (key, onExists, onNotExists) {
        var entry = this.entries[key];
        if (entry === undefined) {
            if (typeof onNotExists === 'function') {
                return onNotExists();
            }
            else {
                return onNotExists;
            }
        }
        else {
            if (typeof onExists === 'function') {
                return onExists(this.entries[key]);
            }
            else {
                return onExists;
            }
        }
    };
    return Collection;
}());
exports.Collection = Collection;
var Matrix = (function (_super) {
    __extends(Matrix, _super);
    function Matrix(parent, collection_name, entries) {
        return _super.call(this, parent, collection_name, entries) || this;
    }
    Matrix.prototype.mapToDictionary = function (mapFunc) {
        var mapped_object = {};
        var k;
        for (k in this.entries) {
            mapped_object[k] = mapFunc(this.entries[k]);
        }
        return mapped_object;
    };
    return Matrix;
}(Collection));
exports.Matrix = Matrix;
var Dictionary = (function (_super) {
    __extends(Dictionary, _super);
    function Dictionary(parent, collection_name, entries) {
        return _super.call(this, parent, collection_name, entries) || this;
    }
    Dictionary.prototype.map = function (mapFunc) {
        var mapped_object = {};
        var k;
        for (k in this.entries) {
            mapped_object[k] = mapFunc(this.entries[k]);
        }
        return mapped_object;
    };
    return Dictionary;
}(Collection));
exports.Dictionary = Dictionary;
var StateGroup = (function () {
    function StateGroup(s) {
        this.state = s;
    }
    StateGroup.prototype.switch = function (cases) {
        var handler = cases[this.state.name];
        if (typeof handler === "function") {
            return handler(this.state.node);
        }
        else {
            return handler;
        }
    };
    StateGroup.prototype.cast = function (state) {
        return this.state.node;
    };
    return StateGroup;
}());
exports.StateGroup = StateGroup;
var Cinterface_reply = (function (_super) {
    __extends(Cinterface_reply, _super);
    function Cinterface_reply() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'";
        return _this;
    }
    Cinterface_reply.prototype.getInputParameter_interface = function () {
        var param_res;
        this.imp_resolveGlobalInputParameter("interface", function (err, paramval) {
            if (err) {
                throw "Unexpected resolution error for input parameter!";
            }
            else {
                param_res = paramval;
            }
        }, function () { throw new Error('Input parameter could not be resolved'); });
        return param_res;
    };
    Cinterface_reply.prototype.getInputParameter_request = function () {
        var param_res;
        this.imp_resolveGlobalInputParameter("request", function (err, paramval) {
            if (err) {
                throw "Unexpected resolution error for input parameter!";
            }
            else {
                param_res = paramval;
            }
        }, function () { throw new Error('Input parameter could not be resolved'); });
        return param_res;
    };
    Cinterface_reply.prototype.getPath = function () {
        return '';
    };
    return Cinterface_reply;
}(AlanNode));
exports.Cinterface_reply = Cinterface_reply;
var Cinitialization = (function (_super) {
    __extends(Cinitialization, _super);
    function Cinitialization() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'?'type'*'initialization'";
        return _this;
    }
    Cinitialization.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'initialization'";
    };
    Cinitialization.prototype.getConstrainingContextValue_source = function () {
        return this.state_context_values["source"].referenced_node;
    };
    return Cinitialization;
}(StateNode));
exports.Cinitialization = Cinitialization;
var Cno__has_initialization_data = (function (_super) {
    __extends(Cno__has_initialization_data, _super);
    function Cno__has_initialization_data() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'?'type'*'initialization'?'has initialization data'*'no'";
        return _this;
    }
    Cno__has_initialization_data.prototype.getPath = function () {
        return this.parent.getPath() + "?'has initialization data'*'no'";
    };
    Cno__has_initialization_data.prototype.getConstrainingContextValue_source = function () {
        return this.state_context_values["source"].referenced_node;
    };
    return Cno__has_initialization_data;
}(StateNode));
exports.Cno__has_initialization_data = Cno__has_initialization_data;
var Cyes__has_initialization_data = (function (_super) {
    __extends(Cyes__has_initialization_data, _super);
    function Cyes__has_initialization_data() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'?'type'*'initialization'?'has initialization data'*'yes'";
        return _this;
    }
    Cyes__has_initialization_data.prototype.getPath = function () {
        return this.parent.getPath() + "?'has initialization data'*'yes'";
    };
    Cyes__has_initialization_data.prototype.getConstrainingContextValue_source = function () {
        return this.state_context_values["source"].referenced_node;
    };
    return Cyes__has_initialization_data;
}(StateNode));
exports.Cyes__has_initialization_data = Cyes__has_initialization_data;
var Cno__context_exists = (function (_super) {
    __extends(Cno__context_exists, _super);
    function Cno__context_exists() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'?'type'*'initialization'?'has initialization data'*'yes'?'context exists'*'no'";
        return _this;
    }
    Cno__context_exists.prototype.getPath = function () {
        return this.parent.getPath() + "?'context exists'*'no'";
    };
    return Cno__context_exists;
}(StateNode));
exports.Cno__context_exists = Cno__context_exists;
var Cyes__context_exists = (function (_super) {
    __extends(Cyes__context_exists, _super);
    function Cyes__context_exists() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'?'type'*'initialization'?'has initialization data'*'yes'?'context exists'*'yes'";
        return _this;
    }
    Cyes__context_exists.prototype.getPath = function () {
        return this.parent.getPath() + "?'context exists'*'yes'";
    };
    return Cyes__context_exists;
}(StateNode));
exports.Cyes__context_exists = Cyes__context_exists;
var Cnotification = (function (_super) {
    __extends(Cnotification, _super);
    function Cnotification() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'?'type'*'notification'";
        return _this;
    }
    Cnotification.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'notification'";
    };
    Cnotification.prototype.getConstrainingContextValue_source = function () {
        return this.state_context_values["source"].referenced_node;
    };
    return Cnotification;
}(StateNode));
exports.Cnotification = Cnotification;
var Ccreate__type__notification = (function (_super) {
    __extends(Ccreate__type__notification, _super);
    function Ccreate__type__notification() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'?'type'*'notification'?'type'*'create'";
        return _this;
    }
    Ccreate__type__notification.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'create'";
    };
    return Ccreate__type__notification;
}(StateNode));
exports.Ccreate__type__notification = Ccreate__type__notification;
var Cremove__type__notification = (function (_super) {
    __extends(Cremove__type__notification, _super);
    function Cremove__type__notification() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'?'type'*'notification'?'type'*'remove'";
        return _this;
    }
    Cremove__type__notification.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'remove'";
    };
    return Cremove__type__notification;
}(StateNode));
exports.Cremove__type__notification = Cremove__type__notification;
var Cupdate__type__notification = (function (_super) {
    __extends(Cupdate__type__notification, _super);
    function Cupdate__type__notification() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'?'type'*'notification'?'type'*'update'";
        return _this;
    }
    Cupdate__type__notification.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'update'";
    };
    return Cupdate__type__notification;
}(StateNode));
exports.Cupdate__type__notification = Cupdate__type__notification;
var Cdelete_node = (function (_super) {
    __extends(Cdelete_node, _super);
    function Cdelete_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'delete node'";
        return _this;
    }
    Cdelete_node.prototype.getPath = function () {
        return this.location.getPath() + '\'' + this.property_component_name + '\'';
    };
    Cdelete_node.prototype.switchOnLocation = function (cases) {
        var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
        if (typeof current_case === 'function') {
            return current_case(this.location);
        }
        else {
            return current_case;
        }
    };
    Cdelete_node.prototype.castToLocation__interface_reply___update_node___properties___type___collection___entries___type___remove___delete_node_ = function () {
        return this.location;
    };
    Cdelete_node.prototype.castToLocation__interface_reply___update_node___properties___type___state_group___type___set___delete_node_ = function () {
        return this.location;
    };
    return Cdelete_node;
}(AlanNode));
exports.Cdelete_node = Cdelete_node;
var Cinitialize_node = (function (_super) {
    __extends(Cinitialize_node, _super);
    function Cinitialize_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'initialize node'";
        return _this;
    }
    Cinitialize_node.prototype.getPath = function () {
        return this.location.getPath() + '\'' + this.property_component_name + '\'';
    };
    Cinitialize_node.prototype.switchOnLocation = function (cases) {
        var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
        if (typeof current_case === 'function') {
            return current_case(this.location);
        }
        else {
            return current_case;
        }
    };
    Cinitialize_node.prototype.castToLocation__interface_reply___type___initialization___has_initialization_data___yes___context_exists___yes___root_ = function () {
        return this.location;
    };
    Cinitialize_node.prototype.castToLocation__interface_reply___type___notification___type___create___initialize_node_ = function () {
        return this.location;
    };
    Cinitialize_node.prototype.castToLocation__interface_reply___initialize_node___properties___type___collection___entries___node_ = function () {
        return this.location;
    };
    Cinitialize_node.prototype.castToLocation__interface_reply___initialize_node___properties___type___component___node_ = function () {
        return this.location;
    };
    Cinitialize_node.prototype.castToLocation__interface_reply___initialize_node___properties___type___group___node_ = function () {
        return this.location;
    };
    Cinitialize_node.prototype.castToLocation__interface_reply___initialize_node___properties___type___state_group___node_ = function () {
        return this.location;
    };
    Cinitialize_node.prototype.castToLocation__interface_reply___update_node___properties___type___collection___entries___type___create___node_ = function () {
        return this.location;
    };
    Cinitialize_node.prototype.castToLocation__interface_reply___update_node___properties___type___state_group___type___set___node_ = function () {
        return this.location;
    };
    Cinitialize_node.prototype.getInputParameter_context_node = function () {
        var param_res;
        this.imp_resolveInputParameter("context node", function (err, paramval) {
            if (err) {
                throw "Unexpected resolution error for input parameter!";
            }
            else {
                param_res = paramval;
            }
        }, function () { throw new Error('Input parameter could not be resolved'); });
        return param_res;
    };
    return Cinitialize_node;
}(AlanNode));
exports.Cinitialize_node = Cinitialize_node;
var Cproperties__initialize_node = (function (_super) {
    __extends(Cproperties__initialize_node, _super);
    function Cproperties__initialize_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'initialize node'.'properties'";
        return _this;
    }
    Cproperties__initialize_node.prototype.getPath = function () {
        return this.parent.getPath() + ".'properties'[" + id.serializeIdentifier(this.key.entry) + "]";
    };
    return Cproperties__initialize_node;
}(MatrixNode));
exports.Cproperties__initialize_node = Cproperties__initialize_node;
var Ccollection__type__properties__initialize_node = (function (_super) {
    __extends(Ccollection__type__properties__initialize_node, _super);
    function Ccollection__type__properties__initialize_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'initialize node'.'properties'?'type'*'collection'";
        return _this;
    }
    Ccollection__type__properties__initialize_node.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'collection'";
    };
    Ccollection__type__properties__initialize_node.prototype.getConstrainingContextValue_collection = function () {
        return this.state_context_values["collection"].referenced_node;
    };
    return Ccollection__type__properties__initialize_node;
}(StateNode));
exports.Ccollection__type__properties__initialize_node = Ccollection__type__properties__initialize_node;
var Centries__collection__type__properties__initialize_node = (function (_super) {
    __extends(Centries__collection__type__properties__initialize_node, _super);
    function Centries__collection__type__properties__initialize_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'initialize node'.'properties'?'type'*'collection'.'entries'";
        return _this;
    }
    Centries__collection__type__properties__initialize_node.prototype.getPath = function () {
        return this.parent.getPath() + ".'entries'[" + id.serializeIdentifier(this.key) + "]";
    };
    return Centries__collection__type__properties__initialize_node;
}(DictionaryNode));
exports.Centries__collection__type__properties__initialize_node = Centries__collection__type__properties__initialize_node;
var Cdictionary__type__collection__type__properties__initialize_node = (function (_super) {
    __extends(Cdictionary__type__collection__type__properties__initialize_node, _super);
    function Cdictionary__type__collection__type__properties__initialize_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'initialize node'.'properties'?'type'*'collection'?'type'*'dictionary'";
        return _this;
    }
    Cdictionary__type__collection__type__properties__initialize_node.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'dictionary'";
    };
    Cdictionary__type__collection__type__properties__initialize_node.prototype.getConstrainingContextValue_dictionary = function () {
        return this.state_context_values["dictionary"].referenced_node;
    };
    return Cdictionary__type__collection__type__properties__initialize_node;
}(StateNode));
exports.Cdictionary__type__collection__type__properties__initialize_node = Cdictionary__type__collection__type__properties__initialize_node;
var Cmatrix__type__collection__type__properties__initialize_node = (function (_super) {
    __extends(Cmatrix__type__collection__type__properties__initialize_node, _super);
    function Cmatrix__type__collection__type__properties__initialize_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'initialize node'.'properties'?'type'*'collection'?'type'*'matrix'";
        return _this;
    }
    Cmatrix__type__collection__type__properties__initialize_node.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'matrix'";
    };
    Cmatrix__type__collection__type__properties__initialize_node.prototype.getConstrainingContextValue_matrix = function () {
        return this.state_context_values["matrix"].referenced_node;
    };
    return Cmatrix__type__collection__type__properties__initialize_node;
}(StateNode));
exports.Cmatrix__type__collection__type__properties__initialize_node = Cmatrix__type__collection__type__properties__initialize_node;
var Ccomponent__type__properties__initialize_node = (function (_super) {
    __extends(Ccomponent__type__properties__initialize_node, _super);
    function Ccomponent__type__properties__initialize_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'initialize node'.'properties'?'type'*'component'";
        return _this;
    }
    Ccomponent__type__properties__initialize_node.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'component'";
    };
    Ccomponent__type__properties__initialize_node.prototype.getConstrainingContextValue_component = function () {
        return this.state_context_values["component"].referenced_node;
    };
    return Ccomponent__type__properties__initialize_node;
}(StateNode));
exports.Ccomponent__type__properties__initialize_node = Ccomponent__type__properties__initialize_node;
var Cfile__type__properties__initialize_node = (function (_super) {
    __extends(Cfile__type__properties__initialize_node, _super);
    function Cfile__type__properties__initialize_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'initialize node'.'properties'?'type'*'file'";
        return _this;
    }
    Cfile__type__properties__initialize_node.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'file'";
    };
    Cfile__type__properties__initialize_node.prototype.getConstrainingContextValue_text = function () {
        return this.state_context_values["text"].referenced_node;
    };
    return Cfile__type__properties__initialize_node;
}(StateNode));
exports.Cfile__type__properties__initialize_node = Cfile__type__properties__initialize_node;
var Cgroup__type__properties__initialize_node = (function (_super) {
    __extends(Cgroup__type__properties__initialize_node, _super);
    function Cgroup__type__properties__initialize_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'initialize node'.'properties'?'type'*'group'";
        return _this;
    }
    Cgroup__type__properties__initialize_node.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'group'";
    };
    Cgroup__type__properties__initialize_node.prototype.getConstrainingContextValue_group = function () {
        return this.state_context_values["group"].referenced_node;
    };
    return Cgroup__type__properties__initialize_node;
}(StateNode));
exports.Cgroup__type__properties__initialize_node = Cgroup__type__properties__initialize_node;
var Cnumber__type__properties__initialize_node = (function (_super) {
    __extends(Cnumber__type__properties__initialize_node, _super);
    function Cnumber__type__properties__initialize_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'initialize node'.'properties'?'type'*'number'";
        return _this;
    }
    Cnumber__type__properties__initialize_node.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'number'";
    };
    Cnumber__type__properties__initialize_node.prototype.getConstrainingContextValue_number = function () {
        return this.state_context_values["number"].referenced_node;
    };
    return Cnumber__type__properties__initialize_node;
}(StateNode));
exports.Cnumber__type__properties__initialize_node = Cnumber__type__properties__initialize_node;
var Cinteger__type__number__type__properties__initialize_node = (function (_super) {
    __extends(Cinteger__type__number__type__properties__initialize_node, _super);
    function Cinteger__type__number__type__properties__initialize_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'initialize node'.'properties'?'type'*'number'?'type'*'integer'";
        return _this;
    }
    Cinteger__type__number__type__properties__initialize_node.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'integer'";
    };
    Cinteger__type__number__type__properties__initialize_node.prototype.getConstrainingContextValue_integer_type = function () {
        return this.state_context_values["integer type"].referenced_node;
    };
    return Cinteger__type__number__type__properties__initialize_node;
}(StateNode));
exports.Cinteger__type__number__type__properties__initialize_node = Cinteger__type__number__type__properties__initialize_node;
var Cnatural__type__number__type__properties__initialize_node = (function (_super) {
    __extends(Cnatural__type__number__type__properties__initialize_node, _super);
    function Cnatural__type__number__type__properties__initialize_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'initialize node'.'properties'?'type'*'number'?'type'*'natural'";
        return _this;
    }
    Cnatural__type__number__type__properties__initialize_node.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'natural'";
    };
    Cnatural__type__number__type__properties__initialize_node.prototype.getConstrainingContextValue_natural_type = function () {
        return this.state_context_values["natural type"].referenced_node;
    };
    return Cnatural__type__number__type__properties__initialize_node;
}(StateNode));
exports.Cnatural__type__number__type__properties__initialize_node = Cnatural__type__number__type__properties__initialize_node;
var Creference__type__properties__initialize_node = (function (_super) {
    __extends(Creference__type__properties__initialize_node, _super);
    function Creference__type__properties__initialize_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'initialize node'.'properties'?'type'*'reference'";
        return _this;
    }
    Creference__type__properties__initialize_node.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'reference'";
    };
    Creference__type__properties__initialize_node.prototype.getConstrainingContextValue_reference = function () {
        return this.state_context_values["reference"].referenced_node;
    };
    return Creference__type__properties__initialize_node;
}(StateNode));
exports.Creference__type__properties__initialize_node = Creference__type__properties__initialize_node;
var Cstate_group__type__properties__initialize_node = (function (_super) {
    __extends(Cstate_group__type__properties__initialize_node, _super);
    function Cstate_group__type__properties__initialize_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'initialize node'.'properties'?'type'*'state group'";
        return _this;
    }
    Cstate_group__type__properties__initialize_node.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'state group'";
    };
    Cstate_group__type__properties__initialize_node.prototype.getConstrainingContextValue_state_group = function () {
        return this.state_context_values["state group"].referenced_node;
    };
    return Cstate_group__type__properties__initialize_node;
}(StateNode));
exports.Cstate_group__type__properties__initialize_node = Cstate_group__type__properties__initialize_node;
var Ctext__type__properties__initialize_node = (function (_super) {
    __extends(Ctext__type__properties__initialize_node, _super);
    function Ctext__type__properties__initialize_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'initialize node'.'properties'?'type'*'text'";
        return _this;
    }
    Ctext__type__properties__initialize_node.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'text'";
    };
    Ctext__type__properties__initialize_node.prototype.getConstrainingContextValue_text = function () {
        return this.state_context_values["text"].referenced_node;
    };
    return Ctext__type__properties__initialize_node;
}(StateNode));
exports.Ctext__type__properties__initialize_node = Ctext__type__properties__initialize_node;
var Cupdate_node = (function (_super) {
    __extends(Cupdate_node, _super);
    function Cupdate_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'update node'";
        return _this;
    }
    Cupdate_node.prototype.getPath = function () {
        return this.location.getPath() + '\'' + this.property_component_name + '\'';
    };
    Cupdate_node.prototype.switchOnLocation = function (cases) {
        var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
        if (typeof current_case === 'function') {
            return current_case(this.location);
        }
        else {
            return current_case;
        }
    };
    Cupdate_node.prototype.castToLocation__interface_reply___type___notification___type___update___update_node_ = function () {
        return this.location;
    };
    Cupdate_node.prototype.castToLocation__interface_reply___update_node___properties___type___collection___entries___type___update___update_node_ = function () {
        return this.location;
    };
    Cupdate_node.prototype.castToLocation__interface_reply___update_node___properties___type___component___update_node_ = function () {
        return this.location;
    };
    Cupdate_node.prototype.castToLocation__interface_reply___update_node___properties___type___group___update_node_ = function () {
        return this.location;
    };
    Cupdate_node.prototype.castToLocation__interface_reply___update_node___properties___type___state_group___type___update___update_node_ = function () {
        return this.location;
    };
    Cupdate_node.prototype.getInputParameter_context_node = function () {
        var param_res;
        this.imp_resolveInputParameter("context node", function (err, paramval) {
            if (err) {
                throw "Unexpected resolution error for input parameter!";
            }
            else {
                param_res = paramval;
            }
        }, function () { throw new Error('Input parameter could not be resolved'); });
        return param_res;
    };
    return Cupdate_node;
}(AlanNode));
exports.Cupdate_node = Cupdate_node;
var Cproperties__update_node = (function (_super) {
    __extends(Cproperties__update_node, _super);
    function Cproperties__update_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'update node'.'properties'";
        return _this;
    }
    Cproperties__update_node.prototype.getPath = function () {
        return this.parent.getPath() + ".'properties'[" + id.serializeIdentifier(this.key.entry) + "]";
    };
    return Cproperties__update_node;
}(MatrixNode));
exports.Cproperties__update_node = Cproperties__update_node;
var Ccollection__type__properties__update_node = (function (_super) {
    __extends(Ccollection__type__properties__update_node, _super);
    function Ccollection__type__properties__update_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'update node'.'properties'?'type'*'collection'";
        return _this;
    }
    Ccollection__type__properties__update_node.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'collection'";
    };
    Ccollection__type__properties__update_node.prototype.getConstrainingContextValue_collection = function () {
        return this.state_context_values["collection"].referenced_node;
    };
    return Ccollection__type__properties__update_node;
}(StateNode));
exports.Ccollection__type__properties__update_node = Ccollection__type__properties__update_node;
var Centries__collection__type__properties__update_node = (function (_super) {
    __extends(Centries__collection__type__properties__update_node, _super);
    function Centries__collection__type__properties__update_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'update node'.'properties'?'type'*'collection'.'entries'";
        return _this;
    }
    Centries__collection__type__properties__update_node.prototype.getPath = function () {
        return this.parent.getPath() + ".'entries'[" + id.serializeIdentifier(this.key) + "]";
    };
    return Centries__collection__type__properties__update_node;
}(DictionaryNode));
exports.Centries__collection__type__properties__update_node = Centries__collection__type__properties__update_node;
var Ccreate__type__entries = (function (_super) {
    __extends(Ccreate__type__entries, _super);
    function Ccreate__type__entries() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'update node'.'properties'?'type'*'collection'.'entries'?'type'*'create'";
        return _this;
    }
    Ccreate__type__entries.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'create'";
    };
    return Ccreate__type__entries;
}(StateNode));
exports.Ccreate__type__entries = Ccreate__type__entries;
var Cremove__type__entries = (function (_super) {
    __extends(Cremove__type__entries, _super);
    function Cremove__type__entries() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'update node'.'properties'?'type'*'collection'.'entries'?'type'*'remove'";
        return _this;
    }
    Cremove__type__entries.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'remove'";
    };
    return Cremove__type__entries;
}(StateNode));
exports.Cremove__type__entries = Cremove__type__entries;
var Crename = (function (_super) {
    __extends(Crename, _super);
    function Crename() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'update node'.'properties'?'type'*'collection'.'entries'?'type'*'rename'";
        return _this;
    }
    Crename.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'rename'";
    };
    return Crename;
}(StateNode));
exports.Crename = Crename;
var Cupdate__type__entries = (function (_super) {
    __extends(Cupdate__type__entries, _super);
    function Cupdate__type__entries() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'update node'.'properties'?'type'*'collection'.'entries'?'type'*'update'";
        return _this;
    }
    Cupdate__type__entries.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'update'";
    };
    return Cupdate__type__entries;
}(StateNode));
exports.Cupdate__type__entries = Cupdate__type__entries;
var Cno__invalidate_referencer = (function (_super) {
    __extends(Cno__invalidate_referencer, _super);
    function Cno__invalidate_referencer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'update node'.'properties'?'type'*'collection'.'entries'?'type'*'update'?'invalidate referencer'*'no'";
        return _this;
    }
    Cno__invalidate_referencer.prototype.getPath = function () {
        return this.parent.getPath() + "?'invalidate referencer'*'no'";
    };
    return Cno__invalidate_referencer;
}(StateNode));
exports.Cno__invalidate_referencer = Cno__invalidate_referencer;
var Cyes__invalidate_referencer = (function (_super) {
    __extends(Cyes__invalidate_referencer, _super);
    function Cyes__invalidate_referencer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'update node'.'properties'?'type'*'collection'.'entries'?'type'*'update'?'invalidate referencer'*'yes'";
        return _this;
    }
    Cyes__invalidate_referencer.prototype.getPath = function () {
        return this.parent.getPath() + "?'invalidate referencer'*'yes'";
    };
    Cyes__invalidate_referencer.prototype.getConstrainingContextValue_matrix = function () {
        return this.state_context_values["matrix"].referenced_node;
    };
    return Cyes__invalidate_referencer;
}(StateNode));
exports.Cyes__invalidate_referencer = Cyes__invalidate_referencer;
var Cdictionary__type__collection__type__properties__update_node = (function (_super) {
    __extends(Cdictionary__type__collection__type__properties__update_node, _super);
    function Cdictionary__type__collection__type__properties__update_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'update node'.'properties'?'type'*'collection'?'type'*'dictionary'";
        return _this;
    }
    Cdictionary__type__collection__type__properties__update_node.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'dictionary'";
    };
    Cdictionary__type__collection__type__properties__update_node.prototype.getConstrainingContextValue_dictionary = function () {
        return this.state_context_values["dictionary"].referenced_node;
    };
    return Cdictionary__type__collection__type__properties__update_node;
}(StateNode));
exports.Cdictionary__type__collection__type__properties__update_node = Cdictionary__type__collection__type__properties__update_node;
var Cmatrix__type__collection__type__properties__update_node = (function (_super) {
    __extends(Cmatrix__type__collection__type__properties__update_node, _super);
    function Cmatrix__type__collection__type__properties__update_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'update node'.'properties'?'type'*'collection'?'type'*'matrix'";
        return _this;
    }
    Cmatrix__type__collection__type__properties__update_node.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'matrix'";
    };
    Cmatrix__type__collection__type__properties__update_node.prototype.getConstrainingContextValue_matrix = function () {
        return this.state_context_values["matrix"].referenced_node;
    };
    return Cmatrix__type__collection__type__properties__update_node;
}(StateNode));
exports.Cmatrix__type__collection__type__properties__update_node = Cmatrix__type__collection__type__properties__update_node;
var Ccomponent__type__properties__update_node = (function (_super) {
    __extends(Ccomponent__type__properties__update_node, _super);
    function Ccomponent__type__properties__update_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'update node'.'properties'?'type'*'component'";
        return _this;
    }
    Ccomponent__type__properties__update_node.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'component'";
    };
    Ccomponent__type__properties__update_node.prototype.getConstrainingContextValue_component = function () {
        return this.state_context_values["component"].referenced_node;
    };
    return Ccomponent__type__properties__update_node;
}(StateNode));
exports.Ccomponent__type__properties__update_node = Ccomponent__type__properties__update_node;
var Cfile__type__properties__update_node = (function (_super) {
    __extends(Cfile__type__properties__update_node, _super);
    function Cfile__type__properties__update_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'update node'.'properties'?'type'*'file'";
        return _this;
    }
    Cfile__type__properties__update_node.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'file'";
    };
    Cfile__type__properties__update_node.prototype.getConstrainingContextValue_file = function () {
        return this.state_context_values["file"].referenced_node;
    };
    return Cfile__type__properties__update_node;
}(StateNode));
exports.Cfile__type__properties__update_node = Cfile__type__properties__update_node;
var Cgroup__type__properties__update_node = (function (_super) {
    __extends(Cgroup__type__properties__update_node, _super);
    function Cgroup__type__properties__update_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'update node'.'properties'?'type'*'group'";
        return _this;
    }
    Cgroup__type__properties__update_node.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'group'";
    };
    Cgroup__type__properties__update_node.prototype.getConstrainingContextValue_group = function () {
        return this.state_context_values["group"].referenced_node;
    };
    return Cgroup__type__properties__update_node;
}(StateNode));
exports.Cgroup__type__properties__update_node = Cgroup__type__properties__update_node;
var Cnumber__type__properties__update_node = (function (_super) {
    __extends(Cnumber__type__properties__update_node, _super);
    function Cnumber__type__properties__update_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'update node'.'properties'?'type'*'number'";
        return _this;
    }
    Cnumber__type__properties__update_node.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'number'";
    };
    Cnumber__type__properties__update_node.prototype.getConstrainingContextValue_number = function () {
        return this.state_context_values["number"].referenced_node;
    };
    return Cnumber__type__properties__update_node;
}(StateNode));
exports.Cnumber__type__properties__update_node = Cnumber__type__properties__update_node;
var Cinteger__type__number__type__properties__update_node = (function (_super) {
    __extends(Cinteger__type__number__type__properties__update_node, _super);
    function Cinteger__type__number__type__properties__update_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'update node'.'properties'?'type'*'number'?'type'*'integer'";
        return _this;
    }
    Cinteger__type__number__type__properties__update_node.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'integer'";
    };
    Cinteger__type__number__type__properties__update_node.prototype.getConstrainingContextValue_integer_type = function () {
        return this.state_context_values["integer type"].referenced_node;
    };
    return Cinteger__type__number__type__properties__update_node;
}(StateNode));
exports.Cinteger__type__number__type__properties__update_node = Cinteger__type__number__type__properties__update_node;
var Cnatural__type__number__type__properties__update_node = (function (_super) {
    __extends(Cnatural__type__number__type__properties__update_node, _super);
    function Cnatural__type__number__type__properties__update_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'update node'.'properties'?'type'*'number'?'type'*'natural'";
        return _this;
    }
    Cnatural__type__number__type__properties__update_node.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'natural'";
    };
    Cnatural__type__number__type__properties__update_node.prototype.getConstrainingContextValue_natural_type = function () {
        return this.state_context_values["natural type"].referenced_node;
    };
    return Cnatural__type__number__type__properties__update_node;
}(StateNode));
exports.Cnatural__type__number__type__properties__update_node = Cnatural__type__number__type__properties__update_node;
var Creference__type__properties__update_node = (function (_super) {
    __extends(Creference__type__properties__update_node, _super);
    function Creference__type__properties__update_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'update node'.'properties'?'type'*'reference'";
        return _this;
    }
    Creference__type__properties__update_node.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'reference'";
    };
    Creference__type__properties__update_node.prototype.getConstrainingContextValue_reference = function () {
        return this.state_context_values["reference"].referenced_node;
    };
    return Creference__type__properties__update_node;
}(StateNode));
exports.Creference__type__properties__update_node = Creference__type__properties__update_node;
var Cstate_group__type__properties__update_node = (function (_super) {
    __extends(Cstate_group__type__properties__update_node, _super);
    function Cstate_group__type__properties__update_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'update node'.'properties'?'type'*'state group'";
        return _this;
    }
    Cstate_group__type__properties__update_node.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'state group'";
    };
    Cstate_group__type__properties__update_node.prototype.getConstrainingContextValue_state_group = function () {
        return this.state_context_values["state group"].referenced_node;
    };
    return Cstate_group__type__properties__update_node;
}(StateNode));
exports.Cstate_group__type__properties__update_node = Cstate_group__type__properties__update_node;
var Cset = (function (_super) {
    __extends(Cset, _super);
    function Cset() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'update node'.'properties'?'type'*'state group'?'type'*'set'";
        return _this;
    }
    Cset.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'set'";
    };
    return Cset;
}(StateNode));
exports.Cset = Cset;
var Cupdate__type__state_group = (function (_super) {
    __extends(Cupdate__type__state_group, _super);
    function Cupdate__type__state_group() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'update node'.'properties'?'type'*'state group'?'type'*'update'";
        return _this;
    }
    Cupdate__type__state_group.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'update'";
    };
    return Cupdate__type__state_group;
}(StateNode));
exports.Cupdate__type__state_group = Cupdate__type__state_group;
var Ctext__type__properties__update_node = (function (_super) {
    __extends(Ctext__type__properties__update_node, _super);
    function Ctext__type__properties__update_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_reply'!'update node'.'properties'?'type'*'text'";
        return _this;
    }
    Ctext__type__properties__update_node.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'text'";
    };
    Ctext__type__properties__update_node.prototype.getConstrainingContextValue_text = function () {
        return this.state_context_values["text"].referenced_node;
    };
    return Ctext__type__properties__update_node;
}(StateNode));
exports.Ctext__type__properties__update_node = Ctext__type__properties__update_node;
