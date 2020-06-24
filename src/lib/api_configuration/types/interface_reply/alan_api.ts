import * as interface_reply from './alan_api';
import * as interface_ from '../interface/alan_api';
import * as interface_request from '../interface_request/alan_api';

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


function cache<T extends AlanObject>(callback:() => T, update_ref_count = false) {
	let cached_value:T;
	let resolving:boolean = false;
	return (detach = false) => {
		if (resolving) {
			throw new Error(`Cyclic dependency detected!`);
		}
		if (detach && update_ref_count && cached_value !== undefined) {
			--cached_value.reference_count;
		} else if (cached_value === undefined) {
			resolving = true;
			cached_value = callback();
			resolving = false;
			if (update_ref_count && cached_value !== undefined) {
				++cached_value.reference_count;
			}
		}
		return cached_value;
	}
}

/* complex value wrappers */
export interface Tree<T> {
	types: {[name:string]:T};
	subtrees: {[name:string]:Tree<T>};
}
export abstract class Reference<T extends AlanObject, V extends (string|string[])> {
	constructor(public readonly entry:V, private readonly resolve:() => T) {}
	public get ref() { return this.resolve(); }
}
export abstract class AlanDictionary<T extends {node: AlanNode & {key:(string|Reference<AlanObject,string>)}, init: any }, P extends AlanNode, GT extends string = never> {
	private _entries:Map<string,((parent:P) => T['node'])|T['node']>;

	private load_entry(key:string, entry:((parent:P) => T['node'])|T['node']):T['node'] {
		if (typeof entry === 'function') {
			const loaded_entry = entry(this.parent);
			this._entries.set(key, loaded_entry);
			return loaded_entry;
		}
		return entry;
	}
	private findFirst(iterator:(entry:T['node']) => T['node']) {
		const $this = this;
		const key_of = (entry:T['node']) => typeof entry.key === 'string' ? entry.key : entry.key.entry;
		let done:Record<string, boolean> = {};
		let first:T['node']|undefined = undefined;
		for (let [k,v] of $this._entries) {
			let current = $this.load_entry(k, v);
			let entry_id:string = k;
			if (!done[entry_id]) {
				first = current;
				while (current && !done[entry_id]) {
					done[entry_id] = true;
					current = iterator(current);
					if (current !== undefined) {
						entry_id = key_of(current);
					}
				}
			}
		}
		return first;
	}
	constructor (
		entries:{[key:string]:T['init']},
		protected parent:P) {

		if (parent.root.lazy_eval) {
			this._entries = new Map(Object.keys(entries).map(entry_key => [entry_key, (parent:P) => this.initialize(parent, entry_key, entries[entry_key])]));
		} else {
			this._entries = new Map(Object.keys(entries).map(entry_key => [entry_key, this.initialize(parent, entry_key, entries[entry_key])]));
		}
	}

