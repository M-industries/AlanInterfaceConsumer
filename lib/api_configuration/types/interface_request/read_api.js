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
var Cinterface_request = (function (_super) {
    __extends(Cinterface_request, _super);
    function Cinterface_request() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_request'";
        return _this;
    }
    Cinterface_request.prototype.getInputParameter_interface = function () {
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
    Cinterface_request.prototype.getPath = function () {
        return '';
    };
    return Cinterface_request;
}(AlanNode));
exports.Cinterface_request = Cinterface_request;
var Ccommand_execution = (function (_super) {
    __extends(Ccommand_execution, _super);
    function Ccommand_execution() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_request'?'type'*'command execution'";
        return _this;
    }
    Ccommand_execution.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'command execution'";
    };
    return Ccommand_execution;
}(StateNode));
exports.Ccommand_execution = Ccommand_execution;
var Csubscribe = (function (_super) {
    __extends(Csubscribe, _super);
    function Csubscribe() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_request'?'type'*'subscribe'";
        return _this;
    }
    Csubscribe.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'subscribe'";
    };
    return Csubscribe;
}(StateNode));
exports.Csubscribe = Csubscribe;
var Cno__initialization_data_requested = (function (_super) {
    __extends(Cno__initialization_data_requested, _super);
    function Cno__initialization_data_requested() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_request'?'type'*'subscribe'?'initialization data requested'*'no'";
        return _this;
    }
    Cno__initialization_data_requested.prototype.getPath = function () {
        return this.parent.getPath() + "?'initialization data requested'*'no'";
    };
    return Cno__initialization_data_requested;
}(StateNode));
exports.Cno__initialization_data_requested = Cno__initialization_data_requested;
var Cyes__initialization_data_requested = (function (_super) {
    __extends(Cyes__initialization_data_requested, _super);
    function Cyes__initialization_data_requested() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_request'?'type'*'subscribe'?'initialization data requested'*'yes'";
        return _this;
    }
    Cyes__initialization_data_requested.prototype.getPath = function () {
        return this.parent.getPath() + "?'initialization data requested'*'yes'";
    };
    return Cyes__initialization_data_requested;
}(StateNode));
exports.Cyes__initialization_data_requested = Cyes__initialization_data_requested;
var Cunsubscribe = (function (_super) {
    __extends(Cunsubscribe, _super);
    function Cunsubscribe() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_request'?'type'*'unsubscribe'";
        return _this;
    }
    Cunsubscribe.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'unsubscribe'";
    };
    return Cunsubscribe;
}(StateNode));
exports.Cunsubscribe = Cunsubscribe;
var Ccommand_arguments = (function (_super) {
    __extends(Ccommand_arguments, _super);
    function Ccommand_arguments() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_request'!'command arguments'";
        return _this;
    }
    Ccommand_arguments.prototype.getPath = function () {
        return this.location.getPath() + '\'' + this.property_component_name + '\'';
    };
    Ccommand_arguments.prototype.switchOnLocation = function (cases) {
        var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
        if (typeof current_case === 'function') {
            return current_case(this.location);
        }
        else {
            return current_case;
        }
    };
    Ccommand_arguments.prototype.castToLocation__interface_request___type___command_execution___arguments_ = function () {
        return this.location;
    };
    Ccommand_arguments.prototype.castToLocation__interface_request___command_arguments___properties___type___matrix___entries___arguments_ = function () {
        return this.location;
    };
    Ccommand_arguments.prototype.castToLocation__interface_request___command_arguments___properties___type___state_group___arguments_ = function () {
        return this.location;
    };
    Ccommand_arguments.prototype.getInputParameter_command_parameters = function () {
        var param_res;
        this.imp_resolveInputParameter("command parameters", function (err, paramval) {
            if (err) {
                throw "Unexpected resolution error for input parameter!";
            }
            else {
                param_res = paramval;
            }
        }, function () { throw new Error('Input parameter could not be resolved'); });
        return param_res;
    };
    Ccommand_arguments.prototype.getInputParameter_context_node = function () {
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
    return Ccommand_arguments;
}(AlanNode));
exports.Ccommand_arguments = Ccommand_arguments;
var Cproperties = (function (_super) {
    __extends(Cproperties, _super);
    function Cproperties() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_request'!'command arguments'.'properties'";
        return _this;
    }
    Cproperties.prototype.getPath = function () {
        return this.parent.getPath() + ".'properties'[" + id.serializeIdentifier(this.key.entry) + "]";
    };
    return Cproperties;
}(MatrixNode));
exports.Cproperties = Cproperties;
var Cfile = (function (_super) {
    __extends(Cfile, _super);
    function Cfile() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_request'!'command arguments'.'properties'?'type'*'file'";
        return _this;
    }
    Cfile.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'file'";
    };
    Cfile.prototype.getConstrainingContextValue_file = function () {
        return this.state_context_values["file"].referenced_node;
    };
    return Cfile;
}(StateNode));
exports.Cfile = Cfile;
var Cmatrix = (function (_super) {
    __extends(Cmatrix, _super);
    function Cmatrix() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_request'!'command arguments'.'properties'?'type'*'matrix'";
        return _this;
    }
    Cmatrix.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'matrix'";
    };
    Cmatrix.prototype.getConstrainingContextValue_matrix = function () {
        return this.state_context_values["matrix"].referenced_node;
    };
    return Cmatrix;
}(StateNode));
exports.Cmatrix = Cmatrix;
var Centries = (function (_super) {
    __extends(Centries, _super);
    function Centries() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_request'!'command arguments'.'properties'?'type'*'matrix'.'entries'";
        return _this;
    }
    Centries.prototype.getPath = function () {
        return this.parent.getPath() + ".'entries'[" + id.serializeIdentifier(this.key) + "]";
    };
    return Centries;
}(DictionaryNode));
exports.Centries = Centries;
var Cnumber = (function (_super) {
    __extends(Cnumber, _super);
    function Cnumber() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_request'!'command arguments'.'properties'?'type'*'number'";
        return _this;
    }
    Cnumber.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'number'";
    };
    Cnumber.prototype.getConstrainingContextValue_number = function () {
        return this.state_context_values["number"].referenced_node;
    };
    return Cnumber;
}(StateNode));
exports.Cnumber = Cnumber;
var Creference = (function (_super) {
    __extends(Creference, _super);
    function Creference() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_request'!'command arguments'.'properties'?'type'*'reference'";
        return _this;
    }
    Creference.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'reference'";
    };
    Creference.prototype.getConstrainingContextValue_reference = function () {
        return this.state_context_values["reference"].referenced_node;
    };
    return Creference;
}(StateNode));
exports.Creference = Creference;
var Cstate_group = (function (_super) {
    __extends(Cstate_group, _super);
    function Cstate_group() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_request'!'command arguments'.'properties'?'type'*'state group'";
        return _this;
    }
    Cstate_group.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'state group'";
    };
    Cstate_group.prototype.getConstrainingContextValue_state_group = function () {
        return this.state_context_values["state group"].referenced_node;
    };
    return Cstate_group;
}(StateNode));
exports.Cstate_group = Cstate_group;
var Ctext = (function (_super) {
    __extends(Ctext, _super);
    function Ctext() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_request'!'command arguments'.'properties'?'type'*'text'";
        return _this;
    }
    Ctext.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'text'";
    };
    Ctext.prototype.getConstrainingContextValue_text = function () {
        return this.state_context_values["text"].referenced_node;
    };
    return Ctext;
}(StateNode));
exports.Ctext = Ctext;
var Ccontext_keys__interface_request = (function (_super) {
    __extends(Ccontext_keys__interface_request, _super);
    function Ccontext_keys__interface_request() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_request'!'context keys'";
        return _this;
    }
    Ccontext_keys__interface_request.prototype.getPath = function () {
        return this.location.getPath() + '\'' + this.property_component_name + '\'';
    };
    Ccontext_keys__interface_request.prototype.switchOnLocation = function (cases) {
        var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
        if (typeof current_case === 'function') {
            return current_case(this.location);
        }
        else {
            return current_case;
        }
    };
    Ccontext_keys__interface_request.prototype.castToLocation__interface_request___type___command_execution___context_keys_ = function () {
        return this.location;
    };
    Ccontext_keys__interface_request.prototype.castToLocation__interface_request___type___subscribe___context_keys_ = function () {
        return this.location;
    };
    Ccontext_keys__interface_request.prototype.getInputParameter_interface = function () {
        var param_res;
        this.imp_resolveInputParameter("interface", function (err, paramval) {
            if (err) {
                throw "Unexpected resolution error for input parameter!";
            }
            else {
                param_res = paramval;
            }
        }, function () { throw new Error('Input parameter could not be resolved'); });
        return param_res;
    };
    return Ccontext_keys__interface_request;
}(AlanNode));
exports.Ccontext_keys__interface_request = Ccontext_keys__interface_request;
var Ccontext_keys__context_keys = (function (_super) {
    __extends(Ccontext_keys__context_keys, _super);
    function Ccontext_keys__context_keys() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_request'!'context keys'.'context keys'";
        return _this;
    }
    Ccontext_keys__context_keys.prototype.getPath = function () {
        return this.parent.getPath() + ".'context keys'[" + id.serializeIdentifier(this.key.entry) + "]";
    };
    return Ccontext_keys__context_keys;
}(MatrixNode));
exports.Ccontext_keys__context_keys = Ccontext_keys__context_keys;
var Cid_path = (function (_super) {
    __extends(Cid_path, _super);
    function Cid_path() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_request'!'id path'";
        return _this;
    }
    Cid_path.prototype.getPath = function () {
        return this.location.getPath() + '\'' + this.property_component_name + '\'';
    };
    Cid_path.prototype.switchOnLocation = function (cases) {
        var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
        if (typeof current_case === 'function') {
            return current_case(this.location);
        }
        else {
            return current_case;
        }
    };
    Cid_path.prototype.castToLocation__interface_request___type___command_execution___context_node_ = function () {
        return this.location;
    };
    Cid_path.prototype.castToLocation__interface_request___id_path___has_steps___yes___tail_ = function () {
        return this.location;
    };
    Cid_path.prototype.getInputParameter_context_node = function () {
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
    Cid_path.prototype.getOutputParameter_result_node = function () {
        return this.output_parameters["result node"].referenced_node;
    };
    Cid_path.prototype.get_has_stepsOutputParameter_result_node = function () {
        return this.output_parameters__has_steps__id_path["result node"].referenced_node;
    };
    return Cid_path;
}(AlanNode));
exports.Cid_path = Cid_path;
var Cno__has_steps = (function (_super) {
    __extends(Cno__has_steps, _super);
    function Cno__has_steps() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_request'!'id path'?'has steps'*'no'";
        return _this;
    }
    Cno__has_steps.prototype.getPath = function () {
        return this.parent.getPath() + "?'has steps'*'no'";
    };
    return Cno__has_steps;
}(StateNode));
exports.Cno__has_steps = Cno__has_steps;
var Cyes__has_steps = (function (_super) {
    __extends(Cyes__has_steps, _super);
    function Cyes__has_steps() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_request'!'id path'?'has steps'*'yes'";
        return _this;
    }
    Cyes__has_steps.prototype.getPath = function () {
        return this.parent.getPath() + "?'has steps'*'yes'";
    };
    Cyes__has_steps.prototype.get_typeOutputParameter_result_node = function () {
        return this.output_parameters__type__yes__has_steps["result node"].referenced_node;
    };
    return Cyes__has_steps;
}(StateNode));
exports.Cyes__has_steps = Cyes__has_steps;
var Ccollection_entry = (function (_super) {
    __extends(Ccollection_entry, _super);
    function Ccollection_entry() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_request'!'id path'?'has steps'*'yes'?'type'*'collection entry'";
        return _this;
    }
    Ccollection_entry.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'collection entry'";
    };
    return Ccollection_entry;
}(StateNode));
exports.Ccollection_entry = Ccollection_entry;
var Ccomponent = (function (_super) {
    __extends(Ccomponent, _super);
    function Ccomponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_request'!'id path'?'has steps'*'yes'?'type'*'component'";
        return _this;
    }
    Ccomponent.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'component'";
    };
    return Ccomponent;
}(StateNode));
exports.Ccomponent = Ccomponent;
var Cgroup = (function (_super) {
    __extends(Cgroup, _super);
    function Cgroup() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_request'!'id path'?'has steps'*'yes'?'type'*'group'";
        return _this;
    }
    Cgroup.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'group'";
    };
    return Cgroup;
}(StateNode));
exports.Cgroup = Cgroup;
var Cstate = (function (_super) {
    __extends(Cstate, _super);
    function Cstate() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface_request'!'id path'?'has steps'*'yes'?'type'*'state'";
        return _this;
    }
    Cstate.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'state'";
    };
    return Cstate;
}(StateNode));
exports.Cstate = Cstate;
