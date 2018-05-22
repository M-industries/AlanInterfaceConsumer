import * as interface_reply from "./read_api";
import * as resolver from "./reference_resolver";
import * as interface from "../interface/read_api";
import * as interface_request from "../interface_request/read_api";
import * as id from './identifier';
export type collection_type<T> = {[key:string]:T};
export class AlanNode<T> {
	properties:T;
	removed:boolean;
	reference_count:number = 0;
	imp_resolveGlobalInputParameter;
	constructor () {
		(<any>this).properties = {};
	}
	isRemoved ():boolean {
		return this.removed === true;
	}
}
export interface Reference<T> {
	entry:string;
	():T
}
export interface ExternalReference<T> {
	library:string;
	type:string
	():T
}
export class DictionaryNode<PT, T> extends AlanNode<T> {
	parent: PT;
	getParent (): PT {
		return this.parent;
	}
	getCollectionParent (): PT {
		return this.parent;
	}
	key: string;
	getKey () {
		return this.key;
	}
	getDictionaryKey () {
		return this.key;
	}
}
export class MatrixNode<PT, KT, T> extends AlanNode<T> {
	parent: PT;
	getParent (): PT {
		return this.parent;
	}
	getCollectionParent (): PT {
		return this.parent;
	}
	key: { referenced_node: KT; resolution_status:"resolving"|"error"|"resolved"|"unresolved"|"decoupled"; entry:string; };
	getKey (): KT {
		return this.key.referenced_node
	}
	getMatrixKey (): KT {
		return this.key.referenced_node;
	}
}
export class StateNode<PT, T> extends AlanNode<T> {
	parent: PT;
	getParent () {
		return this.parent;
	}
	getStateParent () {
		return this.parent;
	}
}
export class GroupNode<PT, T> extends AlanNode<T> { 
	parent: PT;
	getParent () {
		return this.parent;
	}
	getGroupParent () {
		return this.parent;
	}
}
export class Collection<T extends AlanNode<{}>> {
	protected entries:{[key:string]:T} = {};
	private parent;
	private collection_name:string
	constructor (parent, collection_name:string, entries:{[key:string]:T}) {
		this.parent = parent;
		this.collection_name = collection_name;
		this.entries = entries
	}
	walk(walkFunc: ($?:T) => void) {
		var k;
		for (k in this.entries) {
			walkFunc(this.entries[k]);
		}
	}
	toList<TL>(sortFunc, mapFunc: ($?:T) => TL): TL[] {
		var mapped_array = [];
		var k;
		for (k in this.entries) {
			mapped_array.push(this.entries[k]);
		}
		return mapped_array.sort(sortFunc).map(mapFunc);
	}
	getEntry(key:string): T {
		var entry;
		if ((entry = this.entries[key]) === undefined) { throw new Error('Entry ' + key + ' does not exist in collection "' + this.collection_name + '" in ' + this.parent.getPath() + '.'); }
		return entry;
	}
	switchOnEntryExists<RT>(key:string, onExists: (($?: T) => RT) | RT, onNotExists: (() => RT) | RT): RT {
		var entry = this.entries[key];
		if (entry === undefined) {
			if (typeof onNotExists === 'function') {
				return (<() => RT>onNotExists)();
			} else {
				return <RT>onNotExists;
			}
		} else {
			if (typeof onExists === 'function') {
				return (<($?: T) => RT>onExists)(this.entries[key]);
			} else {
				return <RT>onExists;
			}
		}
	}
}
export class Matrix<T extends AlanNode<{}>> extends Collection<T> {
	constructor (parent, collection_name:string, entries:{[key:string]:T}) {
		super(parent, collection_name, entries);
	}
	mapToDictionary<RT>(mapFunc: ($?: T) => RT | RT): collection_type<RT> {
		var mapped_object:collection_type<RT> = {};
		var k;
		for (k in this.entries) {
			mapped_object[k] = mapFunc(this.entries[k]);
		}
		return mapped_object;
	}
}
export class Dictionary<T extends AlanNode<{}>> extends Collection<T> {
	constructor (parent, collection_name:string, entries:{[key:string]:T}) {
		super(parent, collection_name, entries);
	}
	map<RT>(mapFunc: ($?: T) => RT | RT): collection_type<RT> {
		var mapped_object:collection_type<RT> = {};
		var k;
		for (k in this.entries) {
			mapped_object[k] = mapFunc(this.entries[k]);
		}
		return mapped_object;
	}
}
export class StateGroup<T extends {name:keyof K, node:AlanNode<{}>}, K extends {[key:string]:AlanNode<{}>}> {
	state:T;
	constructor (s:T) {
		this.state = s;
	}
	switch<TS> (cases:{[key in keyof K]:(($?:K[key]) => TS) | TS}):TS {
		let handler = cases[this.state.name];
		if (typeof handler === "function") {
			return handler(this.state.node);
		} else {
			return handler as TS;
		}
	}

