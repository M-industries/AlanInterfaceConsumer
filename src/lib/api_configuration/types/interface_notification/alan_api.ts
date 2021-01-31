import * as interface_notification from './alan_api';
import * as interface_ from '../interface/alan_api';

function isFunction<T>(p:T): p is T & Function {
	return (typeof p === 'function');
}
function assert(predicate:boolean) {
	if (predicate === false) throw new Error(`Assertion error`);
}
function resolve<T>(context:T) {
	return {
		then: <RT>(callback: (context: T) => RT) => resolve(callback(context)),
		result: context
	};
}
function depend<T>(detach:boolean, obj:T):T {
	return obj;
}
export type dictionary_type<T> = {[key:string]:T};


enum ResolutionStatus {
	Resolved,
	Resolving,
	Unresolved,
}
function cache<T extends AlanObject>(callback:(detach:boolean) => T) {
	let cached_value:T;
	let status:ResolutionStatus = ResolutionStatus.Unresolved;
	return (detach = false) => {
		switch (status) {
			case ResolutionStatus.Resolving:
				throw new Error(`Cyclic dependency detected!`);
			case ResolutionStatus.Resolved: {
				if (!detach) break;
				callback(detach);
				(cached_value as any) = undefined;
				status = ResolutionStatus.Unresolved;
			} break;
			case ResolutionStatus.Unresolved: {
				if (detach) break;
				status = ResolutionStatus.Resolving;
				cached_value = callback(detach);
				status = ResolutionStatus.Resolved;
			} break;
		}
		return cached_value;
	}
}

function maybe_cache<T extends AlanObject>(callback:(detach:boolean) => T|undefined) {
	let cached_value:T|undefined;
	let status:ResolutionStatus = ResolutionStatus.Unresolved;
	return (detach = false) => {
		switch (status) {
			case ResolutionStatus.Resolving:
				throw new Error(`Cyclic dependency detected!`);
			case ResolutionStatus.Resolved: {
				if (!detach) break;
				callback(detach);
				cached_value = undefined;
				status = ResolutionStatus.Unresolved;
			} break;
			case ResolutionStatus.Unresolved: {
				if (detach) break;
				status = ResolutionStatus.Resolving;
				cached_value = callback(detach);
				status = ResolutionStatus.Resolved;
			} break;
		}
		return cached_value;
	}
}

/* number validation */
function number__is_positive(val:number) { assert(val > 0); }
function number__is_negative(val:number) { assert(val < 0); }
function number__is_zero(val:number) { assert(val === 0); }
function number__is_non_positive(val:number) { assert(val <= 0); }
function number__is_non_negative(val:number) { assert(val >= 0); }
function number__is_non_zero(val:number) { assert(val !== 0); }

/* complex value wrappers */
export abstract class AlanObject {
	public abstract get path():string;
}
export abstract class AlanStruct extends AlanObject {
	public abstract get path():string;
	public abstract is(other:AlanStruct):boolean;
}
export interface Tree<T> {
	types: {[name:string]:T};
	subtrees: {[name:string]:Tree<T>};
}
export abstract class Reference<T extends AlanObject, V extends (string|string[])> extends AlanObject {
	constructor(public readonly entry:V, private readonly resolve:() => T) { super(); }
	public get ref() { return this.resolve(); }
}
export abstract class AlanInteger extends AlanObject {
	constructor(public readonly value:number) { super(); }
}
export abstract class AlanDictionary<T extends {node: AlanDictionaryEntry, init: any }, P extends AlanNode> extends AlanObject {
	protected _entries:Map<string,((parent:P) => T['node'])|T['node']>;

	private load_entry(key:string, entry:((parent:P) => T['node'])|T['node']):T['node'] {
		if (typeof entry === 'function') {
			const loaded_entry = entry(this.parent);
			this._entries.set(key, loaded_entry);
			return loaded_entry;
		}
		return entry;
	}
	constructor (
		entries:{[key:string]:T['init']},
		protected parent:P) {
		super();

		this._entries = new Map(Object.keys(entries).map(entry_key => [entry_key, this.initialize(parent, entry_key, entries[entry_key])]));
	}

	protected abstract initialize(parent:P, key:string, obj:T['init']):T['node'];
	protected abstract resolve(obj:T['node'],detach?:boolean):void;

	get size() { return this._entries.size; }
	[Symbol.iterator]():IterableIterator<[string,T['node']]> {
		const $this = this;
		const iterator = this._entries.entries();
		return {
			next() {
				const next = iterator.next();
				if (next.done) {
					return next;
				} else {
					return {
						value: [next.value[0], $this.load_entry(next.value[0], next.value[1])]
					}
				}
			},
			[Symbol.iterator]() {
				return this;
			}
		};
	}
	entries():IterableIterator<[string,T['node']]> {
		return this[Symbol.iterator]();}
	forEach(walk_function: ($:T['node']) => void) {
		Array.from(this.entries()).forEach(entry => walk_function(entry[1]));
	}
	toArray():[string, T['node']][] {
		return Array.from(this.entries());
	}
	map<RT>(callback:(value:T['node']) => RT):Record<string, RT> {
		const result:Record<string, RT> = {};
		this._entries.forEach((value, key) => {
			result[key] = callback(this.load_entry(key, value));
		});
		return result;
	}
	get(key:string):T['node']|undefined {
		const entry = this._entries.get(key);
		if (entry)
			return this.load_entry(key, entry);
		else
			return undefined;
	}
	has(key:string):boolean { return this._entries.has(key); }
	switchOnEntryExists<RT>(key:string, onExists:(($: T['node']) => RT)|Exclude<RT, Function>, onNotExists:(() => RT)|Exclude<RT, Function>): RT {
		const entry = this._entries.get(key);
		if (entry === undefined) {
			return isFunction(onNotExists) ? onNotExists() : onNotExists;
		} else {
			return isFunction(onExists) ? onExists(this.load_entry(key, entry)) : onExists;
		}
	}
}

export abstract class AlanSet<T extends {node: AlanNode, init: any }, P extends AlanNode> extends AlanObject {
	private _entries:Set<T['node']>;
	constructor (
		entries:Array<T['init']>,
		protected parent:P) {
		super();
		this._entries = new Set(entries.map(entry => this.initialize(parent, entry)));
	}

	protected abstract initialize(parent:P, obj:T['init']):T['node'];
	protected abstract resolve(obj:T['node'],detach?:boolean):void;

	get size() { return this._entries.size; }
	[Symbol.iterator]() {
		return this._entries[Symbol.iterator]();
	}
	entries() {
		return this._entries.entries();
	}
	forEach(walk_function: ($:T['node']) => void) {
		this._entries.forEach(walk_function);
	}
	has(key:T['node']):boolean { return this._entries.has(key); }
}
type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
export abstract class StateGroup<T extends {name:string, node:AlanNode & {parent:AlanNode}, init:any}> extends AlanObject {
	public state: DistributiveOmit<T,'init'>;
	private init(state_name:T['name'], init:T['init'], parent:AlanNode) {
		this.state = {
			name: state_name,
			node: this.initializer(state_name)(init, parent),
		} as DistributiveOmit<T,'init'>;
	}
	constructor (s:[T['name'],T['init']]|T['name'], private parent:AlanNode) {
		super();
		const state_name:T['name'] = (typeof s === 'string') ? s : s[0];
		this.init(state_name, typeof s === 'string' ? {} : s[1], parent);
	}

	protected abstract initializer(state_name:T['name']): ($:T['init'], parent:AlanNode) => T['node'];
	protected abstract resolver(state:T['name']): ($:T['node'], detach?:boolean) => void;

