import * as interface_command from './alan_api';
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
export type dictionary_type<T> = {[key:string]:T};


enum ResolutionStatus {
	Resolved,
	Resolving,
	Unresolved,
	Detached,
}
function cache<T extends AlanObject>(callback:(detach:boolean) => T) {
	let cached_value:T;
	let status:ResolutionStatus = ResolutionStatus.Unresolved;
	return (detach = false) => {
		switch (status) {
			case ResolutionStatus.Resolving:
				throw new Error(`Cyclic dependency detected!`);
			case ResolutionStatus.Detached: {
				if (detach) break;
				(cached_value as any) = undefined;
				status = ResolutionStatus.Resolving;
				cached_value = callback(detach);
				status = ResolutionStatus.Resolved;
			} break;
			case ResolutionStatus.Resolved: {
				if (!detach) break;
				callback(detach);
				status = ResolutionStatus.Detached;
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
			case ResolutionStatus.Detached: {
				if (detach) break;
				cached_value = undefined;
				status = ResolutionStatus.Resolving;
				cached_value = callback(detach);
				status = ResolutionStatus.Resolved;
			} break;
			case ResolutionStatus.Resolved: {
				if (!detach) break;
				callback(detach);
				status = ResolutionStatus.Detached;
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

	protected load_entry(key:string, entry:((parent:P) => T['node'])|T['node']):T['node'] {
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
	protected abstract finalize(obj:T['node'],detach?:boolean):void;

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
	protected abstract finalize(obj:T['node'],detach?:boolean):void;

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
	protected abstract finalizer(state:T['name']): ($:T['node'], detach?:boolean) => void;

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
	protected _root:Cinterface_command|undefined;
	public abstract get root():Cinterface_command;
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
		for (let entry of this.topo_entries(graph)) { walk_function(entry); }
	}
	topo_entries(graph:G):IterableIterator<T['node']> {
		return this._graphs[graph][Symbol.iterator]();
	}
	topo_toArray(graph:G):T['node'][] {
		return Array.from(this.topo_entries(graph));
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
			if (prev._edges[g].size === 0) { return curr; }
			let connected = false;
			prev._edges[g].forEach(e => { connected = (connected || e.ref.entity === curr) });
			if (!connected)
				throw new Error(`Totally ordered graph constraint violation.`);
			return curr;
		});
	}
}

/* alan objects */
export type Tnode__interface_command = {
	'properties':Record<string, Tproperties>;
};
export class Cnode__interface_command extends AlanNode {
	public readonly properties:{
		readonly properties:Cnode__interface_command.Dproperties
	};
	constructor(init:Tnode__interface_command, public location:AlanNode, public input: {
		node_type: () => interface_.Cnode
	}) {
		super();
		const $this = this;
		this.properties = {
			properties: new Cnode__interface_command.Dproperties(init['properties'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.location.root); }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/node`; }
	public get entity() { return this.location.entity; }
}
export class Kproperties extends Reference<interface_.Cproperty, string> {
	constructor(key:string, $this:Cproperties) {
		super(key, cache((detach:boolean) => resolve($this.parent)
			.then(() => $this.parent)
			.then(context => context?.component_root.input.node_type())
			.then(context => {
				const entry = context?.properties.attributes.get(this.entry)!;
				return resolve(entry)
				.then(context => {
					if (context?.properties.type.state.name === 'property') {
						return context.properties.type.state.node as interface_.Cproperty;
					} else {
						return undefined;
					}
				}).result;
			}).result!))
	}
	public get path() { return `<unknown>/properties/key`; }
}
export type Tproperties = {
	'type':['collection', Tcollection__type]|['file', Tfile]|['group', Tgroup]|['number', Tnumber]|['state group', Tstate_group]|['text', Ttext];
};
export class Cproperties extends AlanDictionaryEntry {
	public key:Kproperties;
	public get key_value() { return this.key.entry; }
	public readonly properties:{
		readonly type:Cproperties.Dtype<
			{ name: 'collection', node:Ccollection__type, init:Tcollection__type}|
			{ name: 'file', node:Cfile, init:Tfile}|
			{ name: 'group', node:Cgroup, init:Tgroup}|
			{ name: 'number', node:Cnumber, init:Tnumber}|
			{ name: 'state group', node:Cstate_group, init:Tstate_group}|
			{ name: 'text', node:Ctext, init:Ttext}>
	};
	constructor(key:string, init:Tproperties, public parent:Cnode__interface_command) {
		super();
		const $this = this;
		this.key = new Kproperties(key, $this);
		this.properties = {
			type: new Cproperties.Dtype(init['type'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/properties[${this.key.entry}]`; }
	public get entity() { return this; }
}
export type Tcollection__type = {
	'entries':Tentries[];
};
export class Ccollection__type extends AlanNode {
	public readonly properties:{
		readonly entries:Ccollection__type.Dentries
	};
	public readonly inferences:{
		collection: () => interface_.Ccollection
	} = {
		collection: cache((detach:boolean) => {
			const interface_command__node__properties__type__collection_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.key?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'collection') {
						return resolve(context.properties.type.state.node as interface_.Ccollection).result;
					} else {
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tcollection__type, public parent:Cproperties) {
		super();
		const $this = this;
		this.properties = {
			entries: new Ccollection__type.Dentries(init['entries'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?collection`; }
	public get entity() { return this.parent.entity; }
}
export type Tentries = {
	'node':Tnode__interface_command;
};
export class Centries extends AlanNode {
	public readonly properties:{
		readonly node:Cnode__interface_command
	};
	constructor(init:Tentries, public parent:Ccollection__type) {
		super();
		const $this = this;
		this.properties = {
			node: new Centries.Dnode(init['node'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/entries`; }
	public get entity() { return this; }
}
export type Tfile = {
	'extension':string;
	'token':string;
};
export class Cfile extends AlanNode {
	public readonly properties:{
		readonly extension:string,
		readonly token:string
	};
	public readonly inferences:{
		file: () => interface_.Cfile
	} = {
		file: cache((detach:boolean) => {
			const interface_command__node__properties__type__file_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.key?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'file') {
						return resolve(context.properties.type.state.node as interface_.Cfile).result;
					} else {
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tfile, public parent:Cproperties) {
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
export type Tgroup = {
	'node':Tnode__interface_command;
};
export class Cgroup extends AlanNode {
	public readonly properties:{
		readonly node:Cnode__interface_command
	};
	public readonly inferences:{
		group: () => interface_.Cgroup__type__property
	} = {
		group: cache((detach:boolean) => {
			const interface_command__node__properties__type__group_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.key?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'group') {
						return resolve(context.properties.type.state.node as interface_.Cgroup__type__property).result;
					} else {
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tgroup, public parent:Cproperties) {
		super();
		const $this = this;
		this.properties = {
			node: new Cgroup.Dnode(init['node'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?group`; }
	public get entity() { return this.parent.entity; }
}
export type Tnumber = {
	'value':number;
};
export class Cnumber extends AlanNode {
	public readonly properties:{
		readonly value:Cnumber.Dvalue
	};
	public readonly inferences:{
		number: () => interface_.Cnumber
	} = {
		number: cache((detach:boolean) => {
			const interface_command__node__properties__type__number_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.key?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'number') {
						return resolve(context.properties.type.state.node as interface_.Cnumber).result;
					} else {
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tnumber, public parent:Cproperties) {
		super();
		const $this = this;
		this.properties = {
			value: new Cnumber.Dvalue(init['value'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?number`; }
	public get entity() { return this.parent.entity; }
}
export type Tstate_group = {
	'node':Tnode__interface_command;
	'state':string;
};
export class Cstate_group extends AlanNode {
	public readonly properties:{
		readonly node:Cnode__interface_command,
		readonly state:Cstate_group.Dstate
	};
	public readonly inferences:{
		state_group: () => interface_.Cstate_group
	} = {
		state_group: cache((detach:boolean) => {
			const interface_command__node__properties__type__state_group_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.key?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'state group') {
						return resolve(context.properties.type.state.node as interface_.Cstate_group).result;
					} else {
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tstate_group, public parent:Cproperties) {
		super();
		const $this = this;
		this.properties = {
			node: new Cstate_group.Dnode(init['node'], $this),
			state: new Cstate_group.Dstate(init['state'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?state group`; }
	public get entity() { return this.parent.entity; }
}
export type Ttext = {
	'value':string;
};
export class Ctext extends AlanNode {
	public readonly properties:{
		readonly value:string
	};
	public readonly inferences:{
		text: () => interface_.Ctext
	} = {
		text: cache((detach:boolean) => {
			const interface_command__node__properties__type__text_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.key?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'text') {
						return resolve(context.properties.type.state.node as interface_.Ctext).result;
					} else {
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Ttext, public parent:Cproperties) {
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
export type Tid_path = {
	'has steps':'no'|['no', {}]|['yes', Tyes];
};
export class Cid_path extends AlanNode {
	public readonly properties:{
		readonly has_steps:Cid_path.Dhas_steps<
			{ name: 'no', node:Cno, init:Tno}|
			{ name: 'yes', node:Cyes, init:Tyes}>
	};
	public readonly output:{
		node_type: () => interface_.Cnode;
	} = {
		node_type: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.has_steps?.state.node.output.node_type()).result!)
	};
	constructor(init:Tid_path, public location:AlanNode, public input: {
		node_type: () => interface_.Cnode
	}) {
		super();
		const $this = this;
		this.properties = {
			has_steps: new Cid_path.Dhas_steps(init['has steps'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.location.root); }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/id path`; }
	public get entity() { return this.location.entity; }
}
export type Tno = {
};
export class Cno extends AlanNode {
	public readonly output:{
		node_type: () => interface_.Cnode;
	} = {
		node_type: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.component_root.input.node_type()).result!)
	}
	constructor(init:Tno, public parent:Cid_path) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has steps?no`; }
	public get entity() { return this.parent.entity; }
}
export type Tyes = {
	'property':string;
	'tail':Tid_path;
	'value':['choice', Tchoice]|['collection', Tcollection__value]|'node'|['node', {}];
};
export class Cyes extends AlanNode {
	public readonly properties:{
		readonly property:Cyes.Dproperty,
		readonly tail:Cid_path,
		readonly value:Cyes.Dvalue<
			{ name: 'choice', node:Cchoice, init:Tchoice}|
			{ name: 'collection', node:Ccollection__value, init:Tcollection__value}|
			{ name: 'node', node:Cnode__value, init:Tnode__value}>
	};
	public readonly output:{
		node_type: () => interface_.Cnode;
	} = {
		node_type: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.tail)
			.then(context => context?.component_root.output.node_type()).result!)
	}
	constructor(init:Tyes, public parent:Cid_path) {
		super();
		const $this = this;
		this.properties = {
			property: new Cyes.Dproperty(init['property'], $this),
			tail: new Cyes.Dtail(init['tail'], $this),
			value: new Cyes.Dvalue(init['value'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has steps?yes`; }
	public get entity() { return this.parent.entity; }
}
export type Tchoice = {
	'state':string;
};
export class Cchoice extends AlanNode {
	public readonly properties:{
		readonly state:Cchoice.Dstate
	};
	public readonly output:{
		node_type: () => interface_.Cnode;
	} = {
		node_type: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.properties.state?.ref)
			.then(context => context?.properties.node).result!)
	}
	public readonly inferences:{
		state_group: () => interface_.Cstate_group
	} = {
		state_group: cache((detach:boolean) => {
			const interface_command__id_path__has_steps__yes__value__choice_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.properties.property?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'state group') {
						return resolve(context.properties.type.state.node as interface_.Cstate_group).result;
					} else {
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tchoice, public parent:Cyes) {
		super();
		const $this = this;
		this.properties = {
			state: new Cchoice.Dstate(init['state'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/value?choice`; }
	public get entity() { return this.parent.entity; }
}
export type Tcollection__value = {
	'entry':string;
};
export class Ccollection__value extends AlanNode {
	public readonly properties:{
		readonly entry:string
	};
	public readonly output:{
		node_type: () => interface_.Cnode;
	} = {
		node_type: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.inferences.collection())
			.then(context => context?.properties.node).result!)
	}
	public readonly inferences:{
		collection: () => interface_.Ccollection
	} = {
		collection: cache((detach:boolean) => {
			const interface_command__id_path__has_steps__yes__value__collection_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.properties.property?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'collection') {
						return resolve(context.properties.type.state.node as interface_.Ccollection).result;
					} else {
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tcollection__value, public parent:Cyes) {
		super();
		const $this = this;
		this.properties = {
			entry: init['entry']
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/value?collection`; }
	public get entity() { return this.parent.entity; }
}
export type Tnode__value = {
};
export class Cnode__value extends AlanNode {
	public readonly output:{
		node_type: () => interface_.Cnode;
	} = {
		node_type: cache((detach:boolean) => resolve(this)
			.then(() => this)
			.then(context => context?.inferences.group())
			.then(context => context?.properties.node).result!)
	}
	public readonly inferences:{
		group: () => interface_.Cgroup__type__property
	} = {
		group: cache((detach:boolean) => {
			const interface_command__id_path__has_steps__yes__value__node_nval = this.parent;
			return resolve(this.parent)
				.then(() => this.parent)
				.then(context => context?.properties.property?.ref)
				.then(context => {
					if (context?.properties.type.state.name === 'group') {
						return resolve(context.properties.type.state.node as interface_.Cgroup__type__property).result;
					} else {
						return undefined;
					}
				}).result!;
		})

	}
	constructor(init:Tnode__value, public parent:Cyes) {
		super();
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/value?node`; }
	public get entity() { return this.parent.entity; }
}
export type Tcontext_keys__interface_command = {
	'context keys':Record<string, Tcontext_keys__context_keys>;
};
export class Ccontext_keys__interface_command extends AlanNode {
	public readonly properties:{
		readonly context_keys:Ccontext_keys__interface_command.Dcontext_keys
	};
	constructor(init:Tcontext_keys__interface_command, public location:AlanNode) {
		super();
		const $this = this;
		this.properties = {
			context_keys: new Ccontext_keys__interface_command.Dcontext_keys(init['context keys'], $this)
		};
	}
	public get root() { return this._root ?? (this._root = this.location.root); }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/context keys`; }
	public get entity() { return this.location.entity; }
}
export class Kcontext_keys__context_keys extends Reference<interface_.Ccontext_keys, string> {
	constructor(key:string, $this:Ccontext_keys__context_keys) {
		super(key, cache((detach:boolean) => resolve($this.parent)
			.then(() => $this.parent)
			.then(context => context?.root.input.interface_)
			.then(context => {
				const entry = context?.properties.context_keys.get(this.entry)!;
				return resolve(entry).result;
			}).result!))
	}
	public get path() { return `<unknown>/context keys/key`; }
}
export type Tcontext_keys__context_keys = {
	'value':string;
};
export class Ccontext_keys__context_keys extends AlanDictionaryEntry {
	public key:Kcontext_keys__context_keys;
	public get key_value() { return this.key.entry; }
	public readonly properties:{
		readonly value:string
	};
	constructor(key:string, init:Tcontext_keys__context_keys, public parent:Ccontext_keys__interface_command) {
		super();
		const $this = this;
		this.key = new Kcontext_keys__context_keys(key, $this);
		this.properties = {
			value: init['value']
		};
	}
	public get root() { return this._root ?? (this._root = this.component_root.root); }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/context keys[${this.key.entry}]`; }
	public get entity() { return this; }
}

export type Tinterface_command = {
	'arguments':Tnode__interface_command;
	'command':string;
	'context keys':Tcontext_keys__interface_command;
	'context node':Tid_path;
};
export class Cinterface_command extends AlanNode {
	public key?:string;
	public get root() { return this; }
	public readonly properties:{
		readonly arguments:Cnode__interface_command,
		readonly command:Cinterface_command.Dcommand,
		readonly context_keys:Ccontext_keys__interface_command,
		readonly context_node:Cid_path
	};
	constructor(init:Tinterface_command, public readonly input: {
	'interface_':interface_.Cinterface}) {
		super();
		const $this = this;
		this.properties = {
			arguments: new Cinterface_command.Darguments(init['arguments'], $this),
			command: new Cinterface_command.Dcommand(init['command'], $this),
			context_keys: new Cinterface_command.Dcontext_keys(init['context keys'], $this),
			context_node: new Cinterface_command.Dcontext_node(init['context node'], $this)
		};
	}
	public get path() { return ``; }
	public get entity() { return this; }
}

/* property classes */
export namespace Ccontext_keys__interface_command {
	export class Dcontext_keys extends AlanDictionary<{ node:Ccontext_keys__context_keys, init:Tcontext_keys__context_keys},Ccontext_keys__interface_command> {
		protected initialize(parent:Ccontext_keys__interface_command, key:string, entry_init:Tcontext_keys__context_keys) { return new Ccontext_keys__context_keys(key, entry_init, parent); }
		protected finalize = finalize_context_keys__context_keys
		protected eval_required_keys(detach:boolean = false):void {
			let this_obj = this.parent;
			function do_include(interface_command__context_keys__context_keys_key_nval:interface_.Ccontext_keys):boolean {
				return true;
			};
			resolve(this.parent)
			.then(() => this.parent)
			.then(context => context?.root.input.interface_)
			.then(context => {
				for (let [key,val] of context?.properties.context_keys) {
					let tail_obj = resolve(val).result;
					if (tail_obj !== undefined && do_include(tail_obj)) {
						assert(this.get(key) !== undefined);
					}
				}
				return undefined;
			});
		}
		public get path() { return `${this.parent.path}/context keys`; }
		constructor(data:Tcontext_keys__interface_command['context keys'], parent:Ccontext_keys__interface_command) {
			super(data, parent);
		}
	}
}
export namespace Ccontext_keys__context_keys {
}
export namespace Cid_path {
	export class Dhas_steps<T extends
		{ name: 'no', node:Cno, init:Tno}|
		{ name: 'yes', node:Cyes, init:Tyes}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno, parent:Cid_path) => new Cno(init, parent);
				case 'yes': return (init:Tyes, parent:Cid_path) => new Cyes(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'no': return finalize_no;
				case 'yes': return finalize_yes;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tid_path['has steps'], parent:Cid_path) {
			super(data, parent);
		}
		public get path() { return `<unknown>/has steps`; }
	}
}
export namespace Cyes {
	export class Dproperty extends Reference<interface_.Cproperty,string> {

		constructor(data:string, $this:Cyes) {
			super(data, cache((detach:boolean) => resolve($this)
				.then(() => $this)
				.then(context => context?.component_root.input.node_type())
				.then(context => {
					const entry = context?.properties.attributes.get(this.entry)!;
					return resolve(entry)
					.then(context => {
						if (context?.properties.type.state.name === 'property') {
							return context.properties.type.state.node as interface_.Cproperty;
						} else {
							return undefined;
						}
					}).result;
				}).result!))
		}
		public get path() { return `<unknown>/property`; }
	}
	export class Dtail extends Cid_path {
		constructor(data:Tyes['tail'], parent:Cyes) {
			super(data, parent, {
				node_type: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.properties.value?.state.node.output.node_type()).result!)
			})
		}
	}
	export class Dvalue<T extends
		{ name: 'choice', node:Cchoice, init:Tchoice}|
		{ name: 'collection', node:Ccollection__value, init:Tcollection__value}|
		{ name: 'node', node:Cnode__value, init:Tnode__value}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'choice': return (init:Tchoice, parent:Cyes) => new Cchoice(init, parent);
				case 'collection': return (init:Tcollection__value, parent:Cyes) => new Ccollection__value(init, parent);
				case 'node': return (init:Tnode__value, parent:Cyes) => new Cnode__value(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'choice': return finalize_choice;
				case 'collection': return finalize_collection__value;
				case 'node': return finalize_node__value;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tyes['value'], parent:Cyes) {
			super(data, parent);
		}
		public get path() { return `<unknown>/value`; }
	}
}
export namespace Cchoice {
	export class Dstate extends Reference<interface_.Cstates,string> {

		constructor(data:string, $this:Cchoice) {
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
export namespace Ccollection__value {
}
export namespace Cnode__interface_command {
	export class Dproperties extends AlanDictionary<{ node:Cproperties, init:Tproperties},Cnode__interface_command> {
		protected initialize(parent:Cnode__interface_command, key:string, entry_init:Tproperties) { return new Cproperties(key, entry_init, parent); }
		protected finalize = finalize_properties
		protected eval_required_keys(detach:boolean = false):void {
			let this_obj = this.parent;
			function do_include(interface_command__node__properties_key_nval:interface_.Cproperty):boolean {
				return true;
			};
			resolve(this.parent)
			.then(() => this.parent)
			.then(context => context?.component_root.input.node_type())
			.then(context => {
				for (let [key,val] of context?.properties.attributes) {
					let tail_obj = resolve(val)
					.then(context => {
						if (context?.properties.type.state.name === 'property') {
							return context.properties.type.state.node as interface_.Cproperty;
						} else {
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
		constructor(data:Tnode__interface_command['properties'], parent:Cnode__interface_command) {
			super(data, parent);
		}
	}
}
export namespace Cproperties {
	export class Dtype<T extends
		{ name: 'collection', node:Ccollection__type, init:Tcollection__type}|
		{ name: 'file', node:Cfile, init:Tfile}|
		{ name: 'group', node:Cgroup, init:Tgroup}|
		{ name: 'number', node:Cnumber, init:Tnumber}|
		{ name: 'state group', node:Cstate_group, init:Tstate_group}|
		{ name: 'text', node:Ctext, init:Ttext}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'collection': return (init:Tcollection__type, parent:Cproperties) => new Ccollection__type(init, parent);
				case 'file': return (init:Tfile, parent:Cproperties) => new Cfile(init, parent);
				case 'group': return (init:Tgroup, parent:Cproperties) => new Cgroup(init, parent);
				case 'number': return (init:Tnumber, parent:Cproperties) => new Cnumber(init, parent);
				case 'state group': return (init:Tstate_group, parent:Cproperties) => new Cstate_group(init, parent);
				case 'text': return (init:Ttext, parent:Cproperties) => new Ctext(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected finalizer(state:T['name']) {
			switch (state) {
				case 'collection': return finalize_collection__type;
				case 'file': return finalize_file;
				case 'group': return finalize_group;
				case 'number': return finalize_number;
				case 'state group': return finalize_state_group;
				case 'text': return finalize_text;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tproperties['type'], parent:Cproperties) {
			super(data, parent);
		}
		public get path() { return `<unknown>/type`; }
	}
}
export namespace Ccollection__type {
	export class Dentries extends AlanSet<{ node:Centries, init:Tentries},Ccollection__type> {
		protected initialize(parent:Ccollection__type, entry_init:Tentries) { return new Centries(entry_init, parent); }
		protected finalize = finalize_entries
		public get path() { return `${this.parent.path}/entries`; }
		constructor(data:Tcollection__type['entries'], parent:Ccollection__type) {
			super(data, parent);
		}
	}
}
export namespace Centries {
	export class Dnode extends Cnode__interface_command {
		constructor(data:Tentries['node'], parent:Centries) {
			super(data, parent, {
				node_type: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.parent)
					.then(context => context?.inferences.collection())
					.then(context => context?.properties.node).result!)
			})
		}
	}
}
export namespace Cfile {
}
export namespace Cgroup {
	export class Dnode extends Cnode__interface_command {
		constructor(data:Tgroup['node'], parent:Cgroup) {
			super(data, parent, {
				node_type: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.inferences.group())
					.then(context => context?.properties.node).result!)
			})
		}
	}
}
export namespace Cnumber {
	export class Dvalue extends AlanInteger {
		public readonly inferences:{
			sign: () => interface_.Cyes__number_sign_inclusion
		}
		constructor(data:Tnumber['value'], parent:Cnumber) {
			super(data);this.inferences = {
				sign: cache((detach:boolean) => {
					const interface_command__node__properties__type__number__value_nval = this;
					return resolve(this)
						.then(switch_context => { 
							const value = resolve(switch_context)
								.then(context => interface_command__node__properties__type__number__value_nval).result.value;
							if (value < 0){
								return resolve(switch_context)
									.then(() => parent)
									.then(context => context?.inferences.number())
									.then(context => context?.properties.type)
									.then(context => context?.properties.type?.state.node.output.can_be_negative())
									.then(context => context?.variant.name === 'yes' ? context.variant.definition as interface_.Cyes__number_sign_inclusion : undefined).result;
							}
							else if (value > 0){
								return resolve(switch_context)
									.then(() => parent)
									.then(context => context?.inferences.number())
									.then(context => context?.properties.type)
									.then(context => context?.properties.type?.state.node.output.can_be_positive())
									.then(context => context?.variant.name === 'yes' ? context.variant.definition as interface_.Cyes__number_sign_inclusion : undefined).result;
							}
							else if (value == 0){
								return resolve(switch_context)
									.then(() => parent)
									.then(context => context?.inferences.number())
									.then(context => context?.properties.type)
									.then(context => context?.properties.type?.state.node.output.can_be_zero())
									.then(context => context?.variant.name === 'yes' ? context.variant.definition as interface_.Cyes__number_sign_inclusion : undefined).result;
							}
							else {
								throw new Error(`Missing case handler.`);
							}
						}).result!;
				})

			}
		}
		public get path() { return `<unknown>/value`; }
	}
}
export namespace Cstate_group {
	export class Dnode extends Cnode__interface_command {
		constructor(data:Tstate_group['node'], parent:Cstate_group) {
			super(data, parent, {
				node_type: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.properties.state?.ref)
					.then(context => context?.properties.node).result!)
			})
		}
	}
	export class Dstate extends Reference<interface_.Cstates,string> {

		constructor(data:string, $this:Cstate_group) {
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
export namespace Ctext {
}
export namespace Cinterface_command {
	export class Darguments extends Cnode__interface_command {
		constructor(data:Tinterface_command['arguments'], parent:Cinterface_command) {
			super(data, parent, {
				node_type: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.properties.command?.ref)
					.then(context => context?.properties.parameters).result!)
			})
		}
	}
	export class Dcommand extends Reference<interface_.Ccommand,string> {

		constructor(data:string, $this:Cinterface_command) {
			super(data, cache((detach:boolean) => resolve($this)
				.then(() => $this)
				.then(context => context?.properties.context_node)
				.then(context => context?.component_root.output.node_type())
				.then(context => {
					const entry = context?.properties.attributes.get(this.entry)!;
					return resolve(entry)
					.then(context => {
						if (context?.properties.type.state.name === 'command') {
							return context.properties.type.state.node as interface_.Ccommand;
						} else {
							return undefined;
						}
					}).result;
				}).result!))
		}
		public get path() { return `<unknown>/command`; }
	}
	export class Dcontext_keys extends Ccontext_keys__interface_command {
		constructor(data:Tinterface_command['context keys'], parent:Cinterface_command) {
			super(data, parent)
		}
	}
	export class Dcontext_node extends Cid_path {
		constructor(data:Tinterface_command['context node'], parent:Cinterface_command) {
			super(data, parent, {
				node_type: cache((detach:boolean) => resolve(this)
					.then(() => parent)
					.then(context => context?.root.input.interface_)
					.then(context => context?.properties.root).result!)
			})
		}
	}
}
function finalize_context_keys__context_keys(obj:Ccontext_keys__context_keys, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Ccontext_keys>(obj.key as any).resolve)(detach) !== undefined || detach);
}
function finalize_context_keys__interface_command(obj:Ccontext_keys__interface_command, detach:boolean = false) {
	for (const [_key, entry] of obj.properties.context_keys) {
		finalize_context_keys__context_keys(entry, detach);
	}
	if (!detach) {
		(obj.properties.context_keys as any).eval_required_keys(detach);
	}
}
function finalize_no(obj:Cno, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnode>obj.output.node_type)(detach) !== undefined || detach);
}
function finalize_choice(obj:Cchoice, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cstate_group>obj.inferences.state_group)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cnode>obj.output.node_type)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cstates>(obj.properties.state as any).resolve)(detach) !== undefined || detach);
}
function finalize_collection__value(obj:Ccollection__value, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Ccollection>obj.inferences.collection)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cnode>obj.output.node_type)(detach) !== undefined || detach);
}
function finalize_node__value(obj:Cnode__value, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cgroup__type__property>obj.inferences.group)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cnode>obj.output.node_type)(detach) !== undefined || detach);
}
function finalize_yes(obj:Cyes, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnode>obj.output.node_type)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cproperty>(obj.properties.property as any).resolve)(detach) !== undefined || detach);
	finalize_id_path(obj.properties.tail, detach);
	switch (obj.properties.value.state.name) {
		case 'choice': finalize_choice(obj.properties.value.state.node, detach); break;
		case 'collection': finalize_collection__value(obj.properties.value.state.node, detach); break;
		case 'node': finalize_node__value(obj.properties.value.state.node, detach); break;
	}
}
function finalize_id_path(obj:Cid_path, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnode>obj.input.node_type)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cnode>obj.output.node_type)(detach) !== undefined || detach);
	switch (obj.properties.has_steps.state.name) {
		case 'no': finalize_no(obj.properties.has_steps.state.node, detach); break;
		case 'yes': finalize_yes(obj.properties.has_steps.state.node, detach); break;
	}
}
function finalize_entries(obj:Centries, detach:boolean = false) {
	finalize_node__interface_command(obj.properties.node, detach);
}
function finalize_collection__type(obj:Ccollection__type, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Ccollection>obj.inferences.collection)(detach) !== undefined || detach);
	for (const entry of obj.properties.entries) {
		finalize_entries(entry, detach);
	}
	if (!detach) {
	}
}
function finalize_file(obj:Cfile, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cfile>obj.inferences.file)(detach) !== undefined || detach);
}
function finalize_group(obj:Cgroup, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cgroup__type__property>obj.inferences.group)(detach) !== undefined || detach);
	finalize_node__interface_command(obj.properties.node, detach);
}
function finalize_number(obj:Cnumber, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnumber>obj.inferences.number)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cyes__number_sign_inclusion>obj.properties.value.inferences.sign)(detach) !== undefined || detach);
}
function finalize_state_group(obj:Cstate_group, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cstate_group>obj.inferences.state_group)(detach) !== undefined || detach);
	finalize_node__interface_command(obj.properties.node, detach);
	assert((<(detach?:boolean) => interface_.Cstates>(obj.properties.state as any).resolve)(detach) !== undefined || detach);
}
function finalize_text(obj:Ctext, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Ctext>obj.inferences.text)(detach) !== undefined || detach);
}
function finalize_properties(obj:Cproperties, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cproperty>(obj.key as any).resolve)(detach) !== undefined || detach);
	switch (obj.properties.type.state.name) {
		case 'collection': finalize_collection__type(obj.properties.type.state.node, detach); break;
		case 'file': finalize_file(obj.properties.type.state.node, detach); break;
		case 'group': finalize_group(obj.properties.type.state.node, detach); break;
		case 'number': finalize_number(obj.properties.type.state.node, detach); break;
		case 'state group': finalize_state_group(obj.properties.type.state.node, detach); break;
		case 'text': finalize_text(obj.properties.type.state.node, detach); break;
	}
}
function finalize_node__interface_command(obj:Cnode__interface_command, detach:boolean = false) {
	assert((<(detach?:boolean) => interface_.Cnode>obj.input.node_type)(detach) !== undefined || detach);
	for (const [_key, entry] of obj.properties.properties) {
		finalize_properties(entry, detach);
	}
	if (!detach) {
		(obj.properties.properties as any).eval_required_keys(detach);
	}
}
function finalize_interface_command(obj:Cinterface_command, detach:boolean = false) {
	finalize_node__interface_command(obj.properties.arguments, detach);
	assert((<(detach?:boolean) => interface_.Ccommand>(obj.properties.command as any).resolve)(detach) !== undefined || detach);
	finalize_context_keys__interface_command(obj.properties.context_keys, detach);
	finalize_id_path(obj.properties.context_node, detach);
}

export namespace Cinterface_command {
	export function create(init:Tinterface_command, input: {
	'interface_':interface_.Cinterface}):Cinterface_command {
		const instance = new Cinterface_command(init, input as any);
		finalize_interface_command(instance);
		return instance;
	};
}