	cast<S extends keyof K>(state:S):K[S] {
		return this.state.node;
	}
}
export interface Tree<T> {
	types: {[name:string]:T};
	substrees: {[name:string]:Tree<T>};}
export class Cinterface_reply extends AlanNode<{
	type: StateGroup<
		{ name: "initialization", node: Cinitialization}
		|{ name: "notification", node: Cnotification}
		, {"initialization": Cinitialization,"notification": Cnotification}>,
}> {
	imp_resolveInputParameter;
	key?:string
	getInputParameter_interface ():interface.Cinterface{
		var param_res;
		this.imp_resolveGlobalInputParameter("interface", function (err, paramval) {
			if (err) {
				throw "Unexpected resolution error for input parameter!";
			} else {
				param_res = paramval;
			}
		}, function () { throw new Error('Input parameter could not be resolved'); });
		return param_res;
	}
	getInputParameter_request ():interface_request.Cinterface_request{
		var param_res;
		this.imp_resolveGlobalInputParameter("request", function (err, paramval) {
			if (err) {
				throw "Unexpected resolution error for input parameter!";
			} else {
				param_res = paramval;
			}
		}, function () { throw new Error('Input parameter could not be resolved'); });
		return param_res;
	}
	getPath ():string {
		return '';
	}
	type_path:string = "'interface_reply'";
	output_parameters__type__interface_reply;
}
export class Cinitialization extends StateNode<Cinterface_reply, {
	has_initialization_data: StateGroup<
		{ name: "no", node: Cno__has_initialization_data}
		|{ name: "yes", node: Cyes__has_initialization_data}
		, {"no": Cno__has_initialization_data,"yes": Cyes__has_initialization_data}>,
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'initialization'";
	}
	state_context_values;
	getConstrainingContextValue_source ():interface_request.Csubscribe {
		return this.state_context_values["source"].referenced_node;
	}
	type_path:string = "'interface_reply'?'type'*'initialization'";
	output_parameters__has_initialization_data__initialization;
}
export class Cno__has_initialization_data extends StateNode<Cinitialization, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'has initialization data'*'no'";
	}
	state_context_values;
	getConstrainingContextValue_source ():interface_request.Cno__initialization_data_requested {
		return this.state_context_values["source"].referenced_node;
	}
	type_path:string = "'interface_reply'?'type'*'initialization'?'has initialization data'*'no'";
}
export class Cyes__has_initialization_data extends StateNode<Cinitialization, {
	context_exists: StateGroup<
		{ name: "no", node: Cno__context_exists}
		|{ name: "yes", node: Cyes__context_exists}
		, {"no": Cno__context_exists,"yes": Cyes__context_exists}>,
}> {
	getPath ():string {
		return this.parent.getPath() + "?'has initialization data'*'yes'";
	}
	state_context_values;
	getConstrainingContextValue_source ():interface_request.Cyes__initialization_data_requested {
		return this.state_context_values["source"].referenced_node;
	}
	type_path:string = "'interface_reply'?'type'*'initialization'?'has initialization data'*'yes'";
	output_parameters__context_exists__yes__has_initialization_data;
}
export class Cno__context_exists extends StateNode<Cyes__has_initialization_data, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'context exists'*'no'";
	}
	state_context_values;
	type_path:string = "'interface_reply'?'type'*'initialization'?'has initialization data'*'yes'?'context exists'*'no'";
}
export class Cyes__context_exists extends StateNode<Cyes__has_initialization_data, {
	root: Cinitialize_node;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'context exists'*'yes'";
	}
	state_context_values;
	type_path:string = "'interface_reply'?'type'*'initialization'?'has initialization data'*'yes'?'context exists'*'yes'";
}
export class Cnotification extends StateNode<Cinterface_reply, {
	type: StateGroup<
		{ name: "create", node: Ccreate__type__notification}
		|{ name: "remove", node: Cremove__type__notification}
		|{ name: "update", node: Cupdate__type__notification}
		, {"create": Ccreate__type__notification,"remove": Cremove__type__notification,"update": Cupdate__type__notification}>,
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'notification'";
	}
	state_context_values;
	getConstrainingContextValue_source ():interface_request.Csubscribe {
		return this.state_context_values["source"].referenced_node;
	}
	type_path:string = "'interface_reply'?'type'*'notification'";
	output_parameters__type__notification;
}
export class Ccreate__type__notification extends StateNode<Cnotification, {
	initialize_node: Cinitialize_node;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'create'";
	}
	state_context_values;
	type_path:string = "'interface_reply'?'type'*'notification'?'type'*'create'";
}
export class Cremove__type__notification extends StateNode<Cnotification, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'remove'";
	}
	state_context_values;
	type_path:string = "'interface_reply'?'type'*'notification'?'type'*'remove'";
}
export class Cupdate__type__notification extends StateNode<Cnotification, {
	update_node: Cupdate_node;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'update'";
	}
	state_context_values;
	type_path:string = "'interface_reply'?'type'*'notification'?'type'*'update'";
}
export class Cdelete_node extends AlanNode<{
}> {
	location;
	getPath ():string {
		return this.location.getPath() + '\'' + this.property_component_name + '\'';
	}
	imp_resolveInputParameter;
	property_component_name;
	switchOnLocation <T>(cases:{
		"'interface_reply'!'update node'.'properties'?'type'*'collection'.'entries'?'type'*'remove':'delete node'":($?:Cremove__type__entries) => T;
		"'interface_reply'!'update node'.'properties'?'type'*'state group'?'type'*'set':'delete node'":($?:Cset) => T;
	}):T {
		var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
		if (typeof current_case === 'function') {
			return current_case(this.location);
		} else {
			return current_case;
		}
	}
	castToLocation__interface_reply___update_node___properties___type___collection___entries___type___remove___delete_node_():Cremove__type__entries{
		return this.location;
	}
	castToLocation__interface_reply___update_node___properties___type___state_group___type___set___delete_node_():Cset{
		return this.location;
	}
	output_parameters;
	type_path:string = "'interface_reply'!'delete node'";
}
export class Cinitialize_node extends AlanNode<{
	properties: Matrix<Cproperties__initialize_node>;
}> {
	location;
	getPath ():string {
		return this.location.getPath() + '\'' + this.property_component_name + '\'';
	}
	imp_resolveInputParameter;
	property_component_name;
	switchOnLocation <T>(cases:{
		"'interface_reply'?'type'*'initialization'?'has initialization data'*'yes'?'context exists'*'yes':'root'":($?:Cyes__context_exists) => T;
		"'interface_reply'?'type'*'notification'?'type'*'create':'initialize node'":($?:Ccreate__type__notification) => T;
		"'interface_reply'!'initialize node'.'properties'?'type'*'collection'.'entries':'node'":($?:Centries__collection__type__properties__initialize_node) => T;
		"'interface_reply'!'initialize node'.'properties'?'type'*'component':'node'":($?:Ccomponent__type__properties__initialize_node) => T;
		"'interface_reply'!'initialize node'.'properties'?'type'*'group':'node'":($?:Cgroup__type__properties__initialize_node) => T;
		"'interface_reply'!'initialize node'.'properties'?'type'*'state group':'node'":($?:Cstate_group__type__properties__initialize_node) => T;
		"'interface_reply'!'update node'.'properties'?'type'*'collection'.'entries'?'type'*'create':'node'":($?:Ccreate__type__entries) => T;
		"'interface_reply'!'update node'.'properties'?'type'*'state group'?'type'*'set':'node'":($?:Cset) => T;
	}):T {
		var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
		if (typeof current_case === 'function') {
			return current_case(this.location);
		} else {
			return current_case;
		}
	}
	castToLocation__interface_reply___type___initialization___has_initialization_data___yes___context_exists___yes___root_():Cyes__context_exists{
		return this.location;
	}
	castToLocation__interface_reply___type___notification___type___create___initialize_node_():Ccreate__type__notification{
		return this.location;
	}
	castToLocation__interface_reply___initialize_node___properties___type___collection___entries___node_():Centries__collection__type__properties__initialize_node{
		return this.location;
	}
	castToLocation__interface_reply___initialize_node___properties___type___component___node_():Ccomponent__type__properties__initialize_node{
		return this.location;
	}
	castToLocation__interface_reply___initialize_node___properties___type___group___node_():Cgroup__type__properties__initialize_node{
		return this.location;
	}
	castToLocation__interface_reply___initialize_node___properties___type___state_group___node_():Cstate_group__type__properties__initialize_node{
		return this.location;
	}
	castToLocation__interface_reply___update_node___properties___type___collection___entries___type___create___node_():Ccreate__type__entries{
		return this.location;
	}
	castToLocation__interface_reply___update_node___properties___type___state_group___type___set___node_():Cset{
		return this.location;
	}
	getInputParameter_context_node (): interface.Cnode {
		var param_res;
		this.imp_resolveInputParameter("context node", function (err, paramval) {
			if (err) {
				throw "Unexpected resolution error for input parameter!";
			} else {
				param_res = paramval;
			}
		}, function () { throw new Error('Input parameter could not be resolved'); });
		return param_res;
	}
	output_parameters;
	type_path:string = "'interface_reply'!'initialize node'";
}
export class Cproperties__initialize_node extends MatrixNode<Cinitialize_node, interface.Cproperty, {
	type: StateGroup<
		{ name: "collection", node: Ccollection__type__properties__initialize_node}
		|{ name: "component", node: Ccomponent__type__properties__initialize_node}
		|{ name: "file", node: Cfile__type__properties__initialize_node}
		|{ name: "group", node: Cgroup__type__properties__initialize_node}
		|{ name: "number", node: Cnumber__type__properties__initialize_node}
		|{ name: "reference", node: Creference__type__properties__initialize_node}
		|{ name: "state group", node: Cstate_group__type__properties__initialize_node}
		|{ name: "text", node: Ctext__type__properties__initialize_node}
		, {"collection": Ccollection__type__properties__initialize_node,"component": Ccomponent__type__properties__initialize_node,"file": Cfile__type__properties__initialize_node,"group": Cgroup__type__properties__initialize_node,"number": Cnumber__type__properties__initialize_node,"reference": Creference__type__properties__initialize_node,"state group": Cstate_group__type__properties__initialize_node,"text": Ctext__type__properties__initialize_node}>,
}> {
	getPath ():string {
		return this.parent.getPath() + ".'properties'[" + id.serializeIdentifier(this.key.entry) + "]";
	}
	type_path:string = "'interface_reply'!'initialize node'.'properties'";
	output_parameters__type__properties__initialize_node;
}
export class Ccollection__type__properties__initialize_node extends StateNode<Cproperties__initialize_node, {
	entries: Dictionary<Centries__collection__type__properties__initialize_node>;
	type: StateGroup<
		{ name: "dictionary", node: Cdictionary__type__collection__type__properties__initialize_node}
		|{ name: "matrix", node: Cmatrix__type__collection__type__properties__initialize_node}
		, {"dictionary": Cdictionary__type__collection__type__properties__initialize_node,"matrix": Cmatrix__type__collection__type__properties__initialize_node}>,
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'collection'";
	}
	state_context_values;
	getConstrainingContextValue_collection ():interface.Ccollection__type__property {
		return this.state_context_values["collection"].referenced_node;
	}
	type_path:string = "'interface_reply'!'initialize node'.'properties'?'type'*'collection'";
	output_parameters__type__collection__type__properties__initialize_node;
}
export class Centries__collection__type__properties__initialize_node extends DictionaryNode<Ccollection__type__properties__initialize_node, {
	node: Cinitialize_node;
}> {
	getPath ():string {
		return this.parent.getPath() + ".'entries'[" + id.serializeIdentifier(this.key) + "]";
	}
	type_path:string = "'interface_reply'!'initialize node'.'properties'?'type'*'collection'.'entries'";
}
export class Cdictionary__type__collection__type__properties__initialize_node extends StateNode<Ccollection__type__properties__initialize_node, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'dictionary'";
	}
	state_context_values;
	getConstrainingContextValue_dictionary ():interface.Cdictionary {
		return this.state_context_values["dictionary"].referenced_node;
	}
	type_path:string = "'interface_reply'!'initialize node'.'properties'?'type'*'collection'?'type'*'dictionary'";
}
export class Cmatrix__type__collection__type__properties__initialize_node extends StateNode<Ccollection__type__properties__initialize_node, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'matrix'";
	}
	state_context_values;
	getConstrainingContextValue_matrix ():interface.Cmatrix__type__collection {
		return this.state_context_values["matrix"].referenced_node;
	}
	type_path:string = "'interface_reply'!'initialize node'.'properties'?'type'*'collection'?'type'*'matrix'";
}
export class Ccomponent__type__properties__initialize_node extends StateNode<Cproperties__initialize_node, {
	node: Cinitialize_node;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'component'";
	}
	state_context_values;
	getConstrainingContextValue_component ():interface.Ccomponent {
		return this.state_context_values["component"].referenced_node;
	}
	type_path:string = "'interface_reply'!'initialize node'.'properties'?'type'*'component'";
}
export class Cfile__type__properties__initialize_node extends StateNode<Cproperties__initialize_node, {
	extension: string;
	token: string;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'file'";
	}
	state_context_values;
	getConstrainingContextValue_text ():interface.Cfile__type__property {
		return this.state_context_values["text"].referenced_node;
	}
	type_path:string = "'interface_reply'!'initialize node'.'properties'?'type'*'file'";
}
export class Cgroup__type__properties__initialize_node extends StateNode<Cproperties__initialize_node, {
	node: Cinitialize_node;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'group'";
	}
	state_context_values;
	getConstrainingContextValue_group ():interface.Cgroup__type__property {
		return this.state_context_values["group"].referenced_node;
	}
	type_path:string = "'interface_reply'!'initialize node'.'properties'?'type'*'group'";
}
export class Cnumber__type__properties__initialize_node extends StateNode<Cproperties__initialize_node, {
	type: StateGroup<
		{ name: "integer", node: Cinteger__type__number__type__properties__initialize_node}
		|{ name: "natural", node: Cnatural__type__number__type__properties__initialize_node}
		, {"integer": Cinteger__type__number__type__properties__initialize_node,"natural": Cnatural__type__number__type__properties__initialize_node}>,
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'number'";
	}
	state_context_values;
	getConstrainingContextValue_number ():interface.Cnumber__type__property {
		return this.state_context_values["number"].referenced_node;
	}
	type_path:string = "'interface_reply'!'initialize node'.'properties'?'type'*'number'";
	output_parameters__type__number__type__properties__initialize_node;
}
export class Cinteger__type__number__type__properties__initialize_node extends StateNode<Cnumber__type__properties__initialize_node, {
	value: number;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'integer'";
	}
	state_context_values;
	getConstrainingContextValue_integer_type ():interface.Cinteger__set__number__type__property {
		return this.state_context_values["integer type"].referenced_node;
	}
	type_path:string = "'interface_reply'!'initialize node'.'properties'?'type'*'number'?'type'*'integer'";
}
export class Cnatural__type__number__type__properties__initialize_node extends StateNode<Cnumber__type__properties__initialize_node, {
	value: number;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'natural'";
	}
	state_context_values;
	getConstrainingContextValue_natural_type ():interface.Cnatural__set__number__type__property {
		return this.state_context_values["natural type"].referenced_node;
	}
	type_path:string = "'interface_reply'!'initialize node'.'properties'?'type'*'number'?'type'*'natural'";
}
export class Creference__type__properties__initialize_node extends StateNode<Cproperties__initialize_node, {
	referenced_node: string;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'reference'";
	}
	state_context_values;
	getConstrainingContextValue_reference ():interface.Creference__type__property {
		return this.state_context_values["reference"].referenced_node;
	}
	type_path:string = "'interface_reply'!'initialize node'.'properties'?'type'*'reference'";
}
export class Cstate_group__type__properties__initialize_node extends StateNode<Cproperties__initialize_node, {
	node: Cinitialize_node;
	state: Reference<interface.Cstates__state_group__type__property>;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'state group'";
	}
	state_context_values;
	getConstrainingContextValue_state_group ():interface.Cstate_group__type__property {
		return this.state_context_values["state group"].referenced_node;
	}
	type_path:string = "'interface_reply'!'initialize node'.'properties'?'type'*'state group'";
}
export class Ctext__type__properties__initialize_node extends StateNode<Cproperties__initialize_node, {
	value: string;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'text'";
	}
	state_context_values;
	getConstrainingContextValue_text ():interface.Ctext__type__property {
		return this.state_context_values["text"].referenced_node;
	}
	type_path:string = "'interface_reply'!'initialize node'.'properties'?'type'*'text'";
}
export class Cupdate_node extends AlanNode<{
	properties: Matrix<Cproperties__update_node>;
}> {
	location;
	getPath ():string {
		return this.location.getPath() + '\'' + this.property_component_name + '\'';
	}
	imp_resolveInputParameter;
	property_component_name;
	switchOnLocation <T>(cases:{
		"'interface_reply'?'type'*'notification'?'type'*'update':'update node'":($?:Cupdate__type__notification) => T;
		"'interface_reply'!'update node'.'properties'?'type'*'collection'.'entries'?'type'*'update':'update node'":($?:Cupdate__type__entries) => T;
		"'interface_reply'!'update node'.'properties'?'type'*'component':'update node'":($?:Ccomponent__type__properties__update_node) => T;
		"'interface_reply'!'update node'.'properties'?'type'*'group':'update node'":($?:Cgroup__type__properties__update_node) => T;
		"'interface_reply'!'update node'.'properties'?'type'*'state group'?'type'*'update':'update node'":($?:Cupdate__type__state_group) => T;
	}):T {
		var current_case = cases[this.location.type_path + ':\'' + this.property_component_name + '\''];
		if (typeof current_case === 'function') {
			return current_case(this.location);
		} else {
			return current_case;
		}
	}
	castToLocation__interface_reply___type___notification___type___update___update_node_():Cupdate__type__notification{
		return this.location;
	}
	castToLocation__interface_reply___update_node___properties___type___collection___entries___type___update___update_node_():Cupdate__type__entries{
		return this.location;
	}
	castToLocation__interface_reply___update_node___properties___type___component___update_node_():Ccomponent__type__properties__update_node{
		return this.location;
	}
	castToLocation__interface_reply___update_node___properties___type___group___update_node_():Cgroup__type__properties__update_node{
		return this.location;
	}
	castToLocation__interface_reply___update_node___properties___type___state_group___type___update___update_node_():Cupdate__type__state_group{
		return this.location;
	}
	getInputParameter_context_node (): interface.Cnode {
		var param_res;
		this.imp_resolveInputParameter("context node", function (err, paramval) {
			if (err) {
				throw "Unexpected resolution error for input parameter!";
			} else {
				param_res = paramval;
			}
		}, function () { throw new Error('Input parameter could not be resolved'); });
		return param_res;
	}
	output_parameters;
	type_path:string = "'interface_reply'!'update node'";
}
export class Cproperties__update_node extends MatrixNode<Cupdate_node, interface.Cproperty, {
	type: StateGroup<
		{ name: "collection", node: Ccollection__type__properties__update_node}
		|{ name: "component", node: Ccomponent__type__properties__update_node}
		|{ name: "file", node: Cfile__type__properties__update_node}
		|{ name: "group", node: Cgroup__type__properties__update_node}
		|{ name: "number", node: Cnumber__type__properties__update_node}
		|{ name: "reference", node: Creference__type__properties__update_node}
		|{ name: "state group", node: Cstate_group__type__properties__update_node}
		|{ name: "text", node: Ctext__type__properties__update_node}
		, {"collection": Ccollection__type__properties__update_node,"component": Ccomponent__type__properties__update_node,"file": Cfile__type__properties__update_node,"group": Cgroup__type__properties__update_node,"number": Cnumber__type__properties__update_node,"reference": Creference__type__properties__update_node,"state group": Cstate_group__type__properties__update_node,"text": Ctext__type__properties__update_node}>,
}> {
	getPath ():string {
		return this.parent.getPath() + ".'properties'[" + id.serializeIdentifier(this.key.entry) + "]";
	}
	type_path:string = "'interface_reply'!'update node'.'properties'";
	output_parameters__type__properties__update_node;
}
export class Ccollection__type__properties__update_node extends StateNode<Cproperties__update_node, {
	entries: Dictionary<Centries__collection__type__properties__update_node>;
	type: StateGroup<
		{ name: "dictionary", node: Cdictionary__type__collection__type__properties__update_node}
		|{ name: "matrix", node: Cmatrix__type__collection__type__properties__update_node}
		, {"dictionary": Cdictionary__type__collection__type__properties__update_node,"matrix": Cmatrix__type__collection__type__properties__update_node}>,
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'collection'";
	}
	state_context_values;
	getConstrainingContextValue_collection ():interface.Ccollection__type__property {
		return this.state_context_values["collection"].referenced_node;
	}
	type_path:string = "'interface_reply'!'update node'.'properties'?'type'*'collection'";
	output_parameters__type__collection__type__properties__update_node;
}
export class Centries__collection__type__properties__update_node extends DictionaryNode<Ccollection__type__properties__update_node, {
	type: StateGroup<
		{ name: "create", node: Ccreate__type__entries}
		|{ name: "remove", node: Cremove__type__entries}
		|{ name: "rename", node: Crename}
		|{ name: "update", node: Cupdate__type__entries}
		, {"create": Ccreate__type__entries,"remove": Cremove__type__entries,"rename": Crename,"update": Cupdate__type__entries}>,
}> {
	getPath ():string {
		return this.parent.getPath() + ".'entries'[" + id.serializeIdentifier(this.key) + "]";
	}
	type_path:string = "'interface_reply'!'update node'.'properties'?'type'*'collection'.'entries'";
	output_parameters__type__entries__collection__type__properties__update_node;
}
export class Ccreate__type__entries extends StateNode<Centries__collection__type__properties__update_node, {
	node: Cinitialize_node;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'create'";
	}
	state_context_values;
	type_path:string = "'interface_reply'!'update node'.'properties'?'type'*'collection'.'entries'?'type'*'create'";
}
export class Cremove__type__entries extends StateNode<Centries__collection__type__properties__update_node, {
	delete_node: Cdelete_node;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'remove'";
	}
	state_context_values;
	type_path:string = "'interface_reply'!'update node'.'properties'?'type'*'collection'.'entries'?'type'*'remove'";
}
export class Crename extends StateNode<Centries__collection__type__properties__update_node, {
	old_id: Reference<interface_reply.Cno__invalidate_referencer>;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'rename'";
	}
	state_context_values;
	type_path:string = "'interface_reply'!'update node'.'properties'?'type'*'collection'.'entries'?'type'*'rename'";
}
export class Cupdate__type__entries extends StateNode<Centries__collection__type__properties__update_node, {
	invalidate_referencer: StateGroup<
		{ name: "no", node: Cno__invalidate_referencer}
		|{ name: "yes", node: Cyes__invalidate_referencer}
		, {"no": Cno__invalidate_referencer,"yes": Cyes__invalidate_referencer}>,
	update_node: Cupdate_node;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'update'";
	}
	state_context_values;
	type_path:string = "'interface_reply'!'update node'.'properties'?'type'*'collection'.'entries'?'type'*'update'";
	output_parameters__invalidate_referencer__update__type__entries;
}
export class Cno__invalidate_referencer extends StateNode<Cupdate__type__entries, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'invalidate referencer'*'no'";
	}
	state_context_values;
	type_path:string = "'interface_reply'!'update node'.'properties'?'type'*'collection'.'entries'?'type'*'update'?'invalidate referencer'*'no'";
}
export class Cyes__invalidate_referencer extends StateNode<Cupdate__type__entries, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'invalidate referencer'*'yes'";
	}
	state_context_values;
	getConstrainingContextValue_matrix ():interface_reply.Cmatrix__type__collection__type__properties__update_node {
		return this.state_context_values["matrix"].referenced_node;
	}
	type_path:string = "'interface_reply'!'update node'.'properties'?'type'*'collection'.'entries'?'type'*'update'?'invalidate referencer'*'yes'";
}
export class Cdictionary__type__collection__type__properties__update_node extends StateNode<Ccollection__type__properties__update_node, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'dictionary'";
	}
	state_context_values;
	getConstrainingContextValue_dictionary ():interface.Cdictionary {
		return this.state_context_values["dictionary"].referenced_node;
	}
	type_path:string = "'interface_reply'!'update node'.'properties'?'type'*'collection'?'type'*'dictionary'";
}
export class Cmatrix__type__collection__type__properties__update_node extends StateNode<Ccollection__type__properties__update_node, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'matrix'";
	}
	state_context_values;
	getConstrainingContextValue_matrix ():interface.Cmatrix__type__collection {
		return this.state_context_values["matrix"].referenced_node;
	}
	type_path:string = "'interface_reply'!'update node'.'properties'?'type'*'collection'?'type'*'matrix'";
}
export class Ccomponent__type__properties__update_node extends StateNode<Cproperties__update_node, {
	update_node: Cupdate_node;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'component'";
	}
	state_context_values;
	getConstrainingContextValue_component ():interface.Ccomponent {
		return this.state_context_values["component"].referenced_node;
	}
	type_path:string = "'interface_reply'!'update node'.'properties'?'type'*'component'";
}
export class Cfile__type__properties__update_node extends StateNode<Cproperties__update_node, {
	new_extension: string;
	new_token: string;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'file'";
	}
	state_context_values;
	getConstrainingContextValue_file ():interface.Cfile__type__property {
		return this.state_context_values["file"].referenced_node;
	}
	type_path:string = "'interface_reply'!'update node'.'properties'?'type'*'file'";
}
export class Cgroup__type__properties__update_node extends StateNode<Cproperties__update_node, {
	update_node: Cupdate_node;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'group'";
	}
	state_context_values;
	getConstrainingContextValue_group ():interface.Cgroup__type__property {
		return this.state_context_values["group"].referenced_node;
	}
	type_path:string = "'interface_reply'!'update node'.'properties'?'type'*'group'";
}
export class Cnumber__type__properties__update_node extends StateNode<Cproperties__update_node, {
	type: StateGroup<
		{ name: "integer", node: Cinteger__type__number__type__properties__update_node}
		|{ name: "natural", node: Cnatural__type__number__type__properties__update_node}
		, {"integer": Cinteger__type__number__type__properties__update_node,"natural": Cnatural__type__number__type__properties__update_node}>,
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'number'";
	}
	state_context_values;
	getConstrainingContextValue_number ():interface.Cnumber__type__property {
		return this.state_context_values["number"].referenced_node;
	}
	type_path:string = "'interface_reply'!'update node'.'properties'?'type'*'number'";
	output_parameters__type__number__type__properties__update_node;
}
export class Cinteger__type__number__type__properties__update_node extends StateNode<Cnumber__type__properties__update_node, {
	new_value: number;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'integer'";
	}
	state_context_values;
	getConstrainingContextValue_integer_type ():interface.Cinteger__set__number__type__property {
		return this.state_context_values["integer type"].referenced_node;
	}
	type_path:string = "'interface_reply'!'update node'.'properties'?'type'*'number'?'type'*'integer'";
}
export class Cnatural__type__number__type__properties__update_node extends StateNode<Cnumber__type__properties__update_node, {
	new_value: number;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'natural'";
	}
	state_context_values;
	getConstrainingContextValue_natural_type ():interface.Cnatural__set__number__type__property {
		return this.state_context_values["natural type"].referenced_node;
	}
	type_path:string = "'interface_reply'!'update node'.'properties'?'type'*'number'?'type'*'natural'";
}
export class Creference__type__properties__update_node extends StateNode<Cproperties__update_node, {
	new_referenced_node: string;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'reference'";
	}
	state_context_values;
	getConstrainingContextValue_reference ():interface.Creference__type__property {
		return this.state_context_values["reference"].referenced_node;
	}
	type_path:string = "'interface_reply'!'update node'.'properties'?'type'*'reference'";
}
export class Cstate_group__type__properties__update_node extends StateNode<Cproperties__update_node, {
	state: Reference<interface.Cstates__state_group__type__property>;
	type: StateGroup<
		{ name: "set", node: Cset}
		|{ name: "update", node: Cupdate__type__state_group}
		, {"set": Cset,"update": Cupdate__type__state_group}>,
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'state group'";
	}
	state_context_values;
	getConstrainingContextValue_state_group ():interface.Cstate_group__type__property {
		return this.state_context_values["state group"].referenced_node;
	}
	type_path:string = "'interface_reply'!'update node'.'properties'?'type'*'state group'";
	output_parameters__type__state_group__type__properties__update_node;
}
export class Cset extends StateNode<Cstate_group__type__properties__update_node, {
	delete_node: Cdelete_node;
	node: Cinitialize_node;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'set'";
	}
	state_context_values;
	type_path:string = "'interface_reply'!'update node'.'properties'?'type'*'state group'?'type'*'set'";
}
export class Cupdate__type__state_group extends StateNode<Cstate_group__type__properties__update_node, {
	update_node: Cupdate_node;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'update'";
	}
	state_context_values;
	type_path:string = "'interface_reply'!'update node'.'properties'?'type'*'state group'?'type'*'update'";
}
export class Ctext__type__properties__update_node extends StateNode<Cproperties__update_node, {
	new_value: string;
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'text'";
	}
	state_context_values;
	getConstrainingContextValue_text ():interface.Ctext__type__property {
		return this.state_context_values["text"].referenced_node;
	}
	type_path:string = "'interface_reply'!'update node'.'properties'?'type'*'text'";
}