	protected abstract graph_iterator(key:string):(entry:T['node']) => T['node'];
	protected abstract initialize(parent:P, key:string, obj:T['init']):T['node'];
	protected abstract resolve(obj:T['node'],detach?:boolean):void;
	protected abstract get path():string;

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
	entries(graph?:GT, first?:T['node']):IterableIterator<[string,T['node']]> {
		if (graph !== undefined) {
			let iterator = this.graph_iterator(graph);
			let current = first || this.findFirst(iterator);
			return {
				next() {
					if (current !== undefined) {
						const entry = current;
						current = iterator(current);
						return {
							value:[
								typeof entry.key === 'string' ? entry.key : entry.key.entry,
								entry
							]
						};
					} else {
						return {
							done: true,
							value: undefined
						}
					}
				},
				[Symbol.iterator]() {
					return this;
				}
			};
		} else {
			return this[Symbol.iterator]();		}
	}
	forEach(walk_function: ($:T['node']) => void, iterator_name?:GT, first?:T['node']) {
		Array.from(this.entries(iterator_name, first)).forEach(entry => walk_function(entry[1]));
	}
	toArray(graph?:GT, first?:T['node']):[string, T['node']][] {
		return Array.from(this.entries(graph, first));
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

export abstract class AlanSet<T extends {node: AlanNode, init: any }, P extends AlanNode> {
	private _entries:Set<T['node']>;
	constructor (
		entries:Array<T['init']>,
		protected parent:P) {
		this._entries = new Set(entries.map(entry => this.initialize(parent, entry)));
	}

	protected abstract initialize(parent:P, obj:T['init']):T['node'];
	protected abstract resolve(obj:T['node'],detach?:boolean):void;
	protected abstract get path():string;

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
export abstract class StateGroup<T extends {name:string, node:AlanNode & {parent:AlanNode}, init:any}> {
	public state: DistributiveOmit<T,'init'>;
	private init(state_name:T['name'], init:T['init'], parent:AlanNode) {
		this.state = {
			name: state_name,
			node: this.initializer(state_name)(init, parent),
		} as DistributiveOmit<T,'init'>;
	}
	constructor (s:[T['name'],T['init']]|T['name'], private parent:AlanNode) {
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

/* alan object base classes */
export abstract class AlanObject {
	public abstract get path():string;
	public abstract is(other:AlanObject):boolean;
	reference_count:number = 0;
	public destroyed?:true;
}
export abstract class AlanCombinator extends AlanObject {public is(other:AlanCombinator):boolean {
		return this === other;
	}
}
export abstract class AlanNode extends AlanObject {
	public abstract get root():Cinterface_reply;
	public is(other:AlanNode):boolean {
		return this === other;
	}
}

/* alan objects */
export type Tdelete_node = {
};
export class Cdelete_node extends AlanNode {
	constructor(init:Tdelete_node, public location:AlanNode) {
		super();
	}
	public get root() { return this.location.root; }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/delete node`; }
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
	public get root() { return this.location.root; }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/initialize node`; }
}
export class Kproperties__initialize_node extends Reference<interface_.Cproperty, string> {
	constructor(key:string, $this:Cproperties__initialize_node) {
		super(key, cache(() => resolve($this.parent).then(() => $this.parent).then(context => context?.component_root.input.context_node())
			.then(context => context?.properties.attributes.get(this.entry))

			.then(context => context?.properties.type.cast('property')).result!, true))
	}
}
export type Tproperties__initialize_node = {
	'type':['collection', Tcollection__type__properties__initialize_node]|['file', Tfile__type__properties__initialize_node]|['group', Tgroup__type__properties__initialize_node]|['number', Tnumber__type__properties__initialize_node]|['reference', Treference__type__properties__initialize_node]|['state group', Tstate_group__type__properties__initialize_node]|['text', Ttext__type__properties__initialize_node];
};
export class Cproperties__initialize_node extends AlanNode {
	public key:Kproperties__initialize_node;
	public readonly properties:{
		readonly type:Cproperties__initialize_node.Dtype<
			{ name: 'collection', node:Ccollection__type__properties__initialize_node, init:Tcollection__type__properties__initialize_node}|
			{ name: 'file', node:Cfile__type__properties__initialize_node, init:Tfile__type__properties__initialize_node}|
			{ name: 'group', node:Cgroup__type__properties__initialize_node, init:Tgroup__type__properties__initialize_node}|
			{ name: 'number', node:Cnumber__type__properties__initialize_node, init:Tnumber__type__properties__initialize_node}|
			{ name: 'reference', node:Creference__type__properties__initialize_node, init:Treference__type__properties__initialize_node}|
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
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/properties[${this.key.entry}]`; }
}
export type Tcollection__type__properties__initialize_node = {
	'entries':Record<string, Tentries__collection__type__properties__initialize_node>;
	'type':'dictionary'|['dictionary', {}]|'matrix'|['matrix', {}];
};
export class Ccollection__type__properties__initialize_node extends AlanNode {
	public readonly properties:{
		readonly entries:Ccollection__type__properties__initialize_node.Dentries,
		readonly type:Ccollection__type__properties__initialize_node.Dtype<
			{ name: 'dictionary', node:Cdictionary__type__collection__type__properties__initialize_node, init:Tdictionary__type__collection__type__properties__initialize_node}|
			{ name: 'matrix', node:Cmatrix__type__collection__type__properties__initialize_node, init:Tmatrix__type__collection__type__properties__initialize_node}>
	};
	public readonly inferences:{
		collection: () => interface_.Ccollection__type__property
	} = {
		collection: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.key.ref)
			.then(context => context?.properties.type.cast('collection'))
			.result!, true)
	}
	constructor(init:Tcollection__type__properties__initialize_node, public parent:Cproperties__initialize_node) {
		super();
		const $this = this;
		this.properties = {
			entries: new Ccollection__type__properties__initialize_node.Dentries(init['entries'], $this),
			type: new Ccollection__type__properties__initialize_node.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?collection`; }
}
export type Tentries__collection__type__properties__initialize_node = {
	'node':Tinitialize_node;
};
export class Centries__collection__type__properties__initialize_node extends AlanNode {
	public key:string;
	public readonly properties:{
		readonly node:Cinitialize_node
	};
	constructor(key:string, init:Tentries__collection__type__properties__initialize_node, public parent:Ccollection__type__properties__initialize_node) {
		super();
		const $this = this;
		this.key = key;
		this.properties = {
			node: new Centries__collection__type__properties__initialize_node.Dnode(init['node'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/entries[${this.key}]`; }
}
export type Tdictionary__type__collection__type__properties__initialize_node = {
};
export class Cdictionary__type__collection__type__properties__initialize_node extends AlanNode {
	public readonly inferences:{
		dictionary: () => interface_.Cdictionary
	} = {
		dictionary: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.inferences.collection()).then(context => context?.properties.type.cast('dictionary'))
			.result!, true)
	}
	constructor(init:Tdictionary__type__collection__type__properties__initialize_node, public parent:Ccollection__type__properties__initialize_node) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?dictionary`; }
}
export type Tmatrix__type__collection__type__properties__initialize_node = {
};
export class Cmatrix__type__collection__type__properties__initialize_node extends AlanNode {
	public readonly inferences:{
		matrix: () => interface_.Cmatrix__type__collection
	} = {
		matrix: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.inferences.collection()).then(context => context?.properties.type.cast('matrix'))
			.result!, true)
	}
	constructor(init:Tmatrix__type__collection__type__properties__initialize_node, public parent:Ccollection__type__properties__initialize_node) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?matrix`; }
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
		text: () => interface_.Cfile__type__property
	} = {
		text: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.key.ref)
			.then(context => context?.properties.type.cast('file'))
			.result!, true)
	}
	constructor(init:Tfile__type__properties__initialize_node, public parent:Cproperties__initialize_node) {
		super();
		const $this = this;
		this.properties = {
			extension: init['extension'],
			token: init['token']
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?file`; }
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
		group: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.key.ref)
			.then(context => context?.properties.type.cast('group'))
			.result!, true)
	}
	constructor(init:Tgroup__type__properties__initialize_node, public parent:Cproperties__initialize_node) {
		super();
		const $this = this;
		this.properties = {
			node: new Cgroup__type__properties__initialize_node.Dnode(init['node'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?group`; }
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
		number: () => interface_.Cnumber__type__property
	} = {
		number: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.key.ref)
			.then(context => context?.properties.type.cast('number'))
			.result!, true)
	}
	constructor(init:Tnumber__type__properties__initialize_node, public parent:Cproperties__initialize_node) {
		super();
		const $this = this;
		this.properties = {
			type: new Cnumber__type__properties__initialize_node.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?number`; }
}
export type Tinteger__type__number__type__properties__initialize_node = {
	'value':number;
};
export class Cinteger__type__number__type__properties__initialize_node extends AlanNode {
	public readonly properties:{
		readonly value:number
	};
	public readonly inferences:{
		integer_type: () => interface_.Cinteger__set__number__type__property
	} = {
		integer_type: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.inferences.number()).then(context => context?.properties.set.cast('integer'))
			.result!, true)
	}
	constructor(init:Tinteger__type__number__type__properties__initialize_node, public parent:Cnumber__type__properties__initialize_node) {
		super();
		const $this = this;
		this.properties = {
			value: init['value']
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?integer`; }
}
export type Tnatural__type__number__type__properties__initialize_node = {
	'value':number;
};
export class Cnatural__type__number__type__properties__initialize_node extends AlanNode {
	public readonly properties:{
		readonly value:number
	};
	public readonly inferences:{
		natural_type: () => interface_.Cnatural__set__number__type__property
	} = {
		natural_type: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.inferences.number()).then(context => context?.properties.set.cast('natural'))
			.result!, true)
	}
	constructor(init:Tnatural__type__number__type__properties__initialize_node, public parent:Cnumber__type__properties__initialize_node) {
		super();
		const $this = this;
		this.properties = {
			value: init['value']
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?natural`; }
}
export type Treference__type__properties__initialize_node = {
	'referenced node':string;
};
export class Creference__type__properties__initialize_node extends AlanNode {
	public readonly properties:{
		readonly referenced_node:string
	};
	public readonly inferences:{
		reference: () => interface_.Creference__type__property
	} = {
		reference: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.key.ref)
			.then(context => context?.properties.type.cast('reference'))
			.result!, true)
	}
	constructor(init:Treference__type__properties__initialize_node, public parent:Cproperties__initialize_node) {
		super();
		const $this = this;
		this.properties = {
			referenced_node: init['referenced node']
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?reference`; }
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
		state_group: () => interface_.Cstate_group__type__property
	} = {
		state_group: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.key.ref)
			.then(context => context?.properties.type.cast('state group'))
			.result!, true)
	}
	constructor(init:Tstate_group__type__properties__initialize_node, public parent:Cproperties__initialize_node) {
		super();
		const $this = this;
		this.properties = {
			node: new Cstate_group__type__properties__initialize_node.Dnode(init['node'], $this),
			state: new Cstate_group__type__properties__initialize_node.Dstate(init['state'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?state group`; }
}
export type Ttext__type__properties__initialize_node = {
	'value':string;
};
export class Ctext__type__properties__initialize_node extends AlanNode {
	public readonly properties:{
		readonly value:string
	};
	public readonly inferences:{
		text: () => interface_.Ctext__type__property
	} = {
		text: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.key.ref)
			.then(context => context?.properties.type.cast('text'))
			.result!, true)
	}
	constructor(init:Ttext__type__properties__initialize_node, public parent:Cproperties__initialize_node) {
		super();
		const $this = this;
		this.properties = {
			value: init['value']
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?text`; }
}
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
	public get root() { return this.location.root; }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/update node`; }
}
export class Kproperties__update_node extends Reference<interface_.Cproperty, string> {
	constructor(key:string, $this:Cproperties__update_node) {
		super(key, cache(() => resolve($this.parent).then(() => $this.parent).then(context => context?.component_root.input.context_node())
			.then(context => context?.properties.attributes.get(this.entry))

			.then(context => context?.properties.type.cast('property')).result!, true))
	}
}
export type Tproperties__update_node = {
	'type':['collection', Tcollection__type__properties__update_node]|['file', Tfile__type__properties__update_node]|['group', Tgroup__type__properties__update_node]|['number', Tnumber__type__properties__update_node]|['reference', Treference__type__properties__update_node]|['state group', Tstate_group__type__properties__update_node]|['text', Ttext__type__properties__update_node];
};
export class Cproperties__update_node extends AlanNode {
	public key:Kproperties__update_node;
	public readonly properties:{
		readonly type:Cproperties__update_node.Dtype<
			{ name: 'collection', node:Ccollection__type__properties__update_node, init:Tcollection__type__properties__update_node}|
			{ name: 'file', node:Cfile__type__properties__update_node, init:Tfile__type__properties__update_node}|
			{ name: 'group', node:Cgroup__type__properties__update_node, init:Tgroup__type__properties__update_node}|
			{ name: 'number', node:Cnumber__type__properties__update_node, init:Tnumber__type__properties__update_node}|
			{ name: 'reference', node:Creference__type__properties__update_node, init:Treference__type__properties__update_node}|
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
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/properties[${this.key.entry}]`; }
}
export type Tcollection__type__properties__update_node = {
	'entries':Record<string, Tentries__collection__type__properties__update_node>;
	'type':'dictionary'|['dictionary', {}]|'matrix'|['matrix', {}];
};
export class Ccollection__type__properties__update_node extends AlanNode {
	public readonly properties:{
		readonly entries:Ccollection__type__properties__update_node.Dentries,
		readonly type:Ccollection__type__properties__update_node.Dtype<
			{ name: 'dictionary', node:Cdictionary__type__collection__type__properties__update_node, init:Tdictionary__type__collection__type__properties__update_node}|
			{ name: 'matrix', node:Cmatrix__type__collection__type__properties__update_node, init:Tmatrix__type__collection__type__properties__update_node}>
	};
	public readonly inferences:{
		collection: () => interface_.Ccollection__type__property
	} = {
		collection: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.key.ref)
			.then(context => context?.properties.type.cast('collection'))
			.result!, true)
	}
	constructor(init:Tcollection__type__properties__update_node, public parent:Cproperties__update_node) {
		super();
		const $this = this;
		this.properties = {
			entries: new Ccollection__type__properties__update_node.Dentries(init['entries'], $this),
			type: new Ccollection__type__properties__update_node.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?collection`; }
}
export type Tentries__collection__type__properties__update_node = {
	'type':['create', Tcreate__type__entries]|['remove', Tremove__type__entries]|['rename', Trename]|['update', Tupdate__type__entries];
};
export class Centries__collection__type__properties__update_node extends AlanNode {
	public key:string;
	public readonly properties:{
		readonly type:Centries__collection__type__properties__update_node.Dtype<
			{ name: 'create', node:Ccreate__type__entries, init:Tcreate__type__entries}|
			{ name: 'remove', node:Cremove__type__entries, init:Tremove__type__entries}|
			{ name: 'rename', node:Crename, init:Trename}|
			{ name: 'update', node:Cupdate__type__entries, init:Tupdate__type__entries}>
	};
	constructor(key:string, init:Tentries__collection__type__properties__update_node, public parent:Ccollection__type__properties__update_node) {
		super();
		const $this = this;
		this.key = key;
		this.properties = {
			type: new Centries__collection__type__properties__update_node.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/entries[${this.key}]`; }
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
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?create`; }
}
export type Tremove__type__entries = {
	'delete node':Tdelete_node;
};
export class Cremove__type__entries extends AlanNode {
	public readonly properties:{
		readonly delete_node:Cdelete_node
	};
	constructor(init:Tremove__type__entries, public parent:Centries__collection__type__properties__update_node) {
		super();
		const $this = this;
		this.properties = {
			delete_node: new Cremove__type__entries.Ddelete_node(init['delete node'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?remove`; }
}
export type Trename = {
	'old id':string;
};
export class Crename extends AlanNode {
	public readonly properties:{
		readonly old_id:Crename.Dold_id
	};
	constructor(init:Trename, public parent:Centries__collection__type__properties__update_node) {
		super();
		const $this = this;
		this.properties = {
			old_id: new Crename.Dold_id(init['old id'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?rename`; }
}
export type Tupdate__type__entries = {
	'invalidate referencer':'no'|['no', {}]|'yes'|['yes', {}];
	'update node':Tupdate_node;
};
export class Cupdate__type__entries extends AlanNode {
	public readonly properties:{
		readonly invalidate_referencer:Cupdate__type__entries.Dinvalidate_referencer<
			{ name: 'no', node:Cno__invalidate_referencer, init:Tno__invalidate_referencer}|
			{ name: 'yes', node:Cyes__invalidate_referencer, init:Tyes__invalidate_referencer}>,
		readonly update_node:Cupdate_node
	};
	constructor(init:Tupdate__type__entries, public parent:Centries__collection__type__properties__update_node) {
		super();
		const $this = this;
		this.properties = {
			invalidate_referencer: new Cupdate__type__entries.Dinvalidate_referencer(init['invalidate referencer'], $this),
			update_node: new Cupdate__type__entries.Dupdate_node(init['update node'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?update`; }
}
export type Tno__invalidate_referencer = {
};
export class Cno__invalidate_referencer extends AlanNode {
	constructor(init:Tno__invalidate_referencer, public parent:Cupdate__type__entries) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/invalidate referencer?no`; }
}
export type Tyes__invalidate_referencer = {
};
export class Cyes__invalidate_referencer extends AlanNode {
	public readonly inferences:{
		matrix: () => interface_reply.Cmatrix__type__collection__type__properties__update_node
	} = {
		matrix: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.parent)
			.then(context => context?.parent)
			.then(context => context?.properties.type.cast('matrix'))
			.result!, true)
	}
	constructor(init:Tyes__invalidate_referencer, public parent:Cupdate__type__entries) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/invalidate referencer?yes`; }
}
export type Tdictionary__type__collection__type__properties__update_node = {
};
export class Cdictionary__type__collection__type__properties__update_node extends AlanNode {
	public readonly inferences:{
		dictionary: () => interface_.Cdictionary
	} = {
		dictionary: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.inferences.collection()).then(context => context?.properties.type.cast('dictionary'))
			.result!, true)
	}
	constructor(init:Tdictionary__type__collection__type__properties__update_node, public parent:Ccollection__type__properties__update_node) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?dictionary`; }
}
export type Tmatrix__type__collection__type__properties__update_node = {
};
export class Cmatrix__type__collection__type__properties__update_node extends AlanNode {
	public readonly inferences:{
		matrix: () => interface_.Cmatrix__type__collection
	} = {
		matrix: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.inferences.collection()).then(context => context?.properties.type.cast('matrix'))
			.result!, true)
	}
	constructor(init:Tmatrix__type__collection__type__properties__update_node, public parent:Ccollection__type__properties__update_node) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?matrix`; }
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
		file: () => interface_.Cfile__type__property
	} = {
		file: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.key.ref)
			.then(context => context?.properties.type.cast('file'))
			.result!, true)
	}
	constructor(init:Tfile__type__properties__update_node, public parent:Cproperties__update_node) {
		super();
		const $this = this;
		this.properties = {
			new_extension: init['new extension'],
			new_token: init['new token']
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?file`; }
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
		group: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.key.ref)
			.then(context => context?.properties.type.cast('group'))
			.result!, true)
	}
	constructor(init:Tgroup__type__properties__update_node, public parent:Cproperties__update_node) {
		super();
		const $this = this;
		this.properties = {
			update_node: new Cgroup__type__properties__update_node.Dupdate_node(init['update node'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?group`; }
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
		number: () => interface_.Cnumber__type__property
	} = {
		number: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.key.ref)
			.then(context => context?.properties.type.cast('number'))
			.result!, true)
	}
	constructor(init:Tnumber__type__properties__update_node, public parent:Cproperties__update_node) {
		super();
		const $this = this;
		this.properties = {
			type: new Cnumber__type__properties__update_node.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?number`; }
}
export type Tinteger__type__number__type__properties__update_node = {
	'new value':number;
};
export class Cinteger__type__number__type__properties__update_node extends AlanNode {
	public readonly properties:{
		readonly new_value:number
	};
	public readonly inferences:{
		integer_type: () => interface_.Cinteger__set__number__type__property
	} = {
		integer_type: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.inferences.number()).then(context => context?.properties.set.cast('integer'))
			.result!, true)
	}
	constructor(init:Tinteger__type__number__type__properties__update_node, public parent:Cnumber__type__properties__update_node) {
		super();
		const $this = this;
		this.properties = {
			new_value: init['new value']
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?integer`; }
}
export type Tnatural__type__number__type__properties__update_node = {
	'new value':number;
};
export class Cnatural__type__number__type__properties__update_node extends AlanNode {
	public readonly properties:{
		readonly new_value:number
	};
	public readonly inferences:{
		natural_type: () => interface_.Cnatural__set__number__type__property
	} = {
		natural_type: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.inferences.number()).then(context => context?.properties.set.cast('natural'))
			.result!, true)
	}
	constructor(init:Tnatural__type__number__type__properties__update_node, public parent:Cnumber__type__properties__update_node) {
		super();
		const $this = this;
		this.properties = {
			new_value: init['new value']
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?natural`; }
}
export type Treference__type__properties__update_node = {
	'new referenced node':string;
};
export class Creference__type__properties__update_node extends AlanNode {
	public readonly properties:{
		readonly new_referenced_node:string
	};
	public readonly inferences:{
		reference: () => interface_.Creference__type__property
	} = {
		reference: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.key.ref)
			.then(context => context?.properties.type.cast('reference'))
			.result!, true)
	}
	constructor(init:Treference__type__properties__update_node, public parent:Cproperties__update_node) {
		super();
		const $this = this;
		this.properties = {
			new_referenced_node: init['new referenced node']
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?reference`; }
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
		state_group: () => interface_.Cstate_group__type__property
	} = {
		state_group: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.key.ref)
			.then(context => context?.properties.type.cast('state group'))
			.result!, true)
	}
	constructor(init:Tstate_group__type__properties__update_node, public parent:Cproperties__update_node) {
		super();
		const $this = this;
		this.properties = {
			state: new Cstate_group__type__properties__update_node.Dstate(init['state'], $this),
			type: new Cstate_group__type__properties__update_node.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?state group`; }
}
export type Tset = {
	'delete node':Tdelete_node;
	'node':Tinitialize_node;
};
export class Cset extends AlanNode {
	public readonly properties:{
		readonly delete_node:Cdelete_node,
		readonly node:Cinitialize_node
	};
	constructor(init:Tset, public parent:Cstate_group__type__properties__update_node) {
		super();
		const $this = this;
		this.properties = {
			delete_node: new Cset.Ddelete_node(init['delete node'], $this),
			node: new Cset.Dnode(init['node'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?set`; }
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
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?update`; }
}
export type Ttext__type__properties__update_node = {
	'new value':string;
};
export class Ctext__type__properties__update_node extends AlanNode {
	public readonly properties:{
		readonly new_value:string
	};
	public readonly inferences:{
		text: () => interface_.Ctext__type__property
	} = {
		text: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.key.ref)
			.then(context => context?.properties.type.cast('text'))
			.result!, true)
	}
	constructor(init:Ttext__type__properties__update_node, public parent:Cproperties__update_node) {
		super();
		const $this = this;
		this.properties = {
			new_value: init['new value']
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?text`; }
}

export type Tinterface_reply = {
	'type':['initialization', Tinitialization]|['notification', Tnotification];
};
export class Cinterface_reply extends AlanNode {
	public key?:string;
	public get root() { return this; }
	public readonly properties:{
		readonly type:Cinterface_reply.Dtype<
			{ name: 'initialization', node:Cinitialization, init:Tinitialization}|
			{ name: 'notification', node:Cnotification, init:Tnotification}>
	};
	constructor(init:Tinterface_reply, public readonly input: {
	'interface':interface_.Cinterface
	'request':interface_request.Cinterface_request}, public lazy_eval:boolean) {
		super();
		const $this = this;
		this.properties = {
			type: new Cinterface_reply.Dtype(init['type'], $this)
		};
	}
	public get path() { return ``; }
}
export type Tinitialization = {
	'has initialization data':'no'|['no', {}]|['yes', Tyes__has_initialization_data];
};
export class Cinitialization extends AlanNode {
	public readonly properties:{
		readonly has_initialization_data:Cinitialization.Dhas_initialization_data<
			{ name: 'no', node:Cno__has_initialization_data, init:Tno__has_initialization_data}|
			{ name: 'yes', node:Cyes__has_initialization_data, init:Tyes__has_initialization_data}>
	};
	public readonly inferences:{
		source: () => interface_request.Csubscribe
	} = {
		source: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.root.input.request)
			.then(context => context?.properties.type.cast('subscribe'))
			.result!, true)
	}
	constructor(init:Tinitialization, public parent:Cinterface_reply) {
		super();
		const $this = this;
		this.properties = {
			has_initialization_data: new Cinitialization.Dhas_initialization_data(init['has initialization data'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/type?initialization`; }
}
export type Tno__has_initialization_data = {
};
export class Cno__has_initialization_data extends AlanNode {
	public readonly inferences:{
		source: () => interface_request.Cno__initialization_data_requested
	} = {
		source: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.inferences.source()).then(context => context?.properties.initialization_data_requested.cast('no'))
			.result!, true)
	}
	constructor(init:Tno__has_initialization_data, public parent:Cinitialization) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/has initialization data?no`; }
}
export type Tyes__has_initialization_data = {
	'context exists':'no'|['no', {}]|['yes', Tyes__context_exists];
};
export class Cyes__has_initialization_data extends AlanNode {
	public readonly properties:{
		readonly context_exists:Cyes__has_initialization_data.Dcontext_exists<
			{ name: 'no', node:Cno__context_exists, init:Tno__context_exists}|
			{ name: 'yes', node:Cyes__context_exists, init:Tyes__context_exists}>
	};
	public readonly inferences:{
		source: () => interface_request.Cyes__initialization_data_requested
	} = {
		source: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.inferences.source()).then(context => context?.properties.initialization_data_requested.cast('yes'))
			.result!, true)
	}
	constructor(init:Tyes__has_initialization_data, public parent:Cinitialization) {
		super();
		const $this = this;
		this.properties = {
			context_exists: new Cyes__has_initialization_data.Dcontext_exists(init['context exists'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/has initialization data?yes`; }
}
export type Tno__context_exists = {
};
export class Cno__context_exists extends AlanNode {
	constructor(init:Tno__context_exists, public parent:Cyes__has_initialization_data) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/context exists?no`; }
}
export type Tyes__context_exists = {
	'root':Tinitialize_node;
};
export class Cyes__context_exists extends AlanNode {
	public readonly properties:{
		readonly root:Cinitialize_node
	};
	constructor(init:Tyes__context_exists, public parent:Cyes__has_initialization_data) {
		super();
		const $this = this;
		this.properties = {
			root: new Cyes__context_exists.Droot(init['root'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/context exists?yes`; }
}
export type Tnotification = {
	'type':['create', Tcreate__type__notification]|'remove'|['remove', {}]|['update', Tupdate__type__notification];
};
export class Cnotification extends AlanNode {
	public readonly properties:{
		readonly type:Cnotification.Dtype<
			{ name: 'create', node:Ccreate__type__notification, init:Tcreate__type__notification}|
			{ name: 'remove', node:Cremove__type__notification, init:Tremove__type__notification}|
			{ name: 'update', node:Cupdate__type__notification, init:Tupdate__type__notification}>
	};
	public readonly inferences:{
		source: () => interface_request.Csubscribe
	} = {
		source: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.root.input.request)
			.then(context => context?.properties.type.cast('subscribe'))
			.result!, true)
	}
	constructor(init:Tnotification, public parent:Cinterface_reply) {
		super();
		const $this = this;
		this.properties = {
			type: new Cnotification.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/type?notification`; }
}
export type Tcreate__type__notification = {
	'initialize node':Tinitialize_node;
};
export class Ccreate__type__notification extends AlanNode {
	public readonly properties:{
		readonly initialize_node:Cinitialize_node
	};
	constructor(init:Tcreate__type__notification, public parent:Cnotification) {
		super();
		const $this = this;
		this.properties = {
			initialize_node: new Ccreate__type__notification.Dinitialize_node(init['initialize node'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?create`; }
}
export type Tremove__type__notification = {
};
export class Cremove__type__notification extends AlanNode {
	constructor(init:Tremove__type__notification, public parent:Cnotification) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?remove`; }
}
export type Tupdate__type__notification = {
	'update node':Tupdate_node;
};
export class Cupdate__type__notification extends AlanNode {
	public readonly properties:{
		readonly update_node:Cupdate_node
	};
	constructor(init:Tupdate__type__notification, public parent:Cnotification) {
		super();
		const $this = this;
		this.properties = {
			update_node: new Cupdate__type__notification.Dupdate_node(init['update node'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?update`; }
}

