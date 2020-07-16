import * as interface_subscription from './alan_api';
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
	public abstract get root():Cinterface_subscription;
	public is(other:AlanNode):boolean {
		return this === other;
	}
}

/* alan objects */
export type Tcontext_keys__interface_subscription = {
	'context keys':Record<string, Tcontext_keys__context_keys>;
};
export class Ccontext_keys__interface_subscription extends AlanNode {
	public readonly properties:{
		readonly context_keys:Ccontext_keys__interface_subscription.Dcontext_keys
	};
	constructor(init:Tcontext_keys__interface_subscription, public location:AlanNode) {
		super();
		const $this = this;
		this.properties = {
			context_keys: new Ccontext_keys__interface_subscription.Dcontext_keys(init['context keys'], $this)
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
	constructor(key:string, init:Tcontext_keys__context_keys, public parent:Ccontext_keys__interface_subscription) {
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

export type Tinterface_subscription = {
	'context keys':Tcontext_keys__interface_subscription;
	'send initialization data':'no'|['no', {}]|'yes'|['yes', {}];
};
export class Cinterface_subscription extends AlanNode {
	public key?:string;
	public get root() { return this; }
	public readonly properties:{
		readonly context_keys:Ccontext_keys__interface_subscription,
		readonly send_initialization_data:Cinterface_subscription.Dsend_initialization_data<
			{ name: 'no', node:Cno, init:Tno}|
			{ name: 'yes', node:Cyes, init:Tyes}>
	};
	constructor(init:Tinterface_subscription, public readonly input: {
	'interface':interface_.Cinterface}, public lazy_eval:boolean) {
		super();
		const $this = this;
		this.properties = {
			context_keys: new Cinterface_subscription.Dcontext_keys(init['context keys'], $this),
			send_initialization_data: new Cinterface_subscription.Dsend_initialization_data(init['send initialization data'], $this)
		};
	}
	public get path() { return ``; }
}
export type Tno = {
};
export class Cno extends AlanNode {
	constructor(init:Tno, public parent:Cinterface_subscription) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/send initialization data?no`; }
}
export type Tyes = {
};
export class Cyes extends AlanNode {
	constructor(init:Tyes, public parent:Cinterface_subscription) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/send initialization data?yes`; }
}

/* property classes */export namespace Ccontext_keys__interface_subscription {
	export class Dcontext_keys extends AlanDictionary<{ node:Ccontext_keys__context_keys, init:Tcontext_keys__context_keys},Ccontext_keys__interface_subscription> {
		protected graph_iterator(graph:string):(node:Ccontext_keys__context_keys) => Ccontext_keys__context_keys { throw new Error(`Dictionary has no graph iterators.`); }
		protected initialize(parent:Ccontext_keys__interface_subscription, key:string, entry_init:Tcontext_keys__context_keys) { return new Ccontext_keys__context_keys(key, entry_init, parent); }
		protected resolve = resolve_context_keys__context_keys
		protected get path() { return `${this.parent.path}/context keys`; }
		constructor(data:Tcontext_keys__interface_subscription['context keys'], parent:Ccontext_keys__interface_subscription) {
			super(data, parent);
		}
	}
}
export namespace Ccontext_keys__context_keys {
}
export namespace Cinterface_subscription {
	export class Dcontext_keys extends Ccontext_keys__interface_subscription {
		constructor(data:Tinterface_subscription['context keys'], parent:Cinterface_subscription) {
			super(data, parent)
		}
	}
	export class Dsend_initialization_data<T extends
		{ name: 'no', node:Cno, init:Tno}|
		{ name: 'yes', node:Cyes, init:Tyes}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno, parent:Cinterface_subscription) => new Cno(init, parent);
				case 'yes': return (init:Tyes, parent:Cinterface_subscription) => new Cyes(init, parent);
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
		constructor(data:Tinterface_subscription['send initialization data'], parent:Cinterface_subscription) {
			super(data, parent);
		}
	}
}
/* de(resolution) */
function auto_defer<T extends (...args:any) => void>(root:Cinterface_subscription, callback:T):T {
	return callback;
}
function resolve_context_keys__context_keys(obj:Ccontext_keys__context_keys, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Ccontext_keys>(obj.key as any).resolve)(detach) !== undefined || detach);
}
function resolve_context_keys__interface_subscription(obj:Ccontext_keys__interface_subscription, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.context_keys.forEach(entry => resolve_context_keys__context_keys(entry, detach));
}
function resolve_no(obj:Cno, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_yes(obj:Cyes, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_interface_subscription(obj:Cinterface_subscription, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_context_keys__interface_subscription(obj.properties.context_keys, detach);
	obj.properties.send_initialization_data.switch({
		'no': node => resolve_no(node, detach),
		'yes': node => resolve_yes(node, detach)
	});
}

export namespace Cinterface_subscription {
	export function create(init:Tinterface_subscription, input: {
		'interface':interface_.Cinterface
	}, lazy_eval:boolean = false):Cinterface_subscription {
		const instance = new Cinterface_subscription(init, input as any, lazy_eval);
		if (!lazy_eval) resolve_interface_subscription(instance);
		return instance;
	};
}
