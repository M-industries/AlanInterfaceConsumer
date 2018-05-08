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
var Cinterface = (function (_super) {
    __extends(Cinterface, _super);
    function Cinterface() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'";
        return _this;
    }
    Cinterface.prototype.getPath = function () {
        return '';
    };
    return Cinterface;
}(AlanNode));
exports.Cinterface = Cinterface;
var Ccomponent_types = (function (_super) {
    __extends(Ccomponent_types, _super);
    function Ccomponent_types() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'.'component types'";
        return _this;
    }
    Ccomponent_types.prototype.getPath = function () {
        return this.parent.getPath() + ".'component types'[" + id.serializeIdentifier(this.key) + "]";
    };
    return Ccomponent_types;
}(DictionaryNode));
exports.Ccomponent_types = Ccomponent_types;
var Ccontext_keys = (function (_super) {
    __extends(Ccontext_keys, _super);
    function Ccontext_keys() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'.'context keys'";
        return _this;
    }
    Ccontext_keys.prototype.getPath = function () {
        return this.parent.getPath() + ".'context keys'[" + id.serializeIdentifier(this.key) + "]";
    };
    return Ccontext_keys;
}(DictionaryNode));
exports.Ccontext_keys = Ccontext_keys;
var Cnumerical_types = (function (_super) {
    __extends(Cnumerical_types, _super);
    function Cnumerical_types() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'.'numerical types'";
        return _this;
    }
    Cnumerical_types.prototype.getPath = function () {
        return this.parent.getPath() + ".'numerical types'[" + id.serializeIdentifier(this.key) + "]";
    };
    return Cnumerical_types;
}(DictionaryNode));
exports.Cnumerical_types = Cnumerical_types;
var Cno__has_factor = (function (_super) {
    __extends(Cno__has_factor, _super);
    function Cno__has_factor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'.'numerical types'?'has factor'*'no'";
        return _this;
    }
    Cno__has_factor.prototype.getPath = function () {
        return this.parent.getPath() + "?'has factor'*'no'";
    };
    return Cno__has_factor;
}(StateNode));
exports.Cno__has_factor = Cno__has_factor;
var Cyes__has_factor = (function (_super) {
    __extends(Cyes__has_factor, _super);
    function Cyes__has_factor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'.'numerical types'?'has factor'*'yes'";
        return _this;
    }
    Cyes__has_factor.prototype.getPath = function () {
        return this.parent.getPath() + "?'has factor'*'yes'";
    };
    return Cyes__has_factor;
}(StateNode));
exports.Cyes__has_factor = Cyes__has_factor;
var Cancestor_parameters_selection = (function (_super) {
    __extends(Cancestor_parameters_selection, _super);
    function Cancestor_parameters_selection() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'ancestor parameters selection'";
        return _this;
    }
    Cancestor_parameters_selection.prototype.getPath = function () {
        return this.location.getPath() + '\'' + this.property_component_name + '\'';
    };
    Cancestor_parameters_selection.prototype.switchOnLocation = function (cases) {
        var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
        if (typeof current_case === 'function') {
            return current_case(this.location);
        }
        else {
            return current_case;
        }
    };
    Cancestor_parameters_selection.prototype.castToLocation__interface___ancestor_parameters_selection___has_steps___yes___tail_ = function () {
        return this.location;
    };
    Cancestor_parameters_selection.prototype.castToLocation__interface___command_parameter_referencer___context_type___command_parameter___ancestor_selection_ = function () {
        return this.location;
    };
    Cancestor_parameters_selection.prototype.getInputParameter_context_parameters = function () {
        var param_res;
        this.imp_resolveInputParameter("context parameters", function (err, paramval) {
            if (err) {
                throw "Unexpected resolution error for input parameter!";
            }
            else {
                param_res = paramval;
            }
        }, function () { throw new Error('Input parameter could not be resolved'); });
        return param_res;
    };
    Cancestor_parameters_selection.prototype.getOutputParameter_result_parameters = function () {
        return this.output_parameters["result parameters"].referenced_node;
    };
    Cancestor_parameters_selection.prototype.get_has_stepsOutputParameter_result_parameters = function () {
        return this.output_parameters__has_steps__ancestor_parameters_selection["result parameters"].referenced_node;
    };
    return Cancestor_parameters_selection;
}(AlanNode));
exports.Cancestor_parameters_selection = Cancestor_parameters_selection;
var Cno__has_steps__ancestor_parameters_selection = (function (_super) {
    __extends(Cno__has_steps__ancestor_parameters_selection, _super);
    function Cno__has_steps__ancestor_parameters_selection() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'ancestor parameters selection'?'has steps'*'no'";
        return _this;
    }
    Cno__has_steps__ancestor_parameters_selection.prototype.getPath = function () {
        return this.parent.getPath() + "?'has steps'*'no'";
    };
    return Cno__has_steps__ancestor_parameters_selection;
}(StateNode));
exports.Cno__has_steps__ancestor_parameters_selection = Cno__has_steps__ancestor_parameters_selection;
var Cyes__has_steps__ancestor_parameters_selection = (function (_super) {
    __extends(Cyes__has_steps__ancestor_parameters_selection, _super);
    function Cyes__has_steps__ancestor_parameters_selection() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'ancestor parameters selection'?'has steps'*'yes'";
        return _this;
    }
    Cyes__has_steps__ancestor_parameters_selection.prototype.getPath = function () {
        return this.parent.getPath() + "?'has steps'*'yes'";
    };
    Cyes__has_steps__ancestor_parameters_selection.prototype.get_typeOutputParameter_result_parameters = function () {
        return this.output_parameters__type__yes__has_steps__ancestor_parameters_selection["result parameters"].referenced_node;
    };
    return Cyes__has_steps__ancestor_parameters_selection;
}(StateNode));
exports.Cyes__has_steps__ancestor_parameters_selection = Cyes__has_steps__ancestor_parameters_selection;
var Cmatrix_parent = (function (_super) {
    __extends(Cmatrix_parent, _super);
    function Cmatrix_parent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'ancestor parameters selection'?'has steps'*'yes'?'type'*'matrix parent'";
        return _this;
    }
    Cmatrix_parent.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'matrix parent'";
    };
    Cmatrix_parent.prototype.getConstrainingContextValue_matrix = function () {
        return this.state_context_values["matrix"].referenced_node;
    };
    return Cmatrix_parent;
}(StateNode));
exports.Cmatrix_parent = Cmatrix_parent;
var Cstate_parent__type__yes__has_steps__ancestor_parameters_selection = (function (_super) {
    __extends(Cstate_parent__type__yes__has_steps__ancestor_parameters_selection, _super);
    function Cstate_parent__type__yes__has_steps__ancestor_parameters_selection() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'ancestor parameters selection'?'has steps'*'yes'?'type'*'state parent'";
        return _this;
    }
    Cstate_parent__type__yes__has_steps__ancestor_parameters_selection.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'state parent'";
    };
    Cstate_parent__type__yes__has_steps__ancestor_parameters_selection.prototype.getConstrainingContextValue_state = function () {
        return this.state_context_values["state"].referenced_node;
    };
    return Cstate_parent__type__yes__has_steps__ancestor_parameters_selection;
}(StateNode));
exports.Cstate_parent__type__yes__has_steps__ancestor_parameters_selection = Cstate_parent__type__yes__has_steps__ancestor_parameters_selection;
var Ccommand_parameter_referencer = (function (_super) {
    __extends(Ccommand_parameter_referencer, _super);
    function Ccommand_parameter_referencer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'command parameter referencer'";
        return _this;
    }
    Ccommand_parameter_referencer.prototype.getPath = function () {
        return this.location.getPath() + '\'' + this.property_component_name + '\'';
    };
    Ccommand_parameter_referencer.prototype.switchOnLocation = function (cases) {
        var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
        if (typeof current_case === 'function') {
            return current_case(this.location);
        }
        else {
            return current_case;
        }
    };
    Ccommand_parameter_referencer.prototype.castToLocation__interface___command_parameters___properties___type___matrix___referencer_ = function () {
        return this.location;
    };
    Ccommand_parameter_referencer.prototype.castToLocation__interface___command_parameters___properties___type___reference___referencer_ = function () {
        return this.location;
    };
    Ccommand_parameter_referencer.prototype.getInputParameter_context_node = function () {
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
    Ccommand_parameter_referencer.prototype.getInputParameter_parameter = function () {
        var param_res;
        this.imp_resolveInputParameter("parameter", function (err, paramval) {
            if (err) {
                throw "Unexpected resolution error for input parameter!";
            }
            else {
                param_res = paramval;
            }
        }, function () { throw new Error('Input parameter could not be resolved'); });
        return param_res;
    };
    Ccommand_parameter_referencer.prototype.getOutputParameter_referenced_node = function () {
        return this.output_parameters["referenced node"].referenced_node;
    };
    Ccommand_parameter_referencer.prototype.get_context_typeOutputParameter_result_node = function () {
        return this.output_parameters__context_type__command_parameter_referencer["result node"].referenced_node;
    };
    return Ccommand_parameter_referencer;
}(AlanNode));
exports.Ccommand_parameter_referencer = Ccommand_parameter_referencer;
var Ccommand_parameter = (function (_super) {
    __extends(Ccommand_parameter, _super);
    function Ccommand_parameter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'command parameter referencer'?'context type'*'command parameter'";
        return _this;
    }
    Ccommand_parameter.prototype.getPath = function () {
        return this.parent.getPath() + "?'context type'*'command parameter'";
    };
    Ccommand_parameter.prototype.get_typeOutputParameter_result_node = function () {
        return this.output_parameters__type__command_parameter["result node"].referenced_node;
    };
    return Ccommand_parameter;
}(StateNode));
exports.Ccommand_parameter = Ccommand_parameter;
var Ckey = (function (_super) {
    __extends(Ckey, _super);
    function Ckey() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'command parameter referencer'?'context type'*'command parameter'?'type'*'key'";
        return _this;
    }
    Ckey.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'key'";
    };
    Ckey.prototype.getConstrainingContextValue_matrix = function () {
        return this.state_context_values["matrix"].referenced_node;
    };
    return Ckey;
}(StateNode));
exports.Ckey = Ckey;
var Creference__type__command_parameter = (function (_super) {
    __extends(Creference__type__command_parameter, _super);
    function Creference__type__command_parameter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'command parameter referencer'?'context type'*'command parameter'?'type'*'reference'";
        return _this;
    }
    Creference__type__command_parameter.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'reference'";
    };
    return Creference__type__command_parameter;
}(StateNode));
exports.Creference__type__command_parameter = Creference__type__command_parameter;
var Ccontext_node = (function (_super) {
    __extends(Ccontext_node, _super);
    function Ccontext_node() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'command parameter referencer'?'context type'*'context node'";
        return _this;
    }
    Ccontext_node.prototype.getPath = function () {
        return this.parent.getPath() + "?'context type'*'context node'";
    };
    return Ccontext_node;
}(StateNode));
exports.Ccontext_node = Ccontext_node;
var Ccommand_parameters = (function (_super) {
    __extends(Ccommand_parameters, _super);
    function Ccommand_parameters() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'command parameters'";
        return _this;
    }
    Ccommand_parameters.prototype.getPath = function () {
        return this.location.getPath() + '\'' + this.property_component_name + '\'';
    };
    Ccommand_parameters.prototype.switchOnLocation = function (cases) {
        var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
        if (typeof current_case === 'function') {
            return current_case(this.location);
        }
        else {
            return current_case;
        }
    };
    Ccommand_parameters.prototype.castToLocation__interface___command_parameters___properties___type___matrix___parameters_ = function () {
        return this.location;
    };
    Ccommand_parameters.prototype.castToLocation__interface___command_parameters___properties___type___state_group___states___parameters_ = function () {
        return this.location;
    };
    Ccommand_parameters.prototype.castToLocation__interface___node___attributes___type___command___parameters_ = function () {
        return this.location;
    };
    Ccommand_parameters.prototype.getInputParameter_context_node = function () {
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
    Ccommand_parameters.prototype.getInputParameter_interface = function () {
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
    return Ccommand_parameters;
}(AlanNode));
exports.Ccommand_parameters = Ccommand_parameters;
var Cproperties = (function (_super) {
    __extends(Cproperties, _super);
    function Cproperties() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'command parameters'.'properties'";
        return _this;
    }
    Cproperties.prototype.getPath = function () {
        return this.parent.getPath() + ".'properties'[" + id.serializeIdentifier(this.key) + "]";
    };
    return Cproperties;
}(DictionaryNode));
exports.Cproperties = Cproperties;
var Cfile__type__properties = (function (_super) {
    __extends(Cfile__type__properties, _super);
    function Cfile__type__properties() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'command parameters'.'properties'?'type'*'file'";
        return _this;
    }
    Cfile__type__properties.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'file'";
    };
    return Cfile__type__properties;
}(StateNode));
exports.Cfile__type__properties = Cfile__type__properties;
var Cmatrix__type__properties = (function (_super) {
    __extends(Cmatrix__type__properties, _super);
    function Cmatrix__type__properties() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'command parameters'.'properties'?'type'*'matrix'";
        return _this;
    }
    Cmatrix__type__properties.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'matrix'";
    };
    return Cmatrix__type__properties;
}(StateNode));
exports.Cmatrix__type__properties = Cmatrix__type__properties;
var Cdense = (function (_super) {
    __extends(Cdense, _super);
    function Cdense() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'command parameters'.'properties'?'type'*'matrix'?'type'*'dense'";
        return _this;
    }
    Cdense.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'dense'";
    };
    return Cdense;
}(StateNode));
exports.Cdense = Cdense;
var Csparse = (function (_super) {
    __extends(Csparse, _super);
    function Csparse() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'command parameters'.'properties'?'type'*'matrix'?'type'*'sparse'";
        return _this;
    }
    Csparse.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'sparse'";
    };
    return Csparse;
}(StateNode));
exports.Csparse = Csparse;
var Cnumber__type__properties = (function (_super) {
    __extends(Cnumber__type__properties, _super);
    function Cnumber__type__properties() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'command parameters'.'properties'?'type'*'number'";
        return _this;
    }
    Cnumber__type__properties.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'number'";
    };
    return Cnumber__type__properties;
}(StateNode));
exports.Cnumber__type__properties = Cnumber__type__properties;
var Cinteger__set__number__type__properties = (function (_super) {
    __extends(Cinteger__set__number__type__properties, _super);
    function Cinteger__set__number__type__properties() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'command parameters'.'properties'?'type'*'number'?'set'*'integer'";
        return _this;
    }
    Cinteger__set__number__type__properties.prototype.getPath = function () {
        return this.parent.getPath() + "?'set'*'integer'";
    };
    return Cinteger__set__number__type__properties;
}(StateNode));
exports.Cinteger__set__number__type__properties = Cinteger__set__number__type__properties;
var Cnatural__set__number__type__properties = (function (_super) {
    __extends(Cnatural__set__number__type__properties, _super);
    function Cnatural__set__number__type__properties() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'command parameters'.'properties'?'type'*'number'?'set'*'natural'";
        return _this;
    }
    Cnatural__set__number__type__properties.prototype.getPath = function () {
        return this.parent.getPath() + "?'set'*'natural'";
    };
    return Cnatural__set__number__type__properties;
}(StateNode));
exports.Cnatural__set__number__type__properties = Cnatural__set__number__type__properties;
var Creference__type__properties = (function (_super) {
    __extends(Creference__type__properties, _super);
    function Creference__type__properties() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'command parameters'.'properties'?'type'*'reference'";
        return _this;
    }
    Creference__type__properties.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'reference'";
    };
    return Creference__type__properties;
}(StateNode));
exports.Creference__type__properties = Creference__type__properties;
var Cstate_group__type__properties = (function (_super) {
    __extends(Cstate_group__type__properties, _super);
    function Cstate_group__type__properties() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'command parameters'.'properties'?'type'*'state group'";
        return _this;
    }
    Cstate_group__type__properties.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'state group'";
    };
    return Cstate_group__type__properties;
}(StateNode));
exports.Cstate_group__type__properties = Cstate_group__type__properties;
var Cstates__state_group__type__properties = (function (_super) {
    __extends(Cstates__state_group__type__properties, _super);
    function Cstates__state_group__type__properties() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'command parameters'.'properties'?'type'*'state group'.'states'";
        return _this;
    }
    Cstates__state_group__type__properties.prototype.getPath = function () {
        return this.parent.getPath() + ".'states'[" + id.serializeIdentifier(this.key) + "]";
    };
    return Cstates__state_group__type__properties;
}(DictionaryNode));
exports.Cstates__state_group__type__properties = Cstates__state_group__type__properties;
var Ctext__type__properties = (function (_super) {
    __extends(Ctext__type__properties, _super);
    function Ctext__type__properties() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'command parameters'.'properties'?'type'*'text'";
        return _this;
    }
    Ctext__type__properties.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'text'";
    };
    return Ctext__type__properties;
}(StateNode));
exports.Ctext__type__properties = Ctext__type__properties;
var Cnode = (function (_super) {
    __extends(Cnode, _super);
    function Cnode() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node'";
        return _this;
    }
    Cnode.prototype.getPath = function () {
        return this.location.getPath() + '\'' + this.property_component_name + '\'';
    };
    Cnode.prototype.switchOnLocation = function (cases) {
        var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
        if (typeof current_case === 'function') {
            return current_case(this.location);
        }
        else {
            return current_case;
        }
    };
    Cnode.prototype.castToLocation__interface___component_types___node_ = function () {
        return this.location;
    };
    Cnode.prototype.castToLocation__interface___root_ = function () {
        return this.location;
    };
    Cnode.prototype.castToLocation__interface___node___attributes___type___property___type___collection___node_ = function () {
        return this.location;
    };
    Cnode.prototype.castToLocation__interface___node___attributes___type___property___type___group___node_ = function () {
        return this.location;
    };
    Cnode.prototype.castToLocation__interface___node___attributes___type___property___type___state_group___states___node_ = function () {
        return this.location;
    };
    Cnode.prototype.getInputParameter_interface = function () {
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
    return Cnode;
}(AlanNode));
exports.Cnode = Cnode;
var Cattributes = (function (_super) {
    __extends(Cattributes, _super);
    function Cattributes() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node'.'attributes'";
        return _this;
    }
    Cattributes.prototype.getPath = function () {
        return this.parent.getPath() + ".'attributes'[" + id.serializeIdentifier(this.key) + "]";
    };
    return Cattributes;
}(DictionaryNode));
exports.Cattributes = Cattributes;
var Ccommand = (function (_super) {
    __extends(Ccommand, _super);
    function Ccommand() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node'.'attributes'?'type'*'command'";
        return _this;
    }
    Ccommand.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'command'";
    };
    return Ccommand;
}(StateNode));
exports.Ccommand = Ccommand;
var Cproperty = (function (_super) {
    __extends(Cproperty, _super);
    function Cproperty() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node'.'attributes'?'type'*'property'";
        return _this;
    }
    Cproperty.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'property'";
    };
    return Cproperty;
}(StateNode));
exports.Cproperty = Cproperty;
var Ccollection__type__property = (function (_super) {
    __extends(Ccollection__type__property, _super);
    function Ccollection__type__property() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'collection'";
        return _this;
    }
    Ccollection__type__property.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'collection'";
    };
    return Ccollection__type__property;
}(StateNode));
exports.Ccollection__type__property = Ccollection__type__property;
var Cdictionary = (function (_super) {
    __extends(Cdictionary, _super);
    function Cdictionary() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'collection'?'type'*'dictionary'";
        return _this;
    }
    Cdictionary.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'dictionary'";
    };
    return Cdictionary;
}(StateNode));
exports.Cdictionary = Cdictionary;
var Cmatrix__type__collection = (function (_super) {
    __extends(Cmatrix__type__collection, _super);
    function Cmatrix__type__collection() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'collection'?'type'*'matrix'";
        return _this;
    }
    Cmatrix__type__collection.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'matrix'";
    };
    return Cmatrix__type__collection;
}(StateNode));
exports.Cmatrix__type__collection = Cmatrix__type__collection;
var Ccomponent = (function (_super) {
    __extends(Ccomponent, _super);
    function Ccomponent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'component'";
        return _this;
    }
    Ccomponent.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'component'";
    };
    return Ccomponent;
}(StateNode));
exports.Ccomponent = Ccomponent;
var Cfile__type__property = (function (_super) {
    __extends(Cfile__type__property, _super);
    function Cfile__type__property() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'file'";
        return _this;
    }
    Cfile__type__property.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'file'";
    };
    return Cfile__type__property;
}(StateNode));
exports.Cfile__type__property = Cfile__type__property;
var Cgroup__type__property = (function (_super) {
    __extends(Cgroup__type__property, _super);
    function Cgroup__type__property() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'group'";
        return _this;
    }
    Cgroup__type__property.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'group'";
    };
    return Cgroup__type__property;
}(StateNode));
exports.Cgroup__type__property = Cgroup__type__property;
var Cnumber__type__property = (function (_super) {
    __extends(Cnumber__type__property, _super);
    function Cnumber__type__property() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'number'";
        return _this;
    }
    Cnumber__type__property.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'number'";
    };
    return Cnumber__type__property;
}(StateNode));
exports.Cnumber__type__property = Cnumber__type__property;
var Cinteger__set__number__type__property = (function (_super) {
    __extends(Cinteger__set__number__type__property, _super);
    function Cinteger__set__number__type__property() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'number'?'set'*'integer'";
        return _this;
    }
    Cinteger__set__number__type__property.prototype.getPath = function () {
        return this.parent.getPath() + "?'set'*'integer'";
    };
    return Cinteger__set__number__type__property;
}(StateNode));
exports.Cinteger__set__number__type__property = Cinteger__set__number__type__property;
var Cnatural__set__number__type__property = (function (_super) {
    __extends(Cnatural__set__number__type__property, _super);
    function Cnatural__set__number__type__property() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'number'?'set'*'natural'";
        return _this;
    }
    Cnatural__set__number__type__property.prototype.getPath = function () {
        return this.parent.getPath() + "?'set'*'natural'";
    };
    return Cnatural__set__number__type__property;
}(StateNode));
exports.Cnatural__set__number__type__property = Cnatural__set__number__type__property;
var Creference__type__property = (function (_super) {
    __extends(Creference__type__property, _super);
    function Creference__type__property() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'reference'";
        return _this;
    }
    Creference__type__property.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'reference'";
    };
    return Creference__type__property;
}(StateNode));
exports.Creference__type__property = Creference__type__property;
var Cstate_group__type__property = (function (_super) {
    __extends(Cstate_group__type__property, _super);
    function Cstate_group__type__property() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'state group'";
        return _this;
    }
    Cstate_group__type__property.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'state group'";
    };
    return Cstate_group__type__property;
}(StateNode));
exports.Cstate_group__type__property = Cstate_group__type__property;
var Coutput_parameters = (function (_super) {
    __extends(Coutput_parameters, _super);
    function Coutput_parameters() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'state group'.'output parameters'";
        return _this;
    }
    Coutput_parameters.prototype.getPath = function () {
        return this.parent.getPath() + ".'output parameters'[" + id.serializeIdentifier(this.key) + "]";
    };
    return Coutput_parameters;
}(DictionaryNode));
exports.Coutput_parameters = Coutput_parameters;
var Cstates__state_group__type__property = (function (_super) {
    __extends(Cstates__state_group__type__property, _super);
    function Cstates__state_group__type__property() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'state group'.'states'";
        return _this;
    }
    Cstates__state_group__type__property.prototype.getPath = function () {
        return this.parent.getPath() + ".'states'[" + id.serializeIdentifier(this.key) + "]";
    };
    return Cstates__state_group__type__property;
}(DictionaryNode));
exports.Cstates__state_group__type__property = Cstates__state_group__type__property;
var Coutput_arguments = (function (_super) {
    __extends(Coutput_arguments, _super);
    function Coutput_arguments() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'state group'.'states'.'output arguments'";
        return _this;
    }
    Coutput_arguments.prototype.getPath = function () {
        return this.parent.getPath() + ".'output arguments'[" + id.serializeIdentifier(this.key.entry) + "]";
    };
    return Coutput_arguments;
}(MatrixNode));
exports.Coutput_arguments = Coutput_arguments;
var Ctext__type__property = (function (_super) {
    __extends(Ctext__type__property, _super);
    function Ctext__type__property() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node'.'attributes'?'type'*'property'?'type'*'text'";
        return _this;
    }
    Ctext__type__property.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'text'";
    };
    return Ctext__type__property;
}(StateNode));
exports.Ctext__type__property = Ctext__type__property;
var Cnode_content_path = (function (_super) {
    __extends(Cnode_content_path, _super);
    function Cnode_content_path() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node content path'";
        return _this;
    }
    Cnode_content_path.prototype.getPath = function () {
        return this.location.getPath() + '\'' + this.property_component_name + '\'';
    };
    Cnode_content_path.prototype.switchOnLocation = function (cases) {
        var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
        if (typeof current_case === 'function') {
            return current_case(this.location);
        }
        else {
            return current_case;
        }
    };
    Cnode_content_path.prototype.castToLocation__interface___command_parameter_referencer___tail_ = function () {
        return this.location;
    };
    Cnode_content_path.prototype.castToLocation__interface___node_content_path___has_steps___yes___tail_ = function () {
        return this.location;
    };
    Cnode_content_path.prototype.castToLocation__interface___referencer___tail_ = function () {
        return this.location;
    };
    Cnode_content_path.prototype.getInputParameter_context_node = function () {
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
    Cnode_content_path.prototype.getOutputParameter_result_interface_node = function () {
        return this.output_parameters["result interface node"].referenced_node;
    };
    Cnode_content_path.prototype.get_has_stepsOutputParameter_result_interface_node = function () {
        return this.output_parameters__has_steps__node_content_path["result interface node"].referenced_node;
    };
    return Cnode_content_path;
}(AlanNode));
exports.Cnode_content_path = Cnode_content_path;
var Cno__has_steps__node_content_path = (function (_super) {
    __extends(Cno__has_steps__node_content_path, _super);
    function Cno__has_steps__node_content_path() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node content path'?'has steps'*'no'";
        return _this;
    }
    Cno__has_steps__node_content_path.prototype.getPath = function () {
        return this.parent.getPath() + "?'has steps'*'no'";
    };
    return Cno__has_steps__node_content_path;
}(StateNode));
exports.Cno__has_steps__node_content_path = Cno__has_steps__node_content_path;
var Cyes__has_steps__node_content_path = (function (_super) {
    __extends(Cyes__has_steps__node_content_path, _super);
    function Cyes__has_steps__node_content_path() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node content path'?'has steps'*'yes'";
        return _this;
    }
    Cyes__has_steps__node_content_path.prototype.getPath = function () {
        return this.parent.getPath() + "?'has steps'*'yes'";
    };
    Cyes__has_steps__node_content_path.prototype.get_typeOutputParameter_result_interface_node = function () {
        return this.output_parameters__type__yes__has_steps__node_content_path["result interface node"].referenced_node;
    };
    return Cyes__has_steps__node_content_path;
}(StateNode));
exports.Cyes__has_steps__node_content_path = Cyes__has_steps__node_content_path;
var Cgroup__type__yes__has_steps__node_content_path = (function (_super) {
    __extends(Cgroup__type__yes__has_steps__node_content_path, _super);
    function Cgroup__type__yes__has_steps__node_content_path() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node content path'?'has steps'*'yes'?'type'*'group'";
        return _this;
    }
    Cgroup__type__yes__has_steps__node_content_path.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'group'";
    };
    return Cgroup__type__yes__has_steps__node_content_path;
}(StateNode));
exports.Cgroup__type__yes__has_steps__node_content_path = Cgroup__type__yes__has_steps__node_content_path;
var Cstate__type__yes__has_steps__node_content_path = (function (_super) {
    __extends(Cstate__type__yes__has_steps__node_content_path, _super);
    function Cstate__type__yes__has_steps__node_content_path() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node content path'?'has steps'*'yes'?'type'*'state'";
        return _this;
    }
    Cstate__type__yes__has_steps__node_content_path.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'state'";
    };
    return Cstate__type__yes__has_steps__node_content_path;
}(StateNode));
exports.Cstate__type__yes__has_steps__node_content_path = Cstate__type__yes__has_steps__node_content_path;
var Cnode_selection_path = (function (_super) {
    __extends(Cnode_selection_path, _super);
    function Cnode_selection_path() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node selection path'";
        return _this;
    }
    Cnode_selection_path.prototype.getPath = function () {
        return this.location.getPath() + '\'' + this.property_component_name + '\'';
    };
    Cnode_selection_path.prototype.switchOnLocation = function (cases) {
        var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
        if (typeof current_case === 'function') {
            return current_case(this.location);
        }
        else {
            return current_case;
        }
    };
    Cnode_selection_path.prototype.castToLocation__interface___command_parameter_referencer___head_ = function () {
        return this.location;
    };
    Cnode_selection_path.prototype.castToLocation__interface___node___attributes___type___property___type___state_group___states___output_arguments___path_ = function () {
        return this.location;
    };
    Cnode_selection_path.prototype.castToLocation__interface___node_selection_path___has_steps___yes___tail_ = function () {
        return this.location;
    };
    Cnode_selection_path.prototype.castToLocation__interface___referencer___head_ = function () {
        return this.location;
    };
    Cnode_selection_path.prototype.getInputParameter_context_node = function () {
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
    Cnode_selection_path.prototype.getOutputParameter_result_interface_node = function () {
        return this.output_parameters["result interface node"].referenced_node;
    };
    Cnode_selection_path.prototype.get_has_stepsOutputParameter_result_interface_node = function () {
        return this.output_parameters__has_steps__node_selection_path["result interface node"].referenced_node;
    };
    return Cnode_selection_path;
}(AlanNode));
exports.Cnode_selection_path = Cnode_selection_path;
var Cno__has_steps__node_selection_path = (function (_super) {
    __extends(Cno__has_steps__node_selection_path, _super);
    function Cno__has_steps__node_selection_path() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node selection path'?'has steps'*'no'";
        return _this;
    }
    Cno__has_steps__node_selection_path.prototype.getPath = function () {
        return this.parent.getPath() + "?'has steps'*'no'";
    };
    return Cno__has_steps__node_selection_path;
}(StateNode));
exports.Cno__has_steps__node_selection_path = Cno__has_steps__node_selection_path;
var Cyes__has_steps__node_selection_path = (function (_super) {
    __extends(Cyes__has_steps__node_selection_path, _super);
    function Cyes__has_steps__node_selection_path() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node selection path'?'has steps'*'yes'";
        return _this;
    }
    Cyes__has_steps__node_selection_path.prototype.getPath = function () {
        return this.parent.getPath() + "?'has steps'*'yes'";
    };
    Cyes__has_steps__node_selection_path.prototype.get_typeOutputParameter_result_interface_node = function () {
        return this.output_parameters__type__yes__has_steps__node_selection_path["result interface node"].referenced_node;
    };
    return Cyes__has_steps__node_selection_path;
}(StateNode));
exports.Cyes__has_steps__node_selection_path = Cyes__has_steps__node_selection_path;
var Ccollection_parent = (function (_super) {
    __extends(Ccollection_parent, _super);
    function Ccollection_parent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node selection path'?'has steps'*'yes'?'type'*'collection parent'";
        return _this;
    }
    Ccollection_parent.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'collection parent'";
    };
    Ccollection_parent.prototype.getConstrainingContextValue_collection = function () {
        return this.state_context_values["collection"].referenced_node;
    };
    return Ccollection_parent;
}(StateNode));
exports.Ccollection_parent = Ccollection_parent;
var Cgroup__type__yes__has_steps__node_selection_path = (function (_super) {
    __extends(Cgroup__type__yes__has_steps__node_selection_path, _super);
    function Cgroup__type__yes__has_steps__node_selection_path() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node selection path'?'has steps'*'yes'?'type'*'group'";
        return _this;
    }
    Cgroup__type__yes__has_steps__node_selection_path.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'group'";
    };
    return Cgroup__type__yes__has_steps__node_selection_path;
}(StateNode));
exports.Cgroup__type__yes__has_steps__node_selection_path = Cgroup__type__yes__has_steps__node_selection_path;
var Cgroup_parent = (function (_super) {
    __extends(Cgroup_parent, _super);
    function Cgroup_parent() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node selection path'?'has steps'*'yes'?'type'*'group parent'";
        return _this;
    }
    Cgroup_parent.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'group parent'";
    };
    Cgroup_parent.prototype.getConstrainingContextValue_group = function () {
        return this.state_context_values["group"].referenced_node;
    };
    return Cgroup_parent;
}(StateNode));
exports.Cgroup_parent = Cgroup_parent;
var Cmatrix_key = (function (_super) {
    __extends(Cmatrix_key, _super);
    function Cmatrix_key() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node selection path'?'has steps'*'yes'?'type'*'matrix key'";
        return _this;
    }
    Cmatrix_key.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'matrix key'";
    };
    Cmatrix_key.prototype.getConstrainingContextValue_matrix = function () {
        return this.state_context_values["matrix"].referenced_node;
    };
    return Cmatrix_key;
}(StateNode));
exports.Cmatrix_key = Cmatrix_key;
var Creference__type__yes = (function (_super) {
    __extends(Creference__type__yes, _super);
    function Creference__type__yes() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node selection path'?'has steps'*'yes'?'type'*'reference'";
        return _this;
    }
    Creference__type__yes.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'reference'";
    };
    return Creference__type__yes;
}(StateNode));
exports.Creference__type__yes = Creference__type__yes;
var Cstate_group_output_parameter = (function (_super) {
    __extends(Cstate_group_output_parameter, _super);
    function Cstate_group_output_parameter() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node selection path'?'has steps'*'yes'?'type'*'state group output parameter'";
        return _this;
    }
    Cstate_group_output_parameter.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'state group output parameter'";
    };
    return Cstate_group_output_parameter;
}(StateNode));
exports.Cstate_group_output_parameter = Cstate_group_output_parameter;
var Cstate_parent__type__yes__has_steps__node_selection_path = (function (_super) {
    __extends(Cstate_parent__type__yes__has_steps__node_selection_path, _super);
    function Cstate_parent__type__yes__has_steps__node_selection_path() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node selection path'?'has steps'*'yes'?'type'*'state parent'";
        return _this;
    }
    Cstate_parent__type__yes__has_steps__node_selection_path.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'state parent'";
    };
    Cstate_parent__type__yes__has_steps__node_selection_path.prototype.getConstrainingContextValue_state = function () {
        return this.state_context_values["state"].referenced_node;
    };
    return Cstate_parent__type__yes__has_steps__node_selection_path;
}(StateNode));
exports.Cstate_parent__type__yes__has_steps__node_selection_path = Cstate_parent__type__yes__has_steps__node_selection_path;
var Cnode_type_path = (function (_super) {
    __extends(Cnode_type_path, _super);
    function Cnode_type_path() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node type path'";
        return _this;
    }
    Cnode_type_path.prototype.getPath = function () {
        return this.location.getPath() + '\'' + this.property_component_name + '\'';
    };
    Cnode_type_path.prototype.switchOnLocation = function (cases) {
        var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
        if (typeof current_case === 'function') {
            return current_case(this.location);
        }
        else {
            return current_case;
        }
    };
    Cnode_type_path.prototype.castToLocation__interface___node___attributes___type___property___type___state_group___output_parameters___node_selection_ = function () {
        return this.location;
    };
    Cnode_type_path.prototype.getInputParameter_interface = function () {
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
    Cnode_type_path.prototype.getOutputParameter_result_interface_node = function () {
        return this.output_parameters["result interface node"].referenced_node;
    };
    Cnode_type_path.prototype.get_root_typeOutputParameter_root_type_interface_node = function () {
        return this.output_parameters__root_type__node_type_path["root type interface node"].referenced_node;
    };
    return Cnode_type_path;
}(AlanNode));
exports.Cnode_type_path = Cnode_type_path;
var Ccomponent_type = (function (_super) {
    __extends(Ccomponent_type, _super);
    function Ccomponent_type() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node type path'?'root type'*'component type'";
        return _this;
    }
    Ccomponent_type.prototype.getPath = function () {
        return this.parent.getPath() + "?'root type'*'component type'";
    };
    return Ccomponent_type;
}(StateNode));
exports.Ccomponent_type = Ccomponent_type;
var Croot = (function (_super) {
    __extends(Croot, _super);
    function Croot() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node type path'?'root type'*'root'";
        return _this;
    }
    Croot.prototype.getPath = function () {
        return this.parent.getPath() + "?'root type'*'root'";
    };
    return Croot;
}(StateNode));
exports.Croot = Croot;
var Cnode_type_path_step = (function (_super) {
    __extends(Cnode_type_path_step, _super);
    function Cnode_type_path_step() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node type path step'";
        return _this;
    }
    Cnode_type_path_step.prototype.getPath = function () {
        return this.location.getPath() + '\'' + this.property_component_name + '\'';
    };
    Cnode_type_path_step.prototype.switchOnLocation = function (cases) {
        var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
        if (typeof current_case === 'function') {
            return current_case(this.location);
        }
        else {
            return current_case;
        }
    };
    Cnode_type_path_step.prototype.castToLocation__interface___node_type_path___steps_ = function () {
        return this.location;
    };
    Cnode_type_path_step.prototype.castToLocation__interface___node_type_path_step___has_steps___yes___tail_ = function () {
        return this.location;
    };
    Cnode_type_path_step.prototype.getInputParameter_context_node = function () {
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
    Cnode_type_path_step.prototype.getOutputParameter_result_interface_node = function () {
        return this.output_parameters["result interface node"].referenced_node;
    };
    Cnode_type_path_step.prototype.get_has_stepsOutputParameter_result_interface_node = function () {
        return this.output_parameters__has_steps__node_type_path_step["result interface node"].referenced_node;
    };
    return Cnode_type_path_step;
}(AlanNode));
exports.Cnode_type_path_step = Cnode_type_path_step;
var Cno__has_steps__node_type_path_step = (function (_super) {
    __extends(Cno__has_steps__node_type_path_step, _super);
    function Cno__has_steps__node_type_path_step() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node type path step'?'has steps'*'no'";
        return _this;
    }
    Cno__has_steps__node_type_path_step.prototype.getPath = function () {
        return this.parent.getPath() + "?'has steps'*'no'";
    };
    return Cno__has_steps__node_type_path_step;
}(StateNode));
exports.Cno__has_steps__node_type_path_step = Cno__has_steps__node_type_path_step;
var Cyes__has_steps__node_type_path_step = (function (_super) {
    __extends(Cyes__has_steps__node_type_path_step, _super);
    function Cyes__has_steps__node_type_path_step() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node type path step'?'has steps'*'yes'";
        return _this;
    }
    Cyes__has_steps__node_type_path_step.prototype.getPath = function () {
        return this.parent.getPath() + "?'has steps'*'yes'";
    };
    Cyes__has_steps__node_type_path_step.prototype.get_typeOutputParameter_result_interface_node = function () {
        return this.output_parameters__type__yes__has_steps__node_type_path_step["result interface node"].referenced_node;
    };
    return Cyes__has_steps__node_type_path_step;
}(StateNode));
exports.Cyes__has_steps__node_type_path_step = Cyes__has_steps__node_type_path_step;
var Ccollection__type__yes = (function (_super) {
    __extends(Ccollection__type__yes, _super);
    function Ccollection__type__yes() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node type path step'?'has steps'*'yes'?'type'*'collection'";
        return _this;
    }
    Ccollection__type__yes.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'collection'";
    };
    return Ccollection__type__yes;
}(StateNode));
exports.Ccollection__type__yes = Ccollection__type__yes;
var Cgroup__type__yes__has_steps__node_type_path_step = (function (_super) {
    __extends(Cgroup__type__yes__has_steps__node_type_path_step, _super);
    function Cgroup__type__yes__has_steps__node_type_path_step() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node type path step'?'has steps'*'yes'?'type'*'group'";
        return _this;
    }
    Cgroup__type__yes__has_steps__node_type_path_step.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'group'";
    };
    return Cgroup__type__yes__has_steps__node_type_path_step;
}(StateNode));
exports.Cgroup__type__yes__has_steps__node_type_path_step = Cgroup__type__yes__has_steps__node_type_path_step;
var Cstate__type__yes__has_steps__node_type_path_step = (function (_super) {
    __extends(Cstate__type__yes__has_steps__node_type_path_step, _super);
    function Cstate__type__yes__has_steps__node_type_path_step() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'node type path step'?'has steps'*'yes'?'type'*'state'";
        return _this;
    }
    Cstate__type__yes__has_steps__node_type_path_step.prototype.getPath = function () {
        return this.parent.getPath() + "?'type'*'state'";
    };
    return Cstate__type__yes__has_steps__node_type_path_step;
}(StateNode));
exports.Cstate__type__yes__has_steps__node_type_path_step = Cstate__type__yes__has_steps__node_type_path_step;
var Creferencer = (function (_super) {
    __extends(Creferencer, _super);
    function Creferencer() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'interface'!'referencer'";
        return _this;
    }
    Creferencer.prototype.getPath = function () {
        return this.location.getPath() + '\'' + this.property_component_name + '\'';
    };
    Creferencer.prototype.switchOnLocation = function (cases) {
        var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
        if (typeof current_case === 'function') {
            return current_case(this.location);
        }
        else {
            return current_case;
        }
    };
    Creferencer.prototype.castToLocation__interface___node___attributes___type___property___type___collection___type___matrix___referencer_ = function () {
        return this.location;
    };
    Creferencer.prototype.castToLocation__interface___node___attributes___type___property___type___reference___referencer_ = function () {
        return this.location;
    };
    Creferencer.prototype.getInputParameter_context_node = function () {
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
    Creferencer.prototype.getOutputParameter_referenced_interface_node = function () {
        return this.output_parameters["referenced interface node"].referenced_node;
    };
    return Creferencer;
}(AlanNode));
exports.Creferencer = Creferencer;