/* property classes */export namespace Cinitialize_node {
	export class Dproperties extends AlanDictionary<{ node:Cproperties__initialize_node, init:Tproperties__initialize_node},Cinitialize_node> {
		protected graph_iterator(graph:string):(node:Cproperties__initialize_node) => Cproperties__initialize_node { throw new Error(`Dictionary has no graph iterators.`); }
		protected initialize(parent:Cinitialize_node, key:string, entry_init:Tproperties__initialize_node) { return new Cproperties__initialize_node(key, entry_init, parent); }
		protected resolve = resolve_properties__initialize_node
		protected get path() { return `${this.parent.path}/properties`; }
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
		{ name: 'reference', node:Creference__type__properties__initialize_node, init:Treference__type__properties__initialize_node}|
		{ name: 'state group', node:Cstate_group__type__properties__initialize_node, init:Tstate_group__type__properties__initialize_node}|
		{ name: 'text', node:Ctext__type__properties__initialize_node, init:Ttext__type__properties__initialize_node}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'collection': return (init:Tcollection__type__properties__initialize_node, parent:Cproperties__initialize_node) => new Ccollection__type__properties__initialize_node(init, parent);
				case 'file': return (init:Tfile__type__properties__initialize_node, parent:Cproperties__initialize_node) => new Cfile__type__properties__initialize_node(init, parent);
				case 'group': return (init:Tgroup__type__properties__initialize_node, parent:Cproperties__initialize_node) => new Cgroup__type__properties__initialize_node(init, parent);
				case 'number': return (init:Tnumber__type__properties__initialize_node, parent:Cproperties__initialize_node) => new Cnumber__type__properties__initialize_node(init, parent);
				case 'reference': return (init:Treference__type__properties__initialize_node, parent:Cproperties__initialize_node) => new Creference__type__properties__initialize_node(init, parent);
				case 'state group': return (init:Tstate_group__type__properties__initialize_node, parent:Cproperties__initialize_node) => new Cstate_group__type__properties__initialize_node(init, parent);
				case 'text': return (init:Ttext__type__properties__initialize_node, parent:Cproperties__initialize_node) => new Ctext__type__properties__initialize_node(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'collection': return resolve_collection__type__properties__initialize_node;
				case 'file': return resolve_file__type__properties__initialize_node;
				case 'group': return resolve_group__type__properties__initialize_node;
				case 'number': return resolve_number__type__properties__initialize_node;
				case 'reference': return resolve_reference__type__properties__initialize_node;
				case 'state group': return resolve_state_group__type__properties__initialize_node;
				case 'text': return resolve_text__type__properties__initialize_node;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tproperties__initialize_node['type'], parent:Cproperties__initialize_node) {
			super(data, parent);
		}
	}
}
export namespace Ccollection__type__properties__initialize_node {
	export class Dentries extends AlanDictionary<{ node:Centries__collection__type__properties__initialize_node, init:Tentries__collection__type__properties__initialize_node},Ccollection__type__properties__initialize_node> {
		protected graph_iterator(graph:string):(node:Centries__collection__type__properties__initialize_node) => Centries__collection__type__properties__initialize_node { throw new Error(`Dictionary has no graph iterators.`); }
		protected initialize(parent:Ccollection__type__properties__initialize_node, key:string, entry_init:Tentries__collection__type__properties__initialize_node) { return new Centries__collection__type__properties__initialize_node(key, entry_init, parent); }
		protected resolve = resolve_entries__collection__type__properties__initialize_node
		protected get path() { return `${this.parent.path}/entries`; }
		constructor(data:Tcollection__type__properties__initialize_node['entries'], parent:Ccollection__type__properties__initialize_node) {
			super(data, parent);
		}
	}
	export class Dtype<T extends
		{ name: 'dictionary', node:Cdictionary__type__collection__type__properties__initialize_node, init:Tdictionary__type__collection__type__properties__initialize_node}|
		{ name: 'matrix', node:Cmatrix__type__collection__type__properties__initialize_node, init:Tmatrix__type__collection__type__properties__initialize_node}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'dictionary': return (init:Tdictionary__type__collection__type__properties__initialize_node, parent:Ccollection__type__properties__initialize_node) => new Cdictionary__type__collection__type__properties__initialize_node(init, parent);
				case 'matrix': return (init:Tmatrix__type__collection__type__properties__initialize_node, parent:Ccollection__type__properties__initialize_node) => new Cmatrix__type__collection__type__properties__initialize_node(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'dictionary': return resolve_dictionary__type__collection__type__properties__initialize_node;
				case 'matrix': return resolve_matrix__type__collection__type__properties__initialize_node;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tcollection__type__properties__initialize_node['type'], parent:Ccollection__type__properties__initialize_node) {
			super(data, parent);
		}
	}
}
export namespace Centries__collection__type__properties__initialize_node {
	export class Dnode extends Cinitialize_node {
		constructor(data:Tentries__collection__type__properties__initialize_node['node'], parent:Centries__collection__type__properties__initialize_node) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.inferences.collection()).then(context => context?.properties.node)
						.result!
					).result!, false)
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
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.inferences.group()).then(context => context?.properties.node)
						.result!
					).result!, false)
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
				case 'integer': return resolve_integer__type__number__type__properties__initialize_node;
				case 'natural': return resolve_natural__type__number__type__properties__initialize_node;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tnumber__type__properties__initialize_node['type'], parent:Cnumber__type__properties__initialize_node) {
			super(data, parent);
		}
	}
}
export namespace Cinteger__type__number__type__properties__initialize_node {
}
export namespace Cnatural__type__number__type__properties__initialize_node {
}
export namespace Creference__type__properties__initialize_node {
}
export namespace Cstate_group__type__properties__initialize_node {
	export class Dnode extends Cinitialize_node {
		constructor(data:Tstate_group__type__properties__initialize_node['node'], parent:Cstate_group__type__properties__initialize_node) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.properties.state.ref)
						.then(context => context?.properties.node)
						.result!
					).result!, false)
			})
		}
	}
	export class Dstate extends Reference<interface_.Cstates__state_group__type__property,string> {

		constructor(data:string, $this:Cstate_group__type__properties__initialize_node) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.inferences.state_group()).then(context => context?.properties.states.get(this.entry))
				.result!, true))
		}
	}
}
export namespace Ctext__type__properties__initialize_node {
}
export namespace Cupdate_node {
	export class Dproperties extends AlanDictionary<{ node:Cproperties__update_node, init:Tproperties__update_node},Cupdate_node> {
		protected graph_iterator(graph:string):(node:Cproperties__update_node) => Cproperties__update_node { throw new Error(`Dictionary has no graph iterators.`); }
		protected initialize(parent:Cupdate_node, key:string, entry_init:Tproperties__update_node) { return new Cproperties__update_node(key, entry_init, parent); }
		protected resolve = resolve_properties__update_node
		protected get path() { return `${this.parent.path}/properties`; }
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
		{ name: 'reference', node:Creference__type__properties__update_node, init:Treference__type__properties__update_node}|
		{ name: 'state group', node:Cstate_group__type__properties__update_node, init:Tstate_group__type__properties__update_node}|
		{ name: 'text', node:Ctext__type__properties__update_node, init:Ttext__type__properties__update_node}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'collection': return (init:Tcollection__type__properties__update_node, parent:Cproperties__update_node) => new Ccollection__type__properties__update_node(init, parent);
				case 'file': return (init:Tfile__type__properties__update_node, parent:Cproperties__update_node) => new Cfile__type__properties__update_node(init, parent);
				case 'group': return (init:Tgroup__type__properties__update_node, parent:Cproperties__update_node) => new Cgroup__type__properties__update_node(init, parent);
				case 'number': return (init:Tnumber__type__properties__update_node, parent:Cproperties__update_node) => new Cnumber__type__properties__update_node(init, parent);
				case 'reference': return (init:Treference__type__properties__update_node, parent:Cproperties__update_node) => new Creference__type__properties__update_node(init, parent);
				case 'state group': return (init:Tstate_group__type__properties__update_node, parent:Cproperties__update_node) => new Cstate_group__type__properties__update_node(init, parent);
				case 'text': return (init:Ttext__type__properties__update_node, parent:Cproperties__update_node) => new Ctext__type__properties__update_node(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'collection': return resolve_collection__type__properties__update_node;
				case 'file': return resolve_file__type__properties__update_node;
				case 'group': return resolve_group__type__properties__update_node;
				case 'number': return resolve_number__type__properties__update_node;
				case 'reference': return resolve_reference__type__properties__update_node;
				case 'state group': return resolve_state_group__type__properties__update_node;
				case 'text': return resolve_text__type__properties__update_node;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tproperties__update_node['type'], parent:Cproperties__update_node) {
			super(data, parent);
		}
	}
}
export namespace Ccollection__type__properties__update_node {
	export class Dentries extends AlanDictionary<{ node:Centries__collection__type__properties__update_node, init:Tentries__collection__type__properties__update_node},Ccollection__type__properties__update_node> {
		protected graph_iterator(graph:string):(node:Centries__collection__type__properties__update_node) => Centries__collection__type__properties__update_node { throw new Error(`Dictionary has no graph iterators.`); }
		protected initialize(parent:Ccollection__type__properties__update_node, key:string, entry_init:Tentries__collection__type__properties__update_node) { return new Centries__collection__type__properties__update_node(key, entry_init, parent); }
		protected resolve = resolve_entries__collection__type__properties__update_node
		protected get path() { return `${this.parent.path}/entries`; }
		constructor(data:Tcollection__type__properties__update_node['entries'], parent:Ccollection__type__properties__update_node) {
			super(data, parent);
		}
	}
	export class Dtype<T extends
		{ name: 'dictionary', node:Cdictionary__type__collection__type__properties__update_node, init:Tdictionary__type__collection__type__properties__update_node}|
		{ name: 'matrix', node:Cmatrix__type__collection__type__properties__update_node, init:Tmatrix__type__collection__type__properties__update_node}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'dictionary': return (init:Tdictionary__type__collection__type__properties__update_node, parent:Ccollection__type__properties__update_node) => new Cdictionary__type__collection__type__properties__update_node(init, parent);
				case 'matrix': return (init:Tmatrix__type__collection__type__properties__update_node, parent:Ccollection__type__properties__update_node) => new Cmatrix__type__collection__type__properties__update_node(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'dictionary': return resolve_dictionary__type__collection__type__properties__update_node;
				case 'matrix': return resolve_matrix__type__collection__type__properties__update_node;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tcollection__type__properties__update_node['type'], parent:Ccollection__type__properties__update_node) {
			super(data, parent);
		}
	}
}
export namespace Centries__collection__type__properties__update_node {
	export class Dtype<T extends
		{ name: 'create', node:Ccreate__type__entries, init:Tcreate__type__entries}|
		{ name: 'remove', node:Cremove__type__entries, init:Tremove__type__entries}|
		{ name: 'rename', node:Crename, init:Trename}|
		{ name: 'update', node:Cupdate__type__entries, init:Tupdate__type__entries}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'create': return (init:Tcreate__type__entries, parent:Centries__collection__type__properties__update_node) => new Ccreate__type__entries(init, parent);
				case 'remove': return (init:Tremove__type__entries, parent:Centries__collection__type__properties__update_node) => new Cremove__type__entries(init, parent);
				case 'rename': return (init:Trename, parent:Centries__collection__type__properties__update_node) => new Crename(init, parent);
				case 'update': return (init:Tupdate__type__entries, parent:Centries__collection__type__properties__update_node) => new Cupdate__type__entries(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'create': return resolve_create__type__entries;
				case 'remove': return resolve_remove__type__entries;
				case 'rename': return resolve_rename;
				case 'update': return resolve_update__type__entries;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tentries__collection__type__properties__update_node['type'], parent:Centries__collection__type__properties__update_node) {
			super(data, parent);
		}
	}
}
export namespace Ccreate__type__entries {
	export class Dnode extends Cinitialize_node {
		constructor(data:Tcreate__type__entries['node'], parent:Ccreate__type__entries) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.inferences.collection()).then(context => context?.properties.node)
						.result!
					).result!, false)
			})
		}
	}
}
export namespace Cremove__type__entries {
	export class Ddelete_node extends Cdelete_node {
		constructor(data:Tremove__type__entries['delete node'], parent:Cremove__type__entries) {
			super(data, parent)
		}
	}
}
export namespace Crename {
	export class Dold_id extends Reference<interface_reply.Centries__collection__type__properties__update_node,string> {
		public readonly inferences:{
			old_id: () => interface_reply.Cno__invalidate_referencer
		}

