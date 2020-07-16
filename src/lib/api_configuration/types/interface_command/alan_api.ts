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


function cache<T extends AlanObject>(callback:() => T, update_ref_count = false) {
	let cached_value:T;
	let resolving:boolean = false;
	return (detach = false) => {
		if (resolving) {
			throw new Error(`Cyclic dependency detected!`);
		}
		if (detach && update_ref_count && cached_value !== undefined) {
			--cached_value.reference_count;
			(cached_value as any) = undefined;
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
	public abstract get root():Cinterface_command;
	public is(other:AlanNode):boolean {
		return this === other;
	}
}

/* alan objects */
export type Tcommand_arguments = {
	'properties':Record<string, Tproperties>;
};
export class Ccommand_arguments extends AlanNode {
	public readonly properties:{
		readonly properties:Ccommand_arguments.Dproperties
	};
	constructor(init:Tcommand_arguments, public location:AlanNode, public input: {
		parameter_definition: () => interface_.Cparameter_definition__interface
	}) {
		super();
		const $this = this;
		this.properties = {
			properties: new Ccommand_arguments.Dproperties(init['properties'], $this)
		};
	}
	public get root() { return this.location.root; }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/command arguments`; }
}
export class Kproperties extends Reference<interface_.Cproperties, string> {
	constructor(key:string, $this:Cproperties) {
		super(key, cache(() => resolve($this.parent).then(() => $this.parent).then(context => context?.component_root.input.parameter_definition())
			.then(context => context?.properties.properties.get(this.entry))
			.result!, true))
	}
}
export type Tproperties = {
	'type':['collection', Tcollection]|['file', Tfile]|['group', Tgroup__type__properties]|['number', Tnumber]|['state group', Tstate_group]|['text', Ttext];
};
export class Cproperties extends AlanNode {
	public key:Kproperties;
	public readonly properties:{
		readonly type:Cproperties.Dtype<
			{ name: 'collection', node:Ccollection, init:Tcollection}|
			{ name: 'file', node:Cfile, init:Tfile}|
			{ name: 'group', node:Cgroup__type__properties, init:Tgroup__type__properties}|
			{ name: 'number', node:Cnumber, init:Tnumber}|
			{ name: 'state group', node:Cstate_group, init:Tstate_group}|
			{ name: 'text', node:Ctext, init:Ttext}>
	};
	constructor(key:string, init:Tproperties, public parent:Ccommand_arguments) {
		super();
		const $this = this;
		this.key = new Kproperties(key, $this);
		this.properties = {
			type: new Cproperties.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/properties[${this.key.entry}]`; }
}
export type Tcollection = {
	'entries':Tentries[];
};
export class Ccollection extends AlanNode {
	public readonly properties:{
		readonly entries:Ccollection.Dentries
	};
	public readonly inferences:{
		collection: () => interface_.Ccollection__type__properties
	} = {
		collection: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.key.ref)
			.then(context => context?.properties.type.cast('collection'))
			.result!, true)
	}
	constructor(init:Tcollection, public parent:Cproperties) {
		super();
		const $this = this;
		this.properties = {
			entries: new Ccollection.Dentries(init['entries'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?collection`; }
}
export type Tentries = {
	'arguments':Tcommand_arguments;
};
export class Centries extends AlanNode {
	public readonly properties:{
		readonly arguments:Ccommand_arguments
	};
	constructor(init:Tentries, public parent:Ccollection) {
		super();
		const $this = this;
		this.properties = {
			arguments: new Centries.Darguments(init['arguments'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/entries`; }
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
		file: () => interface_.Cfile__type__properties
	} = {
		file: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.key.ref)
			.then(context => context?.properties.type.cast('file'))
			.result!, true)
	}
	constructor(init:Tfile, public parent:Cproperties) {
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
export type Tgroup__type__properties = {
	'arguments':Tcommand_arguments;
};
export class Cgroup__type__properties extends AlanNode {
	public readonly properties:{
		readonly arguments:Ccommand_arguments
	};
	public readonly inferences:{
		group: () => interface_.Cgroup__type__properties
	} = {
		group: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.key.ref)
			.then(context => context?.properties.type.cast('group'))
			.result!, true)
	}
	constructor(init:Tgroup__type__properties, public parent:Cproperties) {
		super();
		const $this = this;
		this.properties = {
			arguments: new Cgroup__type__properties.Darguments(init['arguments'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?group`; }
}
export type Tnumber = {
	'type':['integer', Tinteger]|['natural', Tnatural];
};
export class Cnumber extends AlanNode {
	public readonly properties:{
		readonly type:Cnumber.Dtype<
			{ name: 'integer', node:Cinteger, init:Tinteger}|
			{ name: 'natural', node:Cnatural, init:Tnatural}>
	};
	public readonly inferences:{
		number: () => interface_.Cnumber__type__properties
	} = {
		number: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.key.ref)
			.then(context => context?.properties.type.cast('number'))
			.result!, true)
	}
	constructor(init:Tnumber, public parent:Cproperties) {
		super();
		const $this = this;
		this.properties = {
			type: new Cnumber.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?number`; }
}
export type Tinteger = {
	'value':number;
};
export class Cinteger extends AlanNode {
	public readonly properties:{
		readonly value:number
	};
	public readonly inferences:{
		integer_type: () => interface_.Cinteger
	} = {
		integer_type: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.inferences.number()).then(context => context?.properties.type)
			.then(context => context?.properties.set.cast('integer'))
			.result!, true)
	}
	constructor(init:Tinteger, public parent:Cnumber) {
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
export type Tnatural = {
	'value':number;
};
export class Cnatural extends AlanNode {
	public readonly properties:{
		readonly value:number
	};
	public readonly inferences:{
		natural_type: () => interface_.Cnatural
	} = {
		natural_type: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.inferences.number()).then(context => context?.properties.type)
			.then(context => context?.properties.set.cast('natural'))
			.result!, true)
	}
	constructor(init:Tnatural, public parent:Cnumber) {
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
export type Tstate_group = {
	'arguments':Tcommand_arguments;
	'state':string;
};
export class Cstate_group extends AlanNode {
	public readonly properties:{
		readonly arguments:Ccommand_arguments,
		readonly state:Cstate_group.Dstate
	};
	public readonly inferences:{
		state_group: () => interface_.Cstate_group__type__properties
	} = {
		state_group: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.key.ref)
			.then(context => context?.properties.type.cast('state group'))
			.result!, true)
	}
	constructor(init:Tstate_group, public parent:Cproperties) {
		super();
		const $this = this;
		this.properties = {
			arguments: new Cstate_group.Darguments(init['arguments'], $this),
			state: new Cstate_group.Dstate(init['state'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?state group`; }
}
export type Ttext = {
	'value':string;
};
export class Ctext extends AlanNode {
	public readonly properties:{
		readonly value:string
	};
	public readonly inferences:{
		text: () => interface_.Ctext__type__properties
	} = {
		text: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.key.ref)
			.then(context => context?.properties.type.cast('text'))
			.result!, true)
	}
	constructor(init:Ttext, public parent:Cproperties) {
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
	public get root() { return this.location.root; }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/context keys`; }
}
export class Kcontext_keys__context_keys extends Reference<interface_.Ccontext_keys, string> {
	constructor(key:string, $this:Ccontext_keys__context_keys) {
		super(key, cache(() => resolve($this.parent).then(() => $this.parent).then(context => context?.root.input.interface)
			.then(context => context?.properties.context_keys.get(this.entry))
			.result!, true))
	}
}
export type Tcontext_keys__context_keys = {
	'value':string;
};
export class Ccontext_keys__context_keys extends AlanNode {
	public key:Kcontext_keys__context_keys;
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
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/context keys[${this.key.entry}]`; }
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
		result_node: () => interface_.Cnode;
	} = {
		result_node: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.has_steps.state.node.output.result_node())
				.result!
			).result!)
	};
	constructor(init:Tid_path, public location:AlanNode, public input: {
		context_node: () => interface_.Cnode
	}) {
		super();
		const $this = this;
		this.properties = {
			has_steps: new Cid_path.Dhas_steps(init['has steps'], $this)
		};
	}
	public get root() { return this.location.root; }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/id path`; }
}
export type Tno = {
};
export class Cno extends AlanNode {
	public readonly output:{
		result_node: () => interface_.Cnode;
	} = {
		result_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.context_node())
				.result!
			).result!, false)
	}
	constructor(init:Tno, public parent:Cid_path) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has steps?no`; }
}
export type Tyes = {
	'tail':Tid_path;
	'type':['collection entry', Tcollection_entry]|['group', Tgroup__type__yes]|['state', Tstate];
};
export class Cyes extends AlanNode {
	public readonly properties:{
		readonly tail:Cid_path,
		readonly type:Cyes.Dtype<
			{ name: 'collection entry', node:Ccollection_entry, init:Tcollection_entry}|
			{ name: 'group', node:Cgroup__type__yes, init:Tgroup__type__yes}|
			{ name: 'state', node:Cstate, init:Tstate}>
	};
	public readonly output:{
		result_node: () => interface_.Cnode;
	} = {
		result_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.tail)
				.then(context => context?.component_root.output.result_node())
				.result!
			).result!, false)
	}
	constructor(init:Tyes, public parent:Cid_path) {
		super();
		const $this = this;
		this.properties = {
			tail: new Cyes.Dtail(init['tail'], $this),
			type: new Cyes.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has steps?yes`; }
}
export type Tcollection_entry = {
	'collection':string;
	'id':string;
};
export class Ccollection_entry extends AlanNode {
	public readonly properties:{
		readonly collection:Ccollection_entry.Dcollection,
		readonly id:string
	};
	public readonly output:{
		result_node: () => interface_.Cnode;
	} = {
		result_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.collection.ref)
				.then(context => context?.properties.node)
				.result!
			).result!, false)
	}
	constructor(init:Tcollection_entry, public parent:Cyes) {
		super();
		const $this = this;
		this.properties = {
			collection: new Ccollection_entry.Dcollection(init['collection'], $this),
			id: init['id']
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?collection entry`; }
}
export type Tgroup__type__yes = {
	'group':string;
};
export class Cgroup__type__yes extends AlanNode {
	public readonly properties:{
		readonly group:Cgroup__type__yes.Dgroup
	};
	public readonly output:{
		result_node: () => interface_.Cnode;
	} = {
		result_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.group.ref)
				.then(context => context?.properties.node)
				.result!
			).result!, false)
	}
	constructor(init:Tgroup__type__yes, public parent:Cyes) {
		super();
		const $this = this;
		this.properties = {
			group: new Cgroup__type__yes.Dgroup(init['group'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?group`; }
}
export type Tstate = {
	'state':string;
	'state group':string;
};
export class Cstate extends AlanNode {
	public readonly properties:{
		readonly state:Cstate.Dstate,
		readonly state_group:Cstate.Dstate_group
	};
	public readonly output:{
		result_node: () => interface_.Cnode;
	} = {
		result_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.state.ref)
				.then(context => context?.properties.node)
				.result!
			).result!, false)
	}
	constructor(init:Tstate, public parent:Cyes) {
		super();
		const $this = this;
		this.properties = {
			state: new Cstate.Dstate(init['state'], $this),
			state_group: new Cstate.Dstate_group(init['state group'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?state`; }
}

export type Tinterface_command = {
	'arguments':Tcommand_arguments;
	'command':string;
	'context keys':Tcontext_keys__interface_command;
	'context node':Tid_path;
};
export class Cinterface_command extends AlanNode {
	public key?:string;
	public get root() { return this; }
	public readonly properties:{
		readonly arguments:Ccommand_arguments,
		readonly command:Cinterface_command.Dcommand,
		readonly context_keys:Ccontext_keys__interface_command,
		readonly context_node:Cid_path
	};
	constructor(init:Tinterface_command, public readonly input: {
	'interface':interface_.Cinterface}, public lazy_eval:boolean) {
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
}

/* property classes */export namespace Ccommand_arguments {
	export class Dproperties extends AlanDictionary<{ node:Cproperties, init:Tproperties},Ccommand_arguments> {
		protected graph_iterator(graph:string):(node:Cproperties) => Cproperties { throw new Error(`Dictionary has no graph iterators.`); }
		protected initialize(parent:Ccommand_arguments, key:string, entry_init:Tproperties) { return new Cproperties(key, entry_init, parent); }
		protected resolve = resolve_properties
		protected get path() { return `${this.parent.path}/properties`; }
		constructor(data:Tcommand_arguments['properties'], parent:Ccommand_arguments) {
			super(data, parent);
		}
	}
}
export namespace Cproperties {
	export class Dtype<T extends
		{ name: 'collection', node:Ccollection, init:Tcollection}|
		{ name: 'file', node:Cfile, init:Tfile}|
		{ name: 'group', node:Cgroup__type__properties, init:Tgroup__type__properties}|
		{ name: 'number', node:Cnumber, init:Tnumber}|
		{ name: 'state group', node:Cstate_group, init:Tstate_group}|
		{ name: 'text', node:Ctext, init:Ttext}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'collection': return (init:Tcollection, parent:Cproperties) => new Ccollection(init, parent);
				case 'file': return (init:Tfile, parent:Cproperties) => new Cfile(init, parent);
				case 'group': return (init:Tgroup__type__properties, parent:Cproperties) => new Cgroup__type__properties(init, parent);
				case 'number': return (init:Tnumber, parent:Cproperties) => new Cnumber(init, parent);
				case 'state group': return (init:Tstate_group, parent:Cproperties) => new Cstate_group(init, parent);
				case 'text': return (init:Ttext, parent:Cproperties) => new Ctext(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'collection': return resolve_collection;
				case 'file': return resolve_file;
				case 'group': return resolve_group__type__properties;
				case 'number': return resolve_number;
				case 'state group': return resolve_state_group;
				case 'text': return resolve_text;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tproperties['type'], parent:Cproperties) {
			super(data, parent);
		}
	}
}
export namespace Ccollection {
	export class Dentries extends AlanSet<{ node:Centries, init:Tentries},Ccollection> {
		protected initialize(parent:Ccollection, entry_init:Tentries) { return new Centries(entry_init, parent); }
		protected resolve = resolve_entries
		protected get path() { return `${this.parent.path}/entries`; }
		constructor(data:Tcollection['entries'], parent:Ccollection) {
			super(data, parent);
		}
	}
}
export namespace Centries {
	export class Darguments extends Ccommand_arguments {
		constructor(data:Tentries['arguments'], parent:Centries) {
			super(data, parent, {
				parameter_definition: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.inferences.collection()).then(context => context?.properties.parameters)
						.result!
					).result!, false)
			})
		}
	}
}
export namespace Cfile {
}
export namespace Cgroup__type__properties {
	export class Darguments extends Ccommand_arguments {
		constructor(data:Tgroup__type__properties['arguments'], parent:Cgroup__type__properties) {
			super(data, parent, {
				parameter_definition: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.inferences.group()).then(context => context?.properties.parameters)
						.result!
					).result!, false)
			})
		}
	}
}
export namespace Cnumber {
	export class Dtype<T extends
		{ name: 'integer', node:Cinteger, init:Tinteger}|
		{ name: 'natural', node:Cnatural, init:Tnatural}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'integer': return (init:Tinteger, parent:Cnumber) => new Cinteger(init, parent);
				case 'natural': return (init:Tnatural, parent:Cnumber) => new Cnatural(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'integer': return resolve_integer;
				case 'natural': return resolve_natural;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tnumber['type'], parent:Cnumber) {
			super(data, parent);
		}
	}
}
export namespace Cinteger {
}
export namespace Cnatural {
}
export namespace Cstate_group {
	export class Darguments extends Ccommand_arguments {
		constructor(data:Tstate_group['arguments'], parent:Cstate_group) {
			super(data, parent, {
				parameter_definition: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.properties.state.ref)
						.then(context => context?.properties.parameters)
						.result!
					).result!, false)
			})
		}
	}
	export class Dstate extends Reference<interface_.Cstates__state_group__type__properties,string> {

		constructor(data:string, $this:Cstate_group) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.inferences.state_group()).then(context => context?.properties.states.get(this.entry))
				.result!, true))
		}
	}
}
export namespace Ctext {
}
export namespace Ccontext_keys__interface_command {
	export class Dcontext_keys extends AlanDictionary<{ node:Ccontext_keys__context_keys, init:Tcontext_keys__context_keys},Ccontext_keys__interface_command> {
		protected graph_iterator(graph:string):(node:Ccontext_keys__context_keys) => Ccontext_keys__context_keys { throw new Error(`Dictionary has no graph iterators.`); }
		protected initialize(parent:Ccontext_keys__interface_command, key:string, entry_init:Tcontext_keys__context_keys) { return new Ccontext_keys__context_keys(key, entry_init, parent); }
		protected resolve = resolve_context_keys__context_keys
		protected get path() { return `${this.parent.path}/context keys`; }
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
		protected resolver(state:T['name']) {
			switch (state) {
				case 'no': return resolve_no;
				case 'yes': return resolve_yes;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tid_path['has steps'], parent:Cid_path) {
			super(data, parent);
		}
	}
}
export namespace Cyes {
	export class Dtail extends Cid_path {
		constructor(data:Tyes['tail'], parent:Cyes) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.properties.type.state.node.output.result_node())
						.result!
					).result!, false)
			})
		}
	}
	export class Dtype<T extends
		{ name: 'collection entry', node:Ccollection_entry, init:Tcollection_entry}|
		{ name: 'group', node:Cgroup__type__yes, init:Tgroup__type__yes}|
		{ name: 'state', node:Cstate, init:Tstate}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'collection entry': return (init:Tcollection_entry, parent:Cyes) => new Ccollection_entry(init, parent);
				case 'group': return (init:Tgroup__type__yes, parent:Cyes) => new Cgroup__type__yes(init, parent);
				case 'state': return (init:Tstate, parent:Cyes) => new Cstate(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'collection entry': return resolve_collection_entry;
				case 'group': return resolve_group__type__yes;
				case 'state': return resolve_state;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tyes['type'], parent:Cyes) {
			super(data, parent);
		}
	}
}
export namespace Ccollection_entry {
	export class Dcollection extends Reference<interface_.Ccollection__type__property,string> {

		constructor(data:string, $this:Ccollection_entry) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.component_root.input.context_node())
				.then(context => context?.properties.attributes.get(this.entry))

				.then(context => context?.properties.type.cast('property').properties.type.cast('collection')).result!, true))
		}
	}
}
export namespace Cgroup__type__yes {
	export class Dgroup extends Reference<interface_.Cgroup__type__property,string> {

		constructor(data:string, $this:Cgroup__type__yes) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.component_root.input.context_node())
				.then(context => context?.properties.attributes.get(this.entry))

				.then(context => context?.properties.type.cast('property').properties.type.cast('group')).result!, true))
		}
	}
}
export namespace Cstate {
	export class Dstate extends Reference<interface_.Cstates__state_group__type__property,string> {

		constructor(data:string, $this:Cstate) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.properties.state_group.ref)
				.then(context => context?.properties.states.get(this.entry))
				.result!, true))
		}
	}
	export class Dstate_group extends Reference<interface_.Cstate_group__type__property,string> {

		constructor(data:string, $this:Cstate) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.component_root.input.context_node())
				.then(context => context?.properties.attributes.get(this.entry))

				.then(context => context?.properties.type.cast('property').properties.type.cast('state group')).result!, true))
		}
	}
}
export namespace Cinterface_command {
	export class Darguments extends Ccommand_arguments {
		constructor(data:Tinterface_command['arguments'], parent:Cinterface_command) {
			super(data, parent, {
				parameter_definition: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.properties.command.ref)
						.then(context => context?.properties.parameters)
						.result!
					).result!, false)
			})
		}
	}
	export class Dcommand extends Reference<interface_.Ccommand,string> {

		constructor(data:string, $this:Cinterface_command) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.properties.context_node)
				.then(context => context?.component_root.output.result_node())
				.then(context => context?.properties.attributes.get(this.entry))

				.then(context => context?.properties.type.cast('command')).result!, true))
		}
	}
	export class Dcontext_keys extends Ccontext_keys__interface_command {
		constructor(data:Tinterface_command['context keys'], parent:Cinterface_command) {
			super(data, parent)
		}
	}
	export class Dcontext_node extends Cid_path {
		constructor(data:Tinterface_command['context node'], parent:Cinterface_command) {
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
function auto_defer<T extends (...args:any) => void>(root:Cinterface_command, callback:T):T {
	return callback;
}
function resolve_entries(obj:Centries, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_command_arguments(obj.properties.arguments, detach);
}
function resolve_collection(obj:Ccollection, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Ccollection__type__properties>obj.inferences.collection)(detach) !== undefined || detach);
	obj.properties.entries.forEach(entry => resolve_entries(entry, detach));
}
function resolve_file(obj:Cfile, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cfile__type__properties>obj.inferences.file)(detach) !== undefined || detach);
}
function resolve_group__type__properties(obj:Cgroup__type__properties, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cgroup__type__properties>obj.inferences.group)(detach) !== undefined || detach);
	resolve_command_arguments(obj.properties.arguments, detach);
}
function resolve_integer(obj:Cinteger, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cinteger>obj.inferences.integer_type)(detach) !== undefined || detach);
}
function resolve_natural(obj:Cnatural, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cnatural>obj.inferences.natural_type)(detach) !== undefined || detach);
}
function resolve_number(obj:Cnumber, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cnumber__type__properties>obj.inferences.number)(detach) !== undefined || detach);
	obj.properties.type.switch({
		'integer': node => resolve_integer(node, detach),
		'natural': node => resolve_natural(node, detach)
	});
}
function resolve_state_group(obj:Cstate_group, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cstate_group__type__properties>obj.inferences.state_group)(detach) !== undefined || detach);
	resolve_command_arguments(obj.properties.arguments, detach);
	assert((<(detach?:boolean) => interface_.Cstates__state_group__type__properties>(obj.properties.state as any).resolve)(detach) !== undefined || detach);
}
function resolve_text(obj:Ctext, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Ctext__type__properties>obj.inferences.text)(detach) !== undefined || detach);
}
function resolve_properties(obj:Cproperties, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cproperties>(obj.key as any).resolve)(detach) !== undefined || detach);
	obj.properties.type.switch({
		'collection': node => resolve_collection(node, detach),
		'file': node => resolve_file(node, detach),
		'group': node => resolve_group__type__properties(node, detach),
		'number': node => resolve_number(node, detach),
		'state group': node => resolve_state_group(node, detach),
		'text': node => resolve_text(node, detach)
	});
}
function resolve_command_arguments(obj:Ccommand_arguments, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.properties.forEach(entry => resolve_properties(entry, detach));
}
function resolve_context_keys__context_keys(obj:Ccontext_keys__context_keys, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Ccontext_keys>(obj.key as any).resolve)(detach) !== undefined || detach);
}
function resolve_context_keys__interface_command(obj:Ccontext_keys__interface_command, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.context_keys.forEach(entry => resolve_context_keys__context_keys(entry, detach));
}
function resolve_no(obj:Cno, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_collection_entry(obj:Ccollection_entry, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Ccollection__type__property>(obj.properties.collection as any).resolve)(detach) !== undefined || detach);
}
function resolve_group__type__yes(obj:Cgroup__type__yes, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cgroup__type__property>(obj.properties.group as any).resolve)(detach) !== undefined || detach);
}
function resolve_state(obj:Cstate, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cstates__state_group__type__property>(obj.properties.state as any).resolve)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cstate_group__type__property>(obj.properties.state_group as any).resolve)(detach) !== undefined || detach);
}
function resolve_yes(obj:Cyes, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_id_path(obj.properties.tail, detach);
	obj.properties.type.switch({
		'collection entry': node => resolve_collection_entry(node, detach),
		'group': node => resolve_group__type__yes(node, detach),
		'state': node => resolve_state(node, detach)
	});
}
function resolve_id_path(obj:Cid_path, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.has_steps.switch({
		'no': node => resolve_no(node, detach),
		'yes': node => resolve_yes(node, detach)
	});
}
function resolve_interface_command(obj:Cinterface_command, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_command_arguments(obj.properties.arguments, detach);
	assert((<(detach?:boolean) => interface_.Ccommand>(obj.properties.command as any).resolve)(detach) !== undefined || detach);
	resolve_context_keys__interface_command(obj.properties.context_keys, detach);
	resolve_id_path(obj.properties.context_node, detach);
}

export namespace Cinterface_command {
	export function create(init:Tinterface_command, input: {
		'interface':interface_.Cinterface
	}, lazy_eval:boolean = false):Cinterface_command {
		const instance = new Cinterface_command(init, input as any, lazy_eval);
		if (!lazy_eval) resolve_interface_command(instance);
		return instance;
	};
}