	switch<TS> (cases:{[K in T['name']]:(($:Extract<T, {name:K}>['node']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.state.name as T['name']];
		if (isFunction(handler)) {
			return handler(this.state.node);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	cast<S extends T['name']>(state:S):Extract<T, {name:S}>['node'] {
		if (this.state.name === state) {
			return this.state.node;
		} else {
			throw new Error(`Invalid cast to state '${state}'; actual state is '${this.state.name}' at ${this.state.node.path} .`);
		}
	}

}

export abstract class AlanCombinator extends AlanObject {}
export abstract class AlanNode extends AlanStruct {
	protected _root:Cinterface_notification|undefined;
	public abstract get root():Cinterface_notification;
	public abstract get entity():AlanNode;
	public is(other:AlanNode):boolean {
		return this === other;
	}
}

abstract class AlanDictionaryEntry extends AlanNode {
	public abstract key:(string|Reference<AlanObject,string>);
	public abstract get key_value():string;
};
type AlanGraphEdge<T extends AlanNode> = {
	ref: {
		entity: T
	}
};
abstract class AlanGraphVertex extends AlanDictionaryEntry {
	abstract _edges: { [key: string ]: Set<AlanGraphEdge<AlanGraphVertex>> }
}
export abstract class AlanTopology<T extends { node:AlanGraphVertex, init:any }, P extends AlanNode, G extends string> extends AlanDictionary<T,P> {
	protected abstract _graphs: { [key: string ]: T['node'][] };
	topo_forEach(graph:G, walk_function: ($:T['node']) => void) {
		Array.from(this.topo_entries(graph)).forEach(entry => walk_function(entry));
	}
	topo_entries(graph:G):IterableIterator<T['node']> {
		return this._graphs[graph][Symbol.iterator]();
	}
	topo_sort(g:G) {
		const $this = this;
		$this._graphs[g] = []
		const indegree:Map<T['node'], number> = new Map(Array.from($this.entries()).map(([_,v]) => [v as T['node'],0]));
		for (let [_,v] of $this.entries()) {
			v._edges[g].forEach(edge => indegree.set(edge.ref.entity as AlanGraphVertex, indegree.get(edge.ref.entity as AlanGraphVertex)! + 1));
		}
		let queue: T['node'][] = [];

		//find all vertices with indegree 0
		indegree.forEach((v,k) => { if (v === 0) queue.push(k); });
		let visited = 0;
		while (queue.length > 0) {
			++visited;
			const v = queue.pop()!;
			$this._graphs[g].push(v);
			v._edges[g].forEach(edge => {
				const u = indegree.get(edge.ref.entity as T['node'])!;
				if (u === 1) {
					queue.push(edge.ref.entity as T['node']);
				} else {
					indegree.set(edge.ref.entity as T['node'], u - 1)
				}
			});
		}

		// Check if there was a cycle
		if (visited !== this._entries.size) {
			throw new Error(`Cycle found in graph.`);
		}
	}
	totally_ordered(g:G) {
		if (this._graphs[g].length < 2) return;
		this._graphs[g].reduce((prev, curr) => {
			let connected = false;
			prev._edges[g].forEach(e => { connected = (connected || e.ref.entity === curr) });
			if (!connected)
				throw new Error(`Totally ordered graph constraint violation.`);
			return curr;
		});
	}
}

/* alan objects */
export type Tupdate_node = {
	'properties':Record<string, Tproperties__update_node>;
};
export class Cupdate_node extends AlanNode {
	public readonly properties:{
		readonly properties:Cupdate_node.Dproperties
	};
	constructor(init:Tupdate_node, public location:AlanNode, public input: {
		context_node: () => interface_.Cnode
	}) {
		super();
		const $this = this;
		this.properties = {
			properties: new Cupdate_node.Dproperties(init['properties'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.location.root); }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/update node`; }
	public get entity() { return this.location.entity; }
}
export class Kproperties__update_node extends Reference<interface_.Cproperty, string> {
	constructor(key:string, $this:Cproperties__update_node) {
		super(key, cache((detach:boolean) => resolve($this.parent)
			.then(() => $this.parent)
			.then(context => context?.component_root.input.context_node())
			.then(context => {
				const entry = context?.properties.attributes.get(this.entry)!;
				return resolve(entry)
				.then(context => {
					if (context?.properties.type.state.name === 'property') {
						return depend(detach, context.properties.type.state.node as interface_.Cproperty);} else {
						depend(detach, context?.properties.type);
						return undefined;
					}
				}).result;
			}).result!))
	}
	public get path() { return `<unknown>/properties/key`; }
}
export type Tproperties__update_node = {
	'type':['collection', Tcollection__type__properties__update_node]|['file', Tfile__type__properties__update_node]|['group', Tgroup__type__properties__update_node]|['number', Tnumber__type__properties__update_node]|['state group', Tstate_group__type__properties__update_node]|['text', Ttext__type__properties__update_node];
};
export class Cproperties__update_node extends AlanDictionaryEntry {
	public key:Kproperties__update_node;
	public get key_value() { return this.key.entry; }
	public readonly properties:{
		readonly type:Cproperties__update_node.Dtype<
			{ name: 'collection', node:Ccollection__type__properties__update_node, init:Tcollection__type__properties__update_node}|
			{ name: 'file', node:Cfile__type__properties__update_node, init:Tfile__type__properties__update_node}|
			{ name: 'group', node:Cgroup__type__properties__update_node, init:Tgroup__type__properties__update_node}|
			{ name: 'number', node:Cnumber__type__properties__update_node, init:Tnumber__type__properties__update_node}|
			{ name: 'state group', node:Cstate_group__type__properties__update_node, init:Tstate_group__type__properties__update_node}|
			{ name: 'text', node:Ctext__type__properties__update_node, init:Ttext__type__properties__update_node}>
	};
	constructor(key:string, init:Tproperties__update_node, public parent:Cupdate_node) {
		super();
		const $this = this;
		this.key = new Kproperties__update_node(key, $this);
		this.properties = {
			type: new Cproperties__update_node.Dtype(init['type'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/properties[${this.key.entry}]`; }
	public get entity() { return this; }
}
export type Tcollection__type__properties__update_node = {
	'entries':Tentries__collection__type__properties__update_node[];
};
export class Ccollection__type__properties__update_node extends AlanNode {
	public readonly properties:{
		readonly entries:Ccollection__type__properties__update_node.Dentries
	};
	public readonly inferences:{
		collection: () => interface_.Ccollection
	} = {
		collection: cache((detach:boolean) => {
			const interface_notification__update_node__properties__type__collection_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => depend(detach, context?.key)?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'collection') {
						return resolve(depend(detach, context.properties.type.state.node as interface_.Ccollection)).result;
					} else {
						depend(detach, context?.properties.type);
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tcollection__type__properties__update_node, public parent:Cproperties__update_node) {
		super();
		const $this = this;
		this.properties = {
			entries: new Ccollection__type__properties__update_node.Dentries(init['entries'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?collection`; }
	public get entity() { return this.parent.entity; }
}
export type Tentries__collection__type__properties__update_node = {
	'type':['create', Tcreate__type__entries]|['remove', Tremove__type__entries]|['update', Tupdate__type__entries];
};
export class Centries__collection__type__properties__update_node extends AlanNode {
	public readonly properties:{
		readonly type:Centries__collection__type__properties__update_node.Dtype<
			{ name: 'create', node:Ccreate__type__entries, init:Tcreate__type__entries}|
			{ name: 'remove', node:Cremove__type__entries, init:Tremove__type__entries}|
			{ name: 'update', node:Cupdate__type__entries, init:Tupdate__type__entries}>
	};
	constructor(init:Tentries__collection__type__properties__update_node, public parent:Ccollection__type__properties__update_node) {
		super();
		const $this = this;
		this.properties = {
			type: new Centries__collection__type__properties__update_node.Dtype(init['type'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/entries`; }
	public get entity() { return this; }
}
export type Tcreate__type__entries = {
	'node':Tinitialize_node;
};
export class Ccreate__type__entries extends AlanNode {
	public readonly properties:{
		readonly node:Cinitialize_node
	};
	constructor(init:Tcreate__type__entries, public parent:Centries__collection__type__properties__update_node) {
		super();
		const $this = this;
		this.properties = {
			node: new Ccreate__type__entries.Dnode(init['node'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?create`; }
	public get entity() { return this.parent.entity; }
}
export type Tremove__type__entries = {
	'key':string;
};
export class Cremove__type__entries extends AlanNode {
	public readonly properties:{
		readonly key:string
	};
	constructor(init:Tremove__type__entries, public parent:Centries__collection__type__properties__update_node) {
		super();
		const $this = this;
		this.properties = {
			key: init['key']
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?remove`; }
	public get entity() { return this.parent.entity; }
}
export type Tupdate__type__entries = {
	'key':string;
	'update node':Tupdate_node;
};
export class Cupdate__type__entries extends AlanNode {
	public readonly properties:{
		readonly key:string,
		readonly update_node:Cupdate_node
	};
	constructor(init:Tupdate__type__entries, public parent:Centries__collection__type__properties__update_node) {
		super();
		const $this = this;
		this.properties = {
			key: init['key'],
			update_node: new Cupdate__type__entries.Dupdate_node(init['update node'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?update`; }
	public get entity() { return this.parent.entity; }
}
export type Tfile__type__properties__update_node = {
	'new extension':string;
	'new token':string;
};
export class Cfile__type__properties__update_node extends AlanNode {
	public readonly properties:{
		readonly new_extension:string,
		readonly new_token:string
	};
	public readonly inferences:{
		file: () => interface_.Cfile
	} = {
		file: cache((detach:boolean) => {
			const interface_notification__update_node__properties__type__file_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => depend(detach, context?.key)?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'file') {
						return resolve(depend(detach, context.properties.type.state.node as interface_.Cfile)).result;
					} else {
						depend(detach, context?.properties.type);
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tfile__type__properties__update_node, public parent:Cproperties__update_node) {
		super();
		const $this = this;
		this.properties = {
			new_extension: init['new extension'],
			new_token: init['new token']
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?file`; }
	public get entity() { return this.parent.entity; }
}
export type Tgroup__type__properties__update_node = {
	'update node':Tupdate_node;
};
export class Cgroup__type__properties__update_node extends AlanNode {
	public readonly properties:{
		readonly update_node:Cupdate_node
	};
	public readonly inferences:{
		group: () => interface_.Cgroup__type__property
	} = {
		group: cache((detach:boolean) => {
			const interface_notification__update_node__properties__type__group_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => depend(detach, context?.key)?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'group') {
						return resolve(depend(detach, context.properties.type.state.node as interface_.Cgroup__type__property)).result;
					} else {
						depend(detach, context?.properties.type);
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tgroup__type__properties__update_node, public parent:Cproperties__update_node) {
		super();
		const $this = this;
		this.properties = {
			update_node: new Cgroup__type__properties__update_node.Dupdate_node(init['update node'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?group`; }
	public get entity() { return this.parent.entity; }
}
export type Tnumber__type__properties__update_node = {
	'type':['integer', Tinteger__type__number__type__properties__update_node]|['natural', Tnatural__type__number__type__properties__update_node];
};
export class Cnumber__type__properties__update_node extends AlanNode {
	public readonly properties:{
		readonly type:Cnumber__type__properties__update_node.Dtype<
			{ name: 'integer', node:Cinteger__type__number__type__properties__update_node, init:Tinteger__type__number__type__properties__update_node}|
			{ name: 'natural', node:Cnatural__type__number__type__properties__update_node, init:Tnatural__type__number__type__properties__update_node}>
	};
	public readonly inferences:{
		number: () => interface_.Cnumber
	} = {
		number: cache((detach:boolean) => {
			const interface_notification__update_node__properties__type__number_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => depend(detach, context?.key)?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'number') {
						return resolve(depend(detach, context.properties.type.state.node as interface_.Cnumber)).result;
					} else {
						depend(detach, context?.properties.type);
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tnumber__type__properties__update_node, public parent:Cproperties__update_node) {
		super();
		const $this = this;
		this.properties = {
			type: new Cnumber__type__properties__update_node.Dtype(init['type'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?number`; }
	public get entity() { return this.parent.entity; }
}
export type Tinteger__type__number__type__properties__update_node = {
	'new value':number;
};
export class Cinteger__type__number__type__properties__update_node extends AlanNode {
	public readonly properties:{
		readonly new_value:Cinteger__type__number__type__properties__update_node.Dnew_value
	};
	public readonly inferences:{
		integer_type: () => interface_.Cinteger__set
	} = {
		integer_type: cache((detach:boolean) => {
			const interface_notification__update_node__properties__type__number__type__integer_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.inferences.number())
				.then(context => context?.properties.type)
				.then(context => {
					if (context?.properties.set.state.name === 'integer') {
						return resolve(depend(detach, context.properties.set.state.node as interface_.Cinteger__set)).result;
					} else {
						depend(detach, context?.properties.set);
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tinteger__type__number__type__properties__update_node, public parent:Cnumber__type__properties__update_node) {
		super();
		const $this = this;
		this.properties = {
			new_value: new Cinteger__type__number__type__properties__update_node.Dnew_value(init['new value'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?integer`; }
	public get entity() { return this.parent.entity; }
}
export type Tnatural__type__number__type__properties__update_node = {
	'new value':number;
};
export class Cnatural__type__number__type__properties__update_node extends AlanNode {
	public readonly properties:{
		readonly new_value:Cnatural__type__number__type__properties__update_node.Dnew_value
	};
	public readonly inferences:{
		natural_type: () => interface_.Cnatural__set
	} = {
		natural_type: cache((detach:boolean) => {
			const interface_notification__update_node__properties__type__number__type__natural_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.inferences.number())
				.then(context => context?.properties.type)
				.then(context => {
					if (context?.properties.set.state.name === 'natural') {
						return resolve(depend(detach, context.properties.set.state.node as interface_.Cnatural__set)).result;
					} else {
						depend(detach, context?.properties.set);
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tnatural__type__number__type__properties__update_node, public parent:Cnumber__type__properties__update_node) {
		super();
		const $this = this;
		this.properties = {
			new_value: new Cnatural__type__number__type__properties__update_node.Dnew_value(init['new value'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?natural`; }
	public get entity() { return this.parent.entity; }
}
export type Tstate_group__type__properties__update_node = {
	'state':string;
	'type':['set', Tset]|['update', Tupdate__type__state_group];
};
export class Cstate_group__type__properties__update_node extends AlanNode {
	public readonly properties:{
		readonly state:Cstate_group__type__properties__update_node.Dstate,
		readonly type:Cstate_group__type__properties__update_node.Dtype<
			{ name: 'set', node:Cset, init:Tset}|
			{ name: 'update', node:Cupdate__type__state_group, init:Tupdate__type__state_group}>
	};
	public readonly inferences:{
		state_group: () => interface_.Cstate_group
	} = {
		state_group: cache((detach:boolean) => {
			const interface_notification__update_node__properties__type__state_group_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => depend(detach, context?.key)?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'state group') {
						return resolve(depend(detach, context.properties.type.state.node as interface_.Cstate_group)).result;
					} else {
						depend(detach, context?.properties.type);
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tstate_group__type__properties__update_node, public parent:Cproperties__update_node) {
		super();
		const $this = this;
		this.properties = {
			state: new Cstate_group__type__properties__update_node.Dstate(init['state'], $this),
			type: new Cstate_group__type__properties__update_node.Dtype(init['type'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?state group`; }
	public get entity() { return this.parent.entity; }
}
export type Tset = {
	'node':Tinitialize_node;
};
export class Cset extends AlanNode {
	public readonly properties:{
		readonly node:Cinitialize_node
	};
	constructor(init:Tset, public parent:Cstate_group__type__properties__update_node) {
		super();
		const $this = this;
		this.properties = {
			node: new Cset.Dnode(init['node'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?set`; }
	public get entity() { return this.parent.entity; }
}
export type Tupdate__type__state_group = {
	'update node':Tupdate_node;
};
export class Cupdate__type__state_group extends AlanNode {
	public readonly properties:{
		readonly update_node:Cupdate_node
	};
	constructor(init:Tupdate__type__state_group, public parent:Cstate_group__type__properties__update_node) {
		super();
		const $this = this;
		this.properties = {
			update_node: new Cupdate__type__state_group.Dupdate_node(init['update node'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?update`; }
	public get entity() { return this.parent.entity; }
}
export type Ttext__type__properties__update_node = {
	'new value':string;
};
export class Ctext__type__properties__update_node extends AlanNode {
	public readonly properties:{
		readonly new_value:string
	};
	public readonly inferences:{
		text: () => interface_.Ctext
	} = {
		text: cache((detach:boolean) => {
			const interface_notification__update_node__properties__type__text_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => depend(detach, context?.key)?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'text') {
						return resolve(depend(detach, context.properties.type.state.node as interface_.Ctext)).result;
					} else {
						depend(detach, context?.properties.type);
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Ttext__type__properties__update_node, public parent:Cproperties__update_node) {
		super();
		const $this = this;
		this.properties = {
			new_value: init['new value']
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?text`; }
	public get entity() { return this.parent.entity; }
}
export type Tinitialize_node = {
	'properties':Record<string, Tproperties__initialize_node>;
};
export class Cinitialize_node extends AlanNode {
	public readonly properties:{
		readonly properties:Cinitialize_node.Dproperties
	};
	constructor(init:Tinitialize_node, public location:AlanNode, public input: {
		context_node: () => interface_.Cnode
	}) {
		super();
		const $this = this;
		this.properties = {
			properties: new Cinitialize_node.Dproperties(init['properties'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.location.root); }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/initialize node`; }
	public get entity() { return this.location.entity; }
}
export class Kproperties__initialize_node extends Reference<interface_.Cproperty, string> {
	constructor(key:string, $this:Cproperties__initialize_node) {
		super(key, cache((detach:boolean) => resolve($this.parent)
			.then(() => $this.parent)
			.then(context => context?.component_root.input.context_node())
			.then(context => {
				const entry = context?.properties.attributes.get(this.entry)!;
				return resolve(entry)
				.then(context => {
					if (context?.properties.type.state.name === 'property') {
						return depend(detach, context.properties.type.state.node as interface_.Cproperty);} else {
						depend(detach, context?.properties.type);
						return undefined;
					}
				}).result;
			}).result!))
	}
	public get path() { return `<unknown>/properties/key`; }
}
export type Tproperties__initialize_node = {
	'type':['collection', Tcollection__type__properties__initialize_node]|['file', Tfile__type__properties__initialize_node]|['group', Tgroup__type__properties__initialize_node]|['number', Tnumber__type__properties__initialize_node]|['state group', Tstate_group__type__properties__initialize_node]|['text', Ttext__type__properties__initialize_node];
};
export class Cproperties__initialize_node extends AlanDictionaryEntry {
	public key:Kproperties__initialize_node;
	public get key_value() { return this.key.entry; }
	public readonly properties:{
		readonly type:Cproperties__initialize_node.Dtype<
			{ name: 'collection', node:Ccollection__type__properties__initialize_node, init:Tcollection__type__properties__initialize_node}|
			{ name: 'file', node:Cfile__type__properties__initialize_node, init:Tfile__type__properties__initialize_node}|
			{ name: 'group', node:Cgroup__type__properties__initialize_node, init:Tgroup__type__properties__initialize_node}|
			{ name: 'number', node:Cnumber__type__properties__initialize_node, init:Tnumber__type__properties__initialize_node}|
			{ name: 'state group', node:Cstate_group__type__properties__initialize_node, init:Tstate_group__type__properties__initialize_node}|
			{ name: 'text', node:Ctext__type__properties__initialize_node, init:Ttext__type__properties__initialize_node}>
	};
	constructor(key:string, init:Tproperties__initialize_node, public parent:Cinitialize_node) {
		super();
		const $this = this;
		this.key = new Kproperties__initialize_node(key, $this);
		this.properties = {
			type: new Cproperties__initialize_node.Dtype(init['type'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/properties[${this.key.entry}]`; }
	public get entity() { return this; }
}
export type Tcollection__type__properties__initialize_node = {
	'entries':Tentries__collection__type__properties__initialize_node[];
};
export class Ccollection__type__properties__initialize_node extends AlanNode {
	public readonly properties:{
		readonly entries:Ccollection__type__properties__initialize_node.Dentries
	};
	public readonly inferences:{
		collection: () => interface_.Ccollection
	} = {
		collection: cache((detach:boolean) => {
			const interface_notification__initialize_node__properties__type__collection_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => depend(detach, context?.key)?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'collection') {
						return resolve(depend(detach, context.properties.type.state.node as interface_.Ccollection)).result;
					} else {
						depend(detach, context?.properties.type);
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tcollection__type__properties__initialize_node, public parent:Cproperties__initialize_node) {
		super();
		const $this = this;
		this.properties = {
			entries: new Ccollection__type__properties__initialize_node.Dentries(init['entries'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?collection`; }
	public get entity() { return this.parent.entity; }
}
export type Tentries__collection__type__properties__initialize_node = {
	'node':Tinitialize_node;
};
export class Centries__collection__type__properties__initialize_node extends AlanNode {
	public readonly properties:{
		readonly node:Cinitialize_node
	};
	constructor(init:Tentries__collection__type__properties__initialize_node, public parent:Ccollection__type__properties__initialize_node) {
		super();
		const $this = this;
		this.properties = {
			node: new Centries__collection__type__properties__initialize_node.Dnode(init['node'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/entries`; }
	public get entity() { return this; }
}
export type Tfile__type__properties__initialize_node = {
	'extension':string;
	'token':string;
};
export class Cfile__type__properties__initialize_node extends AlanNode {
	public readonly properties:{
		readonly extension:string,
		readonly token:string
	};
	public readonly inferences:{
		file: () => interface_.Cfile
	} = {
		file: cache((detach:boolean) => {
			const interface_notification__initialize_node__properties__type__file_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => depend(detach, context?.key)?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'file') {
						return resolve(depend(detach, context.properties.type.state.node as interface_.Cfile)).result;
					} else {
						depend(detach, context?.properties.type);
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tfile__type__properties__initialize_node, public parent:Cproperties__initialize_node) {
		super();
		const $this = this;
		this.properties = {
			extension: init['extension'],
			token: init['token']
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?file`; }
	public get entity() { return this.parent.entity; }
}
export type Tgroup__type__properties__initialize_node = {
	'node':Tinitialize_node;
};
export class Cgroup__type__properties__initialize_node extends AlanNode {
	public readonly properties:{
		readonly node:Cinitialize_node
	};
	public readonly inferences:{
		group: () => interface_.Cgroup__type__property
	} = {
		group: cache((detach:boolean) => {
			const interface_notification__initialize_node__properties__type__group_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => depend(detach, context?.key)?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'group') {
						return resolve(depend(detach, context.properties.type.state.node as interface_.Cgroup__type__property)).result;
					} else {
						depend(detach, context?.properties.type);
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tgroup__type__properties__initialize_node, public parent:Cproperties__initialize_node) {
		super();
		const $this = this;
		this.properties = {
			node: new Cgroup__type__properties__initialize_node.Dnode(init['node'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?group`; }
	public get entity() { return this.parent.entity; }
}
export type Tnumber__type__properties__initialize_node = {
	'type':['integer', Tinteger__type__number__type__properties__initialize_node]|['natural', Tnatural__type__number__type__properties__initialize_node];
};
export class Cnumber__type__properties__initialize_node extends AlanNode {
	public readonly properties:{
		readonly type:Cnumber__type__properties__initialize_node.Dtype<
			{ name: 'integer', node:Cinteger__type__number__type__properties__initialize_node, init:Tinteger__type__number__type__properties__initialize_node}|
			{ name: 'natural', node:Cnatural__type__number__type__properties__initialize_node, init:Tnatural__type__number__type__properties__initialize_node}>
	};
	public readonly inferences:{
		number: () => interface_.Cnumber
	} = {
		number: cache((detach:boolean) => {
			const interface_notification__initialize_node__properties__type__number_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => depend(detach, context?.key)?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'number') {
						return resolve(depend(detach, context.properties.type.state.node as interface_.Cnumber)).result;
					} else {
						depend(detach, context?.properties.type);
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tnumber__type__properties__initialize_node, public parent:Cproperties__initialize_node) {
		super();
		const $this = this;
		this.properties = {
			type: new Cnumber__type__properties__initialize_node.Dtype(init['type'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?number`; }
	public get entity() { return this.parent.entity; }
}
export type Tinteger__type__number__type__properties__initialize_node = {
	'value':number;
};
export class Cinteger__type__number__type__properties__initialize_node extends AlanNode {
	public readonly properties:{
		readonly value:Cinteger__type__number__type__properties__initialize_node.Dvalue
	};
	public readonly inferences:{
		integer_type: () => interface_.Cinteger__set
	} = {
		integer_type: cache((detach:boolean) => {
			const interface_notification__initialize_node__properties__type__number__type__integer_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.inferences.number())
				.then(context => context?.properties.type)
				.then(context => {
					if (context?.properties.set.state.name === 'integer') {
						return resolve(depend(detach, context.properties.set.state.node as interface_.Cinteger__set)).result;
					} else {
						depend(detach, context?.properties.set);
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tinteger__type__number__type__properties__initialize_node, public parent:Cnumber__type__properties__initialize_node) {
		super();
		const $this = this;
		this.properties = {
			value: new Cinteger__type__number__type__properties__initialize_node.Dvalue(init['value'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?integer`; }
	public get entity() { return this.parent.entity; }
}
export type Tnatural__type__number__type__properties__initialize_node = {
	'value':number;
};
export class Cnatural__type__number__type__properties__initialize_node extends AlanNode {
	public readonly properties:{
		readonly value:Cnatural__type__number__type__properties__initialize_node.Dvalue
	};
	public readonly inferences:{
		natural_type: () => interface_.Cnatural__set
	} = {
		natural_type: cache((detach:boolean) => {
			const interface_notification__initialize_node__properties__type__number__type__natural_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.inferences.number())
				.then(context => context?.properties.type)
				.then(context => {
					if (context?.properties.set.state.name === 'natural') {
						return resolve(depend(detach, context.properties.set.state.node as interface_.Cnatural__set)).result;
					} else {
						depend(detach, context?.properties.set);
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tnatural__type__number__type__properties__initialize_node, public parent:Cnumber__type__properties__initialize_node) {
		super();
		const $this = this;
		this.properties = {
			value: new Cnatural__type__number__type__properties__initialize_node.Dvalue(init['value'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?natural`; }
	public get entity() { return this.parent.entity; }
}
export type Tstate_group__type__properties__initialize_node = {
	'node':Tinitialize_node;
	'state':string;
};
export class Cstate_group__type__properties__initialize_node extends AlanNode {
	public readonly properties:{
		readonly node:Cinitialize_node,
		readonly state:Cstate_group__type__properties__initialize_node.Dstate
	};
	public readonly inferences:{
		state_group: () => interface_.Cstate_group
	} = {
		state_group: cache((detach:boolean) => {
			const interface_notification__initialize_node__properties__type__state_group_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => depend(detach, context?.key)?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'state group') {
						return resolve(depend(detach, context.properties.type.state.node as interface_.Cstate_group)).result;
					} else {
						depend(detach, context?.properties.type);
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tstate_group__type__properties__initialize_node, public parent:Cproperties__initialize_node) {
		super();
		const $this = this;
		this.properties = {
			node: new Cstate_group__type__properties__initialize_node.Dnode(init['node'], $this),
			state: new Cstate_group__type__properties__initialize_node.Dstate(init['state'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?state group`; }
	public get entity() { return this.parent.entity; }
}
export type Ttext__type__properties__initialize_node = {
	'value':string;
};
export class Ctext__type__properties__initialize_node extends AlanNode {
	public readonly properties:{
		readonly value:string
	};
	public readonly inferences:{
		text: () => interface_.Ctext
	} = {
		text: cache((detach:boolean) => {
			const interface_notification__initialize_node__properties__type__text_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => depend(detach, context?.key)?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'text') {
						return resolve(depend(detach, context.properties.type.state.node as interface_.Ctext)).result;
					} else {
						depend(detach, context?.properties.type);
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Ttext__type__properties__initialize_node, public parent:Cproperties__initialize_node) {
		super();
		const $this = this;
		this.properties = {
			value: init['value']
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?text`; }
	public get entity() { return this.parent.entity; }
}


export type Tinterface_notification = {
	'type':['create', Tcreate__type__interface_notification]|'remove'|['remove', {}]|['update', Tupdate__type__interface_notification];
};
export class Cinterface_notification extends AlanNode {
	public key?:string;
	public get root() { return this; }
	public readonly properties:{
		readonly type:Cinterface_notification.Dtype<
			{ name: 'create', node:Ccreate__type__interface_notification, init:Tcreate__type__interface_notification}|
			{ name: 'remove', node:Cremove__type__interface_notification, init:Tremove__type__interface_notification}|
			{ name: 'update', node:Cupdate__type__interface_notification, init:Tupdate__type__interface_notification}>
	};
	constructor(init:Tinterface_notification, public readonly input: {
	'interface':interface_.Cinterface}) {
		super();
		const $this = this;
		this.properties = {
			type: new Cinterface_notification.Dtype(init['type'], $this)
		};
	}
	public get path() { return ``; }
	public get entity() { return this; }
}
export type Tcreate__type__interface_notification = {
	'initialize node':Tinitialize_node;
};
export class Ccreate__type__interface_notification extends AlanNode {
	public readonly properties:{
		readonly initialize_node:Cinitialize_node
	};
	constructor(init:Tcreate__type__interface_notification, public parent:Cinterface_notification) {
		super();
		const $this = this;
		this.properties = {
			initialize_node: new Ccreate__type__interface_notification.Dinitialize_node(init['initialize node'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/type?create`; }
	public get entity() { return this.parent.entity; }
}
export type Tremove__type__interface_notification = {
};
export class Cremove__type__interface_notification extends AlanNode {
	constructor(init:Tremove__type__interface_notification, public parent:Cinterface_notification) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/type?remove`; }
	public get entity() { return this.parent.entity; }
}
export type Tupdate__type__interface_notification = {
	'update node':Tupdate_node;
};
export class Cupdate__type__interface_notification extends AlanNode {
	public readonly properties:{
		readonly update_node:Cupdate_node
	};
	constructor(init:Tupdate__type__interface_notification, public parent:Cinterface_notification) {
		super();
		const $this = this;
		this.properties = {
			update_node: new Cupdate__type__interface_notification.Dupdate_node(init['update node'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/type?update`; }
	public get entity() { return this.parent.entity; }
}

/* property classes */
export namespace Cinitialize_node {
	export class Dproperties extends AlanDictionary<{ node:Cproperties__initialize_node, init:Tproperties__initialize_node},Cinitialize_node> {
		protected initialize(parent:Cinitialize_node, key:string, entry_init:Tproperties__initialize_node) { return new Cproperties__initialize_node(key, entry_init, parent); }
		protected resolve = finalize_properties__initialize_node
		protected eval_required_keys(detach:boolean = false):void {
			let this_obj = this.parent;
			function do_include(interface_notification__initialize_node__properties_key_nval:interface_.Cproperty):boolean {
				return true;
			};
			resolve(this.parent)
			.then(() => this.parent)
			.then(context => context?.component_root.input.context_node())
			.then(context => {
				for (let [key,val] of context?.properties.attributes) {
					let tail_obj = resolve(val)
					.then(context => {
						if (context?.properties.type.state.name === 'property') {
							return depend(detach, context.properties.type.state.node as interface_.Cproperty);} else {
							depend(detach, context?.properties.type);
							return undefined;
						}
					}).result;
					if (tail_obj !== undefined && do_include(tail_obj)) {
						assert(this.get(key) !== undefined);
					}
				}
				return undefined;
			});
		}
		public get path() { return `${this.parent.path}/properties`; }
		constructor(data:Tinitialize_node['properties'], parent:Cinitialize_node) {
			super(data, parent);
		}
	}
}
export namespace Cproperties__initialize_node {
	export class Dtype<T extends
		{ name: 'collection', node:Ccollection__type__properties__initialize_node, init:Tcollection__type__properties__initialize_node}|
		{ name: 'file', node:Cfile__type__properties__initialize_node, init:Tfile__type__properties__initialize_node}|
		{ name: 'group', node:Cgroup__type__properties__initialize_node, init:Tgroup__type__properties__initialize_node}|
		{ name: 'number', node:Cnumber__type__properties__initialize_node, init:Tnumber__type__properties__initialize_node}|
		{ name: 'state group', node:Cstate_group__type__properties__initialize_node, init:Tstate_group__type__properties__initialize_node}|
		{ name: 'text', node:Ctext__type__properties__initialize_node, init:Ttext__type__properties__initialize_node}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'collection': return (init:Tcollection__type__properties__initialize_node, parent:Cproperties__initialize_node) => new Ccollection__type__properties__initialize_node(init, parent);
				case 'file': return (init:Tfile__type__properties__initialize_node, parent:Cproperties__initialize_node) => new Cfile__type__properties__initialize_node(init, parent);
				case 'group': return (init:Tgroup__type__properties__initialize_node, parent:Cproperties__initialize_node) => new Cgroup__type__properties__initialize_node(init, parent);
				case 'number': return (init:Tnumber__type__properties__initialize_node, parent:Cproperties__initialize_node) => new Cnumber__type__properties__initialize_node(init, parent);
				case 'state group': return (init:Tstate_group__type__properties__initialize_node, parent:Cproperties__initialize_node) => new Cstate_group__type__properties__initialize_node(init, parent);
				case 'text': return (init:Ttext__type__properties__initialize_node, parent:Cproperties__initialize_node) => new Ctext__type__properties__initialize_node(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'collection': return finalize_collection__type__properties__initialize_node;
				case 'file': return finalize_file__type__properties__initialize_node;
				case 'group': return finalize_group__type__properties__initialize_node;
				case 'number': return finalize_number__type__properties__initialize_node;
				case 'state group': return finalize_state_group__type__properties__initialize_node;
				case 'text': return finalize_text__type__properties__initialize_node;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tproperties__initialize_node['type'], parent:Cproperties__initialize_node) {
			super(data, parent);
		}
		public get path() { return `<unknown>/type`; }
	}
}
export namespace Ccollection__type__properties__initialize_node {
	export class Dentries extends AlanSet<{ node:Centries__collection__type__properties__initialize_node, init:Tentries__collection__type__properties__initialize_node},Ccollection__type__properties__initialize_node> {
		protected initialize(parent:Ccollection__type__properties__initialize_node, entry_init:Tentries__collection__type__properties__initialize_node) { return new Centries__collection__type__properties__initialize_node(entry_init, parent); }
		protected resolve = finalize_entries__collection__type__properties__initialize_node
		public get path() { return `${this.parent.path}/entries`; }
		constructor(data:Tcollection__type__properties__initialize_node['entries'], parent:Ccollection__type__properties__initialize_node) {
			super(data, parent);
		}
	}
}
export namespace Centries__collection__type__properties__initialize_node {
	export class Dnode extends Cinitialize_node {
		constructor(data:Tentries__collection__type__properties__initialize_node['node'], parent:Centries__collection__type__properties__initialize_node) {
			super(data, parent, {
				context_node: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.parent)
					.then(context => context?.inferences.collection())
					.then(context => context?.properties.node).result!)
			})
		}
	}
}
export namespace Cfile__type__properties__initialize_node {
}
export namespace Cgroup__type__properties__initialize_node {
	export class Dnode extends Cinitialize_node {
		constructor(data:Tgroup__type__properties__initialize_node['node'], parent:Cgroup__type__properties__initialize_node) {
			super(data, parent, {
				context_node: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.inferences.group())
					.then(context => context?.properties.node).result!)
			})
		}
	}
}
export namespace Cnumber__type__properties__initialize_node {
	export class Dtype<T extends
		{ name: 'integer', node:Cinteger__type__number__type__properties__initialize_node, init:Tinteger__type__number__type__properties__initialize_node}|
		{ name: 'natural', node:Cnatural__type__number__type__properties__initialize_node, init:Tnatural__type__number__type__properties__initialize_node}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'integer': return (init:Tinteger__type__number__type__properties__initialize_node, parent:Cnumber__type__properties__initialize_node) => new Cinteger__type__number__type__properties__initialize_node(init, parent);
				case 'natural': return (init:Tnatural__type__number__type__properties__initialize_node, parent:Cnumber__type__properties__initialize_node) => new Cnatural__type__number__type__properties__initialize_node(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'integer': return finalize_integer__type__number__type__properties__initialize_node;
				case 'natural': return finalize_natural__type__number__type__properties__initialize_node;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tnumber__type__properties__initialize_node['type'], parent:Cnumber__type__properties__initialize_node) {
			super(data, parent);
		}
		public get path() { return `<unknown>/type`; }
	}
}
export namespace Cinteger__type__number__type__properties__initialize_node {
	export class Dvalue extends AlanInteger {
		constructor(data:Tinteger__type__number__type__properties__initialize_node['value'], parent:Cinteger__type__number__type__properties__initialize_node) {
			super(data);}
		public get path() { return `<unknown>/value`; }
	}
}
export namespace Cnatural__type__number__type__properties__initialize_node {
	export class Dvalue extends AlanInteger {
		constructor(data:Tnatural__type__number__type__properties__initialize_node['value'], parent:Cnatural__type__number__type__properties__initialize_node) {
			number__is_positive(data);
			super(data);}
		public get path() { return `<unknown>/value`; }
	}
}
export namespace Cstate_group__type__properties__initialize_node {
	export class Dnode extends Cinitialize_node {
		constructor(data:Tstate_group__type__properties__initialize_node['node'], parent:Cstate_group__type__properties__initialize_node) {
			super(data, parent, {
				context_node: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => depend(detach, context?.properties.state)?.ref)
					.then(context => context?.properties.node).result!)
			})
		}
	}
	export class Dstate extends Reference<interface_.Cstates,string> {

		constructor(data:string, $this:Cstate_group__type__properties__initialize_node) {
			super(data, cache((detach:boolean) => resolve($this)
				.then(() => $this)
				.then(context => context?.inferences.state_group())
				.then(context => {
					const entry = context?.properties.states.get(this.entry)!;
					return resolve(entry).result;
				}).result!))
		}
		public get path() { return `<unknown>/state`; }
	}
}
export namespace Ctext__type__properties__initialize_node {
}
export namespace Cupdate_node {
	export class Dproperties extends AlanDictionary<{ node:Cproperties__update_node, init:Tproperties__update_node},Cupdate_node> {
		protected initialize(parent:Cupdate_node, key:string, entry_init:Tproperties__update_node) { return new Cproperties__update_node(key, entry_init, parent); }
		protected resolve = finalize_properties__update_node
		public get path() { return `${this.parent.path}/properties`; }
		constructor(data:Tupdate_node['properties'], parent:Cupdate_node) {
			super(data, parent);
		}
	}
}
export namespace Cproperties__update_node {
	export class Dtype<T extends
		{ name: 'collection', node:Ccollection__type__properties__update_node, init:Tcollection__type__properties__update_node}|
		{ name: 'file', node:Cfile__type__properties__update_node, init:Tfile__type__properties__update_node}|
		{ name: 'group', node:Cgroup__type__properties__update_node, init:Tgroup__type__properties__update_node}|
		{ name: 'number', node:Cnumber__type__properties__update_node, init:Tnumber__type__properties__update_node}|
		{ name: 'state group', node:Cstate_group__type__properties__update_node, init:Tstate_group__type__properties__update_node}|
		{ name: 'text', node:Ctext__type__properties__update_node, init:Ttext__type__properties__update_node}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'collection': return (init:Tcollection__type__properties__update_node, parent:Cproperties__update_node) => new Ccollection__type__properties__update_node(init, parent);
				case 'file': return (init:Tfile__type__properties__update_node, parent:Cproperties__update_node) => new Cfile__type__properties__update_node(init, parent);
				case 'group': return (init:Tgroup__type__properties__update_node, parent:Cproperties__update_node) => new Cgroup__type__properties__update_node(init, parent);
				case 'number': return (init:Tnumber__type__properties__update_node, parent:Cproperties__update_node) => new Cnumber__type__properties__update_node(init, parent);
				case 'state group': return (init:Tstate_group__type__properties__update_node, parent:Cproperties__update_node) => new Cstate_group__type__properties__update_node(init, parent);
				case 'text': return (init:Ttext__type__properties__update_node, parent:Cproperties__update_node) => new Ctext__type__properties__update_node(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'collection': return finalize_collection__type__properties__update_node;
				case 'file': return finalize_file__type__properties__update_node;
				case 'group': return finalize_group__type__properties__update_node;
				case 'number': return finalize_number__type__properties__update_node;
				case 'state group': return finalize_state_group__type__properties__update_node;
				case 'text': return finalize_text__type__properties__update_node;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tproperties__update_node['type'], parent:Cproperties__update_node) {
			super(data, parent);
		}
		public get path() { return `<unknown>/type`; }
	}
}
export namespace Ccollection__type__properties__update_node {
	export class Dentries extends AlanSet<{ node:Centries__collection__type__properties__update_node, init:Tentries__collection__type__properties__update_node},Ccollection__type__properties__update_node> {
		protected initialize(parent:Ccollection__type__properties__update_node, entry_init:Tentries__collection__type__properties__update_node) { return new Centries__collection__type__properties__update_node(entry_init, parent); }
		protected resolve = finalize_entries__collection__type__properties__update_node
		public get path() { return `${this.parent.path}/entries`; }
		constructor(data:Tcollection__type__properties__update_node['entries'], parent:Ccollection__type__properties__update_node) {
			super(data, parent);
		}
	}
}
export namespace Centries__collection__type__properties__update_node {
	export class Dtype<T extends
		{ name: 'create', node:Ccreate__type__entries, init:Tcreate__type__entries}|
		{ name: 'remove', node:Cremove__type__entries, init:Tremove__type__entries}|
		{ name: 'update', node:Cupdate__type__entries, init:Tupdate__type__entries}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'create': return (init:Tcreate__type__entries, parent:Centries__collection__type__properties__update_node) => new Ccreate__type__entries(init, parent);
				case 'remove': return (init:Tremove__type__entries, parent:Centries__collection__type__properties__update_node) => new Cremove__type__entries(init, parent);
				case 'update': return (init:Tupdate__type__entries, parent:Centries__collection__type__properties__update_node) => new Cupdate__type__entries(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'create': return finalize_create__type__entries;
				case 'remove': return finalize_remove__type__entries;
				case 'update': return finalize_update__type__entries;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tentries__collection__type__properties__update_node['type'], parent:Centries__collection__type__properties__update_node) {
			super(data, parent);
		}
		public get path() { return `<unknown>/type`; }
	}
}
export namespace Ccreate__type__entries {
	export class Dnode extends Cinitialize_node {
		constructor(data:Tcreate__type__entries['node'], parent:Ccreate__type__entries) {
			super(data, parent, {
				context_node: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.parent)
					.then(context => context?.parent)
					.then(context => context?.inferences.collection())
					.then(context => context?.properties.node).result!)
			})
		}
	}
}
export namespace Cremove__type__entries {
}
export namespace Cupdate__type__entries {
	export class Dupdate_node extends Cupdate_node {
		constructor(data:Tupdate__type__entries['update node'], parent:Cupdate__type__entries) {
			super(data, parent, {
				context_node: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.parent)
					.then(context => context?.parent)
					.then(context => context?.inferences.collection())
					.then(context => context?.properties.node).result!)
			})
		}
	}
}
export namespace Cfile__type__properties__update_node {
}
export namespace Cgroup__type__properties__update_node {
	export class Dupdate_node extends Cupdate_node {
		constructor(data:Tgroup__type__properties__update_node['update node'], parent:Cgroup__type__properties__update_node) {
			super(data, parent, {
				context_node: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.inferences.group())
					.then(context => context?.properties.node).result!)
			})
		}
	}
}
export namespace Cnumber__type__properties__update_node {
	export class Dtype<T extends
		{ name: 'integer', node:Cinteger__type__number__type__properties__update_node, init:Tinteger__type__number__type__properties__update_node}|
		{ name: 'natural', node:Cnatural__type__number__type__properties__update_node, init:Tnatural__type__number__type__properties__update_node}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'integer': return (init:Tinteger__type__number__type__properties__update_node, parent:Cnumber__type__properties__update_node) => new Cinteger__type__number__type__properties__update_node(init, parent);
				case 'natural': return (init:Tnatural__type__number__type__properties__update_node, parent:Cnumber__type__properties__update_node) => new Cnatural__type__number__type__properties__update_node(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'integer': return finalize_integer__type__number__type__properties__update_node;
				case 'natural': return finalize_natural__type__number__type__properties__update_node;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tnumber__type__properties__update_node['type'], parent:Cnumber__type__properties__update_node) {
			super(data, parent);
		}
		public get path() { return `<unknown>/type`; }
	}
}
export namespace Cinteger__type__number__type__properties__update_node {
	export class Dnew_value extends AlanInteger {
		constructor(data:Tinteger__type__number__type__properties__update_node['new value'], parent:Cinteger__type__number__type__properties__update_node) {
			super(data);}
		public get path() { return `<unknown>/new value`; }
	}
}
export namespace Cnatural__type__number__type__properties__update_node {
	export class Dnew_value extends AlanInteger {
		constructor(data:Tnatural__type__number__type__properties__update_node['new value'], parent:Cnatural__type__number__type__properties__update_node) {
			number__is_positive(data);
			super(data);}
		public get path() { return `<unknown>/new value`; }
	}
}
export namespace Cstate_group__type__properties__update_node {
	export class Dstate extends Reference<interface_.Cstates,string> {

		constructor(data:string, $this:Cstate_group__type__properties__update_node) {
			super(data, cache((detach:boolean) => resolve($this)
				.then(() => $this)
				.then(context => context?.inferences.state_group())
				.then(context => {
					const entry = context?.properties.states.get(this.entry)!;
					return resolve(entry).result;
				}).result!))
		}
		public get path() { return `<unknown>/state`; }
	}
	export class Dtype<T extends
		{ name: 'set', node:Cset, init:Tset}|
		{ name: 'update', node:Cupdate__type__state_group, init:Tupdate__type__state_group}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'set': return (init:Tset, parent:Cstate_group__type__properties__update_node) => new Cset(init, parent);
				case 'update': return (init:Tupdate__type__state_group, parent:Cstate_group__type__properties__update_node) => new Cupdate__type__state_group(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'set': return finalize_set;
				case 'update': return finalize_update__type__state_group;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tstate_group__type__properties__update_node['type'], parent:Cstate_group__type__properties__update_node) {
			super(data, parent);
		}
		public get path() { return `<unknown>/type`; }
	}
}
export namespace Cset {
	export class Dnode extends Cinitialize_node {
		constructor(data:Tset['node'], parent:Cset) {
			super(data, parent, {
				context_node: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.parent)
					.then(context => depend(detach, context?.properties.state)?.ref)
					.then(context => context?.properties.node).result!)
			})
		}
	}
}
export namespace Cupdate__type__state_group {
	export class Dupdate_node extends Cupdate_node {
		constructor(data:Tupdate__type__state_group['update node'], parent:Cupdate__type__state_group) {
			super(data, parent, {
				context_node: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.parent)
					.then(context => depend(detach, context?.properties.state)?.ref)
					.then(context => context?.properties.node).result!)
			})
		}
	}
}
export namespace Ctext__type__properties__update_node {
}
export namespace Cinterface_notification {
	export class Dtype<T extends
		{ name: 'create', node:Ccreate__type__interface_notification, init:Tcreate__type__interface_notification}|
		{ name: 'remove', node:Cremove__type__interface_notification, init:Tremove__type__interface_notification}|
		{ name: 'update', node:Cupdate__type__interface_notification, init:Tupdate__type__interface_notification}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'create': return (init:Tcreate__type__interface_notification, parent:Cinterface_notification) => new Ccreate__type__interface_notification(init, parent);
				case 'remove': return (init:Tremove__type__interface_notification, parent:Cinterface_notification) => new Cremove__type__interface_notification(init, parent);
				case 'update': return (init:Tupdate__type__interface_notification, parent:Cinterface_notification) => new Cupdate__type__interface_notification(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'create': return finalize_create__type__interface_notification;
				case 'remove': return finalize_remove__type__interface_notification;
				case 'update': return finalize_update__type__interface_notification;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tinterface_notification['type'], parent:Cinterface_notification) {
			super(data, parent);
		}
		public get path() { return `<unknown>/type`; }
	}
}
export namespace Ccreate__type__interface_notification {
	export class Dinitialize_node extends Cinitialize_node {
		constructor(data:Tcreate__type__interface_notification['initialize node'], parent:Ccreate__type__interface_notification) {
			super(data, parent, {
				context_node: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.root.input.interface)
					.then(context => context?.properties.root).result!)
			})
		}
	}
}
export namespace Cupdate__type__interface_notification {
	export class Dupdate_node extends Cupdate_node {
		constructor(data:Tupdate__type__interface_notification['update node'], parent:Cupdate__type__interface_notification) {
			super(data, parent, {
				context_node: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.root.input.interface)
					.then(context => context?.properties.root).result!)
			})
		}
	}
}
/* de(resolution) */
function auto_defer_validator<T extends (...args:any) => void>(root:Cinterface_notification, callback:T):T {
	return callback;
}
function finalize_entries__collection__type__properties__initialize_node(obj:Centries__collection__type__properties__initialize_node, detach:boolean = false) {
	finalize_initialize_node(obj.properties.node, detach);
}
function finalize_collection__type__properties__initialize_node(obj:Ccollection__type__properties__initialize_node, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Ccollection>obj.inferences.collection)(detach) !== undefined || detach);
	for (const entry of obj.properties.entries) {
		finalize_entries__collection__type__properties__initialize_node(entry, detach);
	}
	if (!detach) {
	}
}
function finalize_file__type__properties__initialize_node(obj:Cfile__type__properties__initialize_node, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cfile>obj.inferences.file)(detach) !== undefined || detach);
}
function finalize_group__type__properties__initialize_node(obj:Cgroup__type__properties__initialize_node, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cgroup__type__property>obj.inferences.group)(detach) !== undefined || detach);
	finalize_initialize_node(obj.properties.node, detach);
}
function finalize_integer__type__number__type__properties__initialize_node(obj:Cinteger__type__number__type__properties__initialize_node, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cinteger__set>obj.inferences.integer_type)(detach) !== undefined || detach);
}
function finalize_natural__type__number__type__properties__initialize_node(obj:Cnatural__type__number__type__properties__initialize_node, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnatural__set>obj.inferences.natural_type)(detach) !== undefined || detach);
}
function finalize_number__type__properties__initialize_node(obj:Cnumber__type__properties__initialize_node, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnumber>obj.inferences.number)(detach) !== undefined || detach);
	switch (obj.properties.type.state.name) {
		case 'integer': finalize_integer__type__number__type__properties__initialize_node(obj.properties.type.state.node, detach); break;
		case 'natural': finalize_natural__type__number__type__properties__initialize_node(obj.properties.type.state.node, detach); break;
	}
}
function finalize_state_group__type__properties__initialize_node(obj:Cstate_group__type__properties__initialize_node, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cstate_group>obj.inferences.state_group)(detach) !== undefined || detach);
	finalize_initialize_node(obj.properties.node, detach);
	assert((<(detach?:boolean) => interface_.Cstates>(obj.properties.state as any).resolve)(detach) !== undefined || detach);
}
function finalize_text__type__properties__initialize_node(obj:Ctext__type__properties__initialize_node, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Ctext>obj.inferences.text)(detach) !== undefined || detach);
}
function finalize_properties__initialize_node(obj:Cproperties__initialize_node, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cproperty>(obj.key as any).resolve)(detach) !== undefined || detach);
	switch (obj.properties.type.state.name) {
		case 'collection': finalize_collection__type__properties__initialize_node(obj.properties.type.state.node, detach); break;
		case 'file': finalize_file__type__properties__initialize_node(obj.properties.type.state.node, detach); break;
		case 'group': finalize_group__type__properties__initialize_node(obj.properties.type.state.node, detach); break;
		case 'number': finalize_number__type__properties__initialize_node(obj.properties.type.state.node, detach); break;
		case 'state group': finalize_state_group__type__properties__initialize_node(obj.properties.type.state.node, detach); break;
		case 'text': finalize_text__type__properties__initialize_node(obj.properties.type.state.node, detach); break;
	}
}
function finalize_initialize_node(obj:Cinitialize_node, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnode>obj.input.context_node)(detach) !== undefined || detach);
	for (const [_key, entry] of obj.properties.properties) {
		finalize_properties__initialize_node(entry, detach);
	}
	if (!detach) {
		(obj.properties.properties as any).eval_required_keys(detach);
	}
}
function finalize_create__type__entries(obj:Ccreate__type__entries, detach:boolean = false) {
	finalize_initialize_node(obj.properties.node, detach);
}
function finalize_remove__type__entries(obj:Cremove__type__entries, detach:boolean = false) {
}
function finalize_update__type__entries(obj:Cupdate__type__entries, detach:boolean = false) {
	finalize_update_node(obj.properties.update_node, detach);
}
function finalize_entries__collection__type__properties__update_node(obj:Centries__collection__type__properties__update_node, detach:boolean = false) {
	switch (obj.properties.type.state.name) {
		case 'create': finalize_create__type__entries(obj.properties.type.state.node, detach); break;
		case 'remove': finalize_remove__type__entries(obj.properties.type.state.node, detach); break;
		case 'update': finalize_update__type__entries(obj.properties.type.state.node, detach); break;
	}
}
function finalize_collection__type__properties__update_node(obj:Ccollection__type__properties__update_node, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Ccollection>obj.inferences.collection)(detach) !== undefined || detach);
	for (const entry of obj.properties.entries) {
		finalize_entries__collection__type__properties__update_node(entry, detach);
	}
	if (!detach) {
	}
}
function finalize_file__type__properties__update_node(obj:Cfile__type__properties__update_node, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cfile>obj.inferences.file)(detach) !== undefined || detach);
}
function finalize_group__type__properties__update_node(obj:Cgroup__type__properties__update_node, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cgroup__type__property>obj.inferences.group)(detach) !== undefined || detach);
	finalize_update_node(obj.properties.update_node, detach);
}
function finalize_integer__type__number__type__properties__update_node(obj:Cinteger__type__number__type__properties__update_node, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cinteger__set>obj.inferences.integer_type)(detach) !== undefined || detach);
}
function finalize_natural__type__number__type__properties__update_node(obj:Cnatural__type__number__type__properties__update_node, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnatural__set>obj.inferences.natural_type)(detach) !== undefined || detach);
}
function finalize_number__type__properties__update_node(obj:Cnumber__type__properties__update_node, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnumber>obj.inferences.number)(detach) !== undefined || detach);
	switch (obj.properties.type.state.name) {
		case 'integer': finalize_integer__type__number__type__properties__update_node(obj.properties.type.state.node, detach); break;
		case 'natural': finalize_natural__type__number__type__properties__update_node(obj.properties.type.state.node, detach); break;
	}
}
function finalize_set(obj:Cset, detach:boolean = false) {
	finalize_initialize_node(obj.properties.node, detach);
}
function finalize_update__type__state_group(obj:Cupdate__type__state_group, detach:boolean = false) {
	finalize_update_node(obj.properties.update_node, detach);
}
function finalize_state_group__type__properties__update_node(obj:Cstate_group__type__properties__update_node, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cstate_group>obj.inferences.state_group)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cstates>(obj.properties.state as any).resolve)(detach) !== undefined || detach);
	switch (obj.properties.type.state.name) {
		case 'set': finalize_set(obj.properties.type.state.node, detach); break;
		case 'update': finalize_update__type__state_group(obj.properties.type.state.node, detach); break;
	}
}
function finalize_text__type__properties__update_node(obj:Ctext__type__properties__update_node, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Ctext>obj.inferences.text)(detach) !== undefined || detach);
}
function finalize_properties__update_node(obj:Cproperties__update_node, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cproperty>(obj.key as any).resolve)(detach) !== undefined || detach);
	switch (obj.properties.type.state.name) {
		case 'collection': finalize_collection__type__properties__update_node(obj.properties.type.state.node, detach); break;
		case 'file': finalize_file__type__properties__update_node(obj.properties.type.state.node, detach); break;
		case 'group': finalize_group__type__properties__update_node(obj.properties.type.state.node, detach); break;
		case 'number': finalize_number__type__properties__update_node(obj.properties.type.state.node, detach); break;
		case 'state group': finalize_state_group__type__properties__update_node(obj.properties.type.state.node, detach); break;
		case 'text': finalize_text__type__properties__update_node(obj.properties.type.state.node, detach); break;
	}
}
function finalize_update_node(obj:Cupdate_node, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnode>obj.input.context_node)(detach) !== undefined || detach);
	for (const [_key, entry] of obj.properties.properties) {
		finalize_properties__update_node(entry, detach);
	}
	if (!detach) {
	}
}
function finalize_create__type__interface_notification(obj:Ccreate__type__interface_notification, detach:boolean = false) {
	finalize_initialize_node(obj.properties.initialize_node, detach);
}
function finalize_remove__type__interface_notification(obj:Cremove__type__interface_notification, detach:boolean = false) {
}
function finalize_update__type__interface_notification(obj:Cupdate__type__interface_notification, detach:boolean = false) {
	finalize_update_node(obj.properties.update_node, detach);
}
function finalize_interface_notification(obj:Cinterface_notification, detach:boolean = false) {
	switch (obj.properties.type.state.name) {
		case 'create': finalize_create__type__interface_notification(obj.properties.type.state.node, detach); break;
		case 'remove': finalize_remove__type__interface_notification(obj.properties.type.state.node, detach); break;
		case 'update': finalize_update__type__interface_notification(obj.properties.type.state.node, detach); break;
	}
}

export namespace Cinterface_notification {
	export function create(init:Tinterface_notification, input: {
		'interface':interface_.Cinterface
	}):Cinterface_notification {
		const instance = new Cinterface_notification(init, input as any);
		finalize_interface_notification(instance);
		;
		return instance;
	};
}