		constructor(data:string, $this:Crename) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.parent)
				.then(context => context?.parent)
				.then(context => context?.properties.entries.get(this.entry))
				.result!, true))
			this.inferences = {
				old_id: cache(() => resolve($this.properties.old_id.ref).then(context => context)
					.then(context => context?.properties.type.cast('update').properties.invalidate_referencer.cast('no'))
					.result!, true)
			}
		}
	}
}
export namespace Cupdate__type__entries {
	export class Dinvalidate_referencer<T extends
		{ name: 'no', node:Cno__invalidate_referencer, init:Tno__invalidate_referencer}|
		{ name: 'yes', node:Cyes__invalidate_referencer, init:Tyes__invalidate_referencer}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__invalidate_referencer, parent:Cupdate__type__entries) => new Cno__invalidate_referencer(init, parent);
				case 'yes': return (init:Tyes__invalidate_referencer, parent:Cupdate__type__entries) => new Cyes__invalidate_referencer(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'no': return resolve_no__invalidate_referencer;
				case 'yes': return resolve_yes__invalidate_referencer;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tupdate__type__entries['invalidate referencer'], parent:Cupdate__type__entries) {
			super(data, parent);
		}
	}
	export class Dupdate_node extends Cupdate_node {
		constructor(data:Tupdate__type__entries['update node'], parent:Cupdate__type__entries) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.inferences.collection()).then(context => context?.properties.node)
						.result!
					).result!, false)
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
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.inferences.group()).then(context => context?.properties.node)
						.result!
					).result!, false)
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
				case 'integer': return resolve_integer__type__number__type__properties__update_node;
				case 'natural': return resolve_natural__type__number__type__properties__update_node;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tnumber__type__properties__update_node['type'], parent:Cnumber__type__properties__update_node) {
			super(data, parent);
		}
	}
}
export namespace Cinteger__type__number__type__properties__update_node {
}
export namespace Cnatural__type__number__type__properties__update_node {
}
export namespace Creference__type__properties__update_node {
}
export namespace Cstate_group__type__properties__update_node {
	export class Dstate extends Reference<interface_.Cstates__state_group__type__property,string> {

