import * as package_definition from "./read_api";
import * as resolver from "./reference_resolver";
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
export class Cpackage_definition extends AlanNode<{
	type: StateGroup<
		{ name: "language", node: Clanguage}
		|{ name: "package", node: Cpackage}
		, {"language": Clanguage,"package": Cpackage}>,
}> {
	imp_resolveInputParameter;
	key?:string
	getPath ():string {
		return '';
	}
	type_path:string = "'package_definition'";
	output_parameters__type__package_definition;
}
export class Clanguage extends StateNode<Cpackage_definition, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'language'";
	}
	state_context_values;
	type_path:string = "'package_definition'?'type'*'language'";
}
export class Cpackage extends StateNode<Cpackage_definition, {
}> {
	getPath ():string {
		return this.parent.getPath() + "?'type'*'package'";
	}
	state_context_values;
	type_path:string = "'package_definition'?'type'*'package'";
}
