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
var Capplication_protocol_notify = (function (_super) {
    __extends(Capplication_protocol_notify, _super);
    function Capplication_protocol_notify() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.type_path = "'application_protocol_notify'";
        return _this;
    }
    Capplication_protocol_notify.prototype.getPath = function () {
        return '';
    };
    return Capplication_protocol_notify;
}(AlanNode));
exports.Capplication_protocol_notify = Capplication_protocol_notify;