		constructor(data:string, $this:Cstate_group__type__properties__update_node) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.inferences.state_group()).then(context => context?.properties.states.get(this.entry))
				.result!, true))
		}
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
				case 'set': return resolve_set;
				case 'update': return resolve_update__type__state_group;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tstate_group__type__properties__update_node['type'], parent:Cstate_group__type__properties__update_node) {
			super(data, parent);
		}
	}
}
export namespace Cset {
	export class Ddelete_node extends Cdelete_node {
		constructor(data:Tset['delete node'], parent:Cset) {
			super(data, parent)
		}
	}
	export class Dnode extends Cinitialize_node {
		constructor(data:Tset['node'], parent:Cset) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.properties.state.ref)
						.then(context => context?.properties.node)
						.result!
					).result!, false)
			})
		}
	}
}
export namespace Cupdate__type__state_group {
	export class Dupdate_node extends Cupdate_node {
		constructor(data:Tupdate__type__state_group['update node'], parent:Cupdate__type__state_group) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.properties.state.ref)
						.then(context => context?.properties.node)
						.result!
					).result!, false)
			})
		}
	}
}
export namespace Ctext__type__properties__update_node {
}
export namespace Cinterface_reply {
	export class Dtype<T extends
		{ name: 'initialization', node:Cinitialization, init:Tinitialization}|
		{ name: 'notification', node:Cnotification, init:Tnotification}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'initialization': return (init:Tinitialization, parent:Cinterface_reply) => new Cinitialization(init, parent);
				case 'notification': return (init:Tnotification, parent:Cinterface_reply) => new Cnotification(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'initialization': return resolve_initialization;
				case 'notification': return resolve_notification;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tinterface_reply['type'], parent:Cinterface_reply) {
			super(data, parent);
		}
	}
}
export namespace Cinitialization {
	export class Dhas_initialization_data<T extends
		{ name: 'no', node:Cno__has_initialization_data, init:Tno__has_initialization_data}|
		{ name: 'yes', node:Cyes__has_initialization_data, init:Tyes__has_initialization_data}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__has_initialization_data, parent:Cinitialization) => new Cno__has_initialization_data(init, parent);
				case 'yes': return (init:Tyes__has_initialization_data, parent:Cinitialization) => new Cyes__has_initialization_data(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'no': return resolve_no__has_initialization_data;
				case 'yes': return resolve_yes__has_initialization_data;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tinitialization['has initialization data'], parent:Cinitialization) {
			super(data, parent);
		}
	}
}
export namespace Cyes__has_initialization_data {
	export class Dcontext_exists<T extends
		{ name: 'no', node:Cno__context_exists, init:Tno__context_exists}|
		{ name: 'yes', node:Cyes__context_exists, init:Tyes__context_exists}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__context_exists, parent:Cyes__has_initialization_data) => new Cno__context_exists(init, parent);
				case 'yes': return (init:Tyes__context_exists, parent:Cyes__has_initialization_data) => new Cyes__context_exists(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'no': return resolve_no__context_exists;
				case 'yes': return resolve_yes__context_exists;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tyes__has_initialization_data['context exists'], parent:Cyes__has_initialization_data) {
			super(data, parent);
		}
	}
}
export namespace Cyes__context_exists {
	export class Droot extends Cinitialize_node {
		constructor(data:Tyes__context_exists['root'], parent:Cyes__context_exists) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.root.input.interface)
						.then(context => context?.properties.root)
						.result!
					).result!, false)
			})
		}
	}
}
export namespace Cnotification {
	export class Dtype<T extends
		{ name: 'create', node:Ccreate__type__notification, init:Tcreate__type__notification}|
		{ name: 'remove', node:Cremove__type__notification, init:Tremove__type__notification}|
		{ name: 'update', node:Cupdate__type__notification, init:Tupdate__type__notification}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'create': return (init:Tcreate__type__notification, parent:Cnotification) => new Ccreate__type__notification(init, parent);
				case 'remove': return (init:Tremove__type__notification, parent:Cnotification) => new Cremove__type__notification(init, parent);
				case 'update': return (init:Tupdate__type__notification, parent:Cnotification) => new Cupdate__type__notification(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'create': return resolve_create__type__notification;
				case 'remove': return resolve_remove__type__notification;
				case 'update': return resolve_update__type__notification;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tnotification['type'], parent:Cnotification) {
			super(data, parent);
		}
	}
}
export namespace Ccreate__type__notification {
	export class Dinitialize_node extends Cinitialize_node {
		constructor(data:Tcreate__type__notification['initialize node'], parent:Ccreate__type__notification) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.root.input.interface)
						.then(context => context?.properties.root)
						.result!
					).result!, false)
			})
		}
	}
}
export namespace Cupdate__type__notification {
	export class Dupdate_node extends Cupdate_node {
		constructor(data:Tupdate__type__notification['update node'], parent:Cupdate__type__notification) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.root.input.interface)
						.then(context => context?.properties.root)
						.result!
					).result!, false)
			})
		}
	}
}
/* de(resolution) */
function auto_defer<T extends (...args:any) => void>(root:Cinterface_reply, callback:T):T {
	return callback;
}
function resolve_delete_node(obj:Cdelete_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_entries__collection__type__properties__initialize_node(obj:Centries__collection__type__properties__initialize_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_initialize_node(obj.properties.node, detach);
}
function resolve_dictionary__type__collection__type__properties__initialize_node(obj:Cdictionary__type__collection__type__properties__initialize_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cdictionary>obj.inferences.dictionary)(detach) !== undefined || detach);
}
function resolve_matrix__type__collection__type__properties__initialize_node(obj:Cmatrix__type__collection__type__properties__initialize_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cmatrix__type__collection>obj.inferences.matrix)(detach) !== undefined || detach);
}
function resolve_collection__type__properties__initialize_node(obj:Ccollection__type__properties__initialize_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Ccollection__type__property>obj.inferences.collection)(detach) !== undefined || detach);
	obj.properties.entries.forEach(entry => resolve_entries__collection__type__properties__initialize_node(entry, detach));
	obj.properties.type.switch({
		'dictionary': node => resolve_dictionary__type__collection__type__properties__initialize_node(node, detach),
		'matrix': node => resolve_matrix__type__collection__type__properties__initialize_node(node, detach)
	});
}
function resolve_file__type__properties__initialize_node(obj:Cfile__type__properties__initialize_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cfile__type__property>obj.inferences.text)(detach) !== undefined || detach);
}
function resolve_group__type__properties__initialize_node(obj:Cgroup__type__properties__initialize_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cgroup__type__property>obj.inferences.group)(detach) !== undefined || detach);
	resolve_initialize_node(obj.properties.node, detach);
}
function resolve_integer__type__number__type__properties__initialize_node(obj:Cinteger__type__number__type__properties__initialize_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cinteger__set__number__type__property>obj.inferences.integer_type)(detach) !== undefined || detach);
}
function resolve_natural__type__number__type__properties__initialize_node(obj:Cnatural__type__number__type__properties__initialize_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cnatural__set__number__type__property>obj.inferences.natural_type)(detach) !== undefined || detach);
}
function resolve_number__type__properties__initialize_node(obj:Cnumber__type__properties__initialize_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cnumber__type__property>obj.inferences.number)(detach) !== undefined || detach);
	obj.properties.type.switch({
		'integer': node => resolve_integer__type__number__type__properties__initialize_node(node, detach),
		'natural': node => resolve_natural__type__number__type__properties__initialize_node(node, detach)
	});
}
function resolve_reference__type__properties__initialize_node(obj:Creference__type__properties__initialize_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Creference__type__property>obj.inferences.reference)(detach) !== undefined || detach);
}
function resolve_state_group__type__properties__initialize_node(obj:Cstate_group__type__properties__initialize_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cstate_group__type__property>obj.inferences.state_group)(detach) !== undefined || detach);
	resolve_initialize_node(obj.properties.node, detach);
	assert((<(detach?:boolean) => interface_.Cstates__state_group__type__property>(obj.properties.state as any).resolve)(detach) !== undefined || detach);
}
function resolve_text__type__properties__initialize_node(obj:Ctext__type__properties__initialize_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Ctext__type__property>obj.inferences.text)(detach) !== undefined || detach);
}
function resolve_properties__initialize_node(obj:Cproperties__initialize_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cproperty>(obj.key as any).resolve)(detach) !== undefined || detach);
	obj.properties.type.switch({
		'collection': node => resolve_collection__type__properties__initialize_node(node, detach),
		'file': node => resolve_file__type__properties__initialize_node(node, detach),
		'group': node => resolve_group__type__properties__initialize_node(node, detach),
		'number': node => resolve_number__type__properties__initialize_node(node, detach),
		'reference': node => resolve_reference__type__properties__initialize_node(node, detach),
		'state group': node => resolve_state_group__type__properties__initialize_node(node, detach),
		'text': node => resolve_text__type__properties__initialize_node(node, detach)
	});
}
function resolve_initialize_node(obj:Cinitialize_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.properties.forEach(entry => resolve_properties__initialize_node(entry, detach));
}
function resolve_create__type__entries(obj:Ccreate__type__entries, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_initialize_node(obj.properties.node, detach);
}
function resolve_remove__type__entries(obj:Cremove__type__entries, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_delete_node(obj.properties.delete_node, detach);
}
function resolve_rename(obj:Crename, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_reply.Centries__collection__type__properties__update_node>(obj.properties.old_id as any).resolve)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_reply.Cno__invalidate_referencer>obj.properties.old_id.inferences.old_id)(detach) !== undefined || detach);
}
function resolve_no__invalidate_referencer(obj:Cno__invalidate_referencer, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_yes__invalidate_referencer(obj:Cyes__invalidate_referencer, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_reply.Cmatrix__type__collection__type__properties__update_node>obj.inferences.matrix)(detach) !== undefined || detach);
}
function resolve_update__type__entries(obj:Cupdate__type__entries, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.invalidate_referencer.switch({
		'no': node => resolve_no__invalidate_referencer(node, detach),
		'yes': node => resolve_yes__invalidate_referencer(node, detach)
	});
	resolve_update_node(obj.properties.update_node, detach);
}
function resolve_entries__collection__type__properties__update_node(obj:Centries__collection__type__properties__update_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.type.switch({
		'create': node => resolve_create__type__entries(node, detach),
		'remove': node => resolve_remove__type__entries(node, detach),
		'rename': node => resolve_rename(node, detach),
		'update': node => resolve_update__type__entries(node, detach)
	});
}
function resolve_dictionary__type__collection__type__properties__update_node(obj:Cdictionary__type__collection__type__properties__update_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cdictionary>obj.inferences.dictionary)(detach) !== undefined || detach);
}
function resolve_matrix__type__collection__type__properties__update_node(obj:Cmatrix__type__collection__type__properties__update_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cmatrix__type__collection>obj.inferences.matrix)(detach) !== undefined || detach);
}
function resolve_collection__type__properties__update_node(obj:Ccollection__type__properties__update_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Ccollection__type__property>obj.inferences.collection)(detach) !== undefined || detach);
	obj.properties.entries.forEach(entry => resolve_entries__collection__type__properties__update_node(entry, detach));
	obj.properties.type.switch({
		'dictionary': node => resolve_dictionary__type__collection__type__properties__update_node(node, detach),
		'matrix': node => resolve_matrix__type__collection__type__properties__update_node(node, detach)
	});
}
function resolve_file__type__properties__update_node(obj:Cfile__type__properties__update_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cfile__type__property>obj.inferences.file)(detach) !== undefined || detach);
}
function resolve_group__type__properties__update_node(obj:Cgroup__type__properties__update_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cgroup__type__property>obj.inferences.group)(detach) !== undefined || detach);
	resolve_update_node(obj.properties.update_node, detach);
}
function resolve_integer__type__number__type__properties__update_node(obj:Cinteger__type__number__type__properties__update_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cinteger__set__number__type__property>obj.inferences.integer_type)(detach) !== undefined || detach);
}
function resolve_natural__type__number__type__properties__update_node(obj:Cnatural__type__number__type__properties__update_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cnatural__set__number__type__property>obj.inferences.natural_type)(detach) !== undefined || detach);
}
function resolve_number__type__properties__update_node(obj:Cnumber__type__properties__update_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cnumber__type__property>obj.inferences.number)(detach) !== undefined || detach);
	obj.properties.type.switch({
		'integer': node => resolve_integer__type__number__type__properties__update_node(node, detach),
		'natural': node => resolve_natural__type__number__type__properties__update_node(node, detach)
	});
}
function resolve_reference__type__properties__update_node(obj:Creference__type__properties__update_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Creference__type__property>obj.inferences.reference)(detach) !== undefined || detach);
}
function resolve_set(obj:Cset, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_delete_node(obj.properties.delete_node, detach);
	resolve_initialize_node(obj.properties.node, detach);
}
function resolve_update__type__state_group(obj:Cupdate__type__state_group, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_update_node(obj.properties.update_node, detach);
}
function resolve_state_group__type__properties__update_node(obj:Cstate_group__type__properties__update_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cstate_group__type__property>obj.inferences.state_group)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cstates__state_group__type__property>(obj.properties.state as any).resolve)(detach) !== undefined || detach);
	obj.properties.type.switch({
		'set': node => resolve_set(node, detach),
		'update': node => resolve_update__type__state_group(node, detach)
	});
}
function resolve_text__type__properties__update_node(obj:Ctext__type__properties__update_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Ctext__type__property>obj.inferences.text)(detach) !== undefined || detach);
}
function resolve_properties__update_node(obj:Cproperties__update_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cproperty>(obj.key as any).resolve)(detach) !== undefined || detach);
	obj.properties.type.switch({
		'collection': node => resolve_collection__type__properties__update_node(node, detach),
		'file': node => resolve_file__type__properties__update_node(node, detach),
		'group': node => resolve_group__type__properties__update_node(node, detach),
		'number': node => resolve_number__type__properties__update_node(node, detach),
		'reference': node => resolve_reference__type__properties__update_node(node, detach),
		'state group': node => resolve_state_group__type__properties__update_node(node, detach),
		'text': node => resolve_text__type__properties__update_node(node, detach)
	});
}
function resolve_update_node(obj:Cupdate_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.properties.forEach(entry => resolve_properties__update_node(entry, detach));
}
function resolve_no__has_initialization_data(obj:Cno__has_initialization_data, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_request.Cno__initialization_data_requested>obj.inferences.source)(detach) !== undefined || detach);
}
function resolve_no__context_exists(obj:Cno__context_exists, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_yes__context_exists(obj:Cyes__context_exists, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_initialize_node(obj.properties.root, detach);
}
function resolve_yes__has_initialization_data(obj:Cyes__has_initialization_data, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_request.Cyes__initialization_data_requested>obj.inferences.source)(detach) !== undefined || detach);
	obj.properties.context_exists.switch({
		'no': node => resolve_no__context_exists(node, detach),
		'yes': node => resolve_yes__context_exists(node, detach)
	});
}
function resolve_initialization(obj:Cinitialization, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_request.Csubscribe>obj.inferences.source)(detach) !== undefined || detach);
	obj.properties.has_initialization_data.switch({
		'no': node => resolve_no__has_initialization_data(node, detach),
		'yes': node => resolve_yes__has_initialization_data(node, detach)
	});
}
function resolve_create__type__notification(obj:Ccreate__type__notification, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_initialize_node(obj.properties.initialize_node, detach);
}
function resolve_remove__type__notification(obj:Cremove__type__notification, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_update__type__notification(obj:Cupdate__type__notification, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_update_node(obj.properties.update_node, detach);
}
function resolve_notification(obj:Cnotification, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_request.Csubscribe>obj.inferences.source)(detach) !== undefined || detach);
	obj.properties.type.switch({
		'create': node => resolve_create__type__notification(node, detach),
		'remove': node => resolve_remove__type__notification(node, detach),
		'update': node => resolve_update__type__notification(node, detach)
	});
}
function resolve_interface_reply(obj:Cinterface_reply, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.type.switch({
		'initialization': node => resolve_initialization(node, detach),
		'notification': node => resolve_notification(node, detach)
	});
}

export namespace Cinterface_reply {
	export function create(init:Tinterface_reply, input: {
		'interface':interface_.Cinterface
		'request':interface_request.Cinterface_request
	}, lazy_eval:boolean = false):Cinterface_reply {
		const instance = new Cinterface_reply(init, input as any, lazy_eval);
		if (!lazy_eval) resolve_interface_reply(instance);
		return instance;
	};
}
