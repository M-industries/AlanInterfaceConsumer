import * as interface_ from './alan_api';

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
	public abstract get root():Cinterface;
	public is(other:AlanNode):boolean {
		return this === other;
	}
}

/* alan objects */
type Vchoice = { name: 'state group parameter', definition: Cstate_group__type__properties}|{ name: 'state group property', definition: Cstate_group__type__property}
export class Cchoice extends AlanObject {
	constructor(
		public readonly variant:Vchoice) { super(); }
	public definitions:{
		value: Cvalue;
		value_type: Cvalue_type;
	} = {
		value: new Cvalue({name:'choice', definition: this}, {
			value_type: cache(() => resolve(this).then(this_context => resolve(this_context)
					.then(context => context?.definitions.value_type)
					.result!
				).result!, false)
		}),
		value_type: new Cvalue_type({name:'choice', definition: this})
	}
	public cast<K extends Vchoice['name']>(_variant:K):Extract<Vchoice, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vchoice['name']]:(($:Extract<Vchoice, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/choice`; }
	public is(other:Cchoice):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
type Vcollection__interface = { name: 'node collection', definition: Ccollection__type__property}|{ name: 'parameter collection', definition: Ccollection__type__properties}
export class Ccollection__interface extends AlanObject {
	constructor(
		public readonly variant:Vcollection__interface, public input: {
			key_member: () => interface_.Cmember,
			value: () => interface_.Cobject
		}) { super(); }
	public definitions:{
		entity: Centity;
		value: Cvalue;
	} = {
		entity: new Centity({name:'collection', definition: this}),
		value: new Cvalue({name:'collection', definition: this}, {
			value_type: cache(() => resolve(this).then(this_context => resolve(this_context)
					.then(context => context?.component_root.input.value())
					.then(context => context?.definitions.value_type)
					.result!
				).result!, false)
		})
	}
	public readonly output:{
		key_member: () => interface_.Cmember;
		value: () => interface_.Cobject;
	} = {
		key_member: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.key_member())
				.result!
			).result!),
		value: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.value())
				.result!
			).result!)
	};
	public cast<K extends Vcollection__interface['name']>(_variant:K):Extract<Vcollection__interface, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vcollection__interface['name']]:(($:Extract<Vcollection__interface, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/collection`; }
	public is(other:Ccollection__interface):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
type Vcontext_constraint = { name: 'context node', definition: (typeof Ccontext_constraint.Pcontext_node)}|{ name: 'none', definition: (typeof Ccontext_constraint.Pnone)}
export class Ccontext_constraint extends AlanObject {
	public static Pcontext_node:Ccontext_constraint = new class PrimitiveInstance extends Ccontext_constraint {
		constructor () {
			super({name: 'context node', definition: undefined as unknown as Ccontext_constraint})
			this.variant.definition = this;
		}
	}
	public static Pnone:Ccontext_constraint = new class PrimitiveInstance extends Ccontext_constraint {
		constructor () {
			super({name: 'none', definition: undefined as unknown as Ccontext_constraint})
			this.variant.definition = this;
		}
	}
	constructor(
		public readonly variant:Vcontext_constraint) { super(); }
	public cast<K extends Vcontext_constraint['name']>(_variant:K):Extract<Vcontext_constraint, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vcontext_constraint['name']]:(($:Extract<Vcontext_constraint, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/context constraint`; }
	public is(other:Ccontext_constraint):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
export type Tcontext_node_path = {
	'context':'context node'|['context node', {}]|['parameter definition', Tparameter_definition__context]|'root'|['root', {}]|'this node'|['this node', {}];
};
export class Ccontext_node_path extends AlanNode {
	public readonly properties:{
		readonly context:Ccontext_node_path.Dcontext<
			{ name: 'context node', node:Ccontext_node, init:Tcontext_node}|
			{ name: 'parameter definition', node:Cparameter_definition__context, init:Tparameter_definition__context}|
			{ name: 'root', node:Croot, init:Troot}|
			{ name: 'this node', node:Cthis_node, init:Tthis_node}>
	};
	public readonly output:{
		direction: () => interface_.Cdirection;
		node: () => interface_.Cnode;
	} = {
		direction: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.context.state.node.output.direction())
				.result!
			).result!),
		node: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.context.state.node.output.node())
				.result!
			).result!)
	};
	constructor(init:Tcontext_node_path, public location:AlanNode, public input: {
		context_constraint: () => interface_.Ccontext_constraint,
		context_direction: () => interface_.Cdirection,
		context_node: () => interface_.Cnode,
		this: () => interface_.Cobject
	}) {
		super();
		const $this = this;
		this.properties = {
			context: new Ccontext_node_path.Dcontext(init['context'], $this)
		};
	}
	public get root() { return this.location.root; }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/context node path`; }
}
export type Tcontext_node = {
};
export class Ccontext_node extends AlanNode {
	public readonly output:{
		direction: () => interface_.Cdirection;
		node: () => interface_.Cnode;
	} = {
		direction: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.context_direction())
				.result!
			).result!, false),
		node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.context_node())
				.result!
			).result!, false)
	}
	constructor(init:Tcontext_node, public parent:Ccontext_node_path) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/context?context node`; }
}
export type Tparameter_definition__context = {
	'head':Tcontext_parameter_path;
	'type':['reference', Treference__type__parameter_definition]|['state context rule', Tstate_context_rule__type__parameter_definition];
};
export class Cparameter_definition__context extends AlanNode {
	public readonly properties:{
		readonly head:Ccontext_parameter_path,
		readonly type:Cparameter_definition__context.Dtype<
			{ name: 'reference', node:Creference__type__parameter_definition, init:Treference__type__parameter_definition}|
			{ name: 'state context rule', node:Cstate_context_rule__type__parameter_definition, init:Tstate_context_rule__type__parameter_definition}>
	};
	public readonly output:{
		direction: () => interface_.Cdirection;
		node: () => interface_.Cnode;
	} = {
		direction: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.type.state.node.output.direction())
				.result!
			).result!, false),
		node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.type.state.node.output.node())
				.result!
			).result!, false)
	}
	public readonly inferences:{
		context_parameter: () => interface_.Cparameter_definition__interface,
		unbounded_navigation: () => interface_.Ccontext_constraint
	} = {
		context_parameter: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.component_root.input.this())
			.then(context => context?.cast('parameter'))
			.result!, true),
		unbounded_navigation: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.component_root.input.context_constraint())
			.then(context => context?.cast('none'))
			.result!, true)
	}
	constructor(init:Tparameter_definition__context, public parent:Ccontext_node_path) {
		super();
		const $this = this;
		this.properties = {
			head: new Cparameter_definition__context.Dhead(init['head'], $this),
			type: new Cparameter_definition__context.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/context?parameter definition`; }
}
export type Treference__type__parameter_definition = {
	'reference':string;
};
export class Creference__type__parameter_definition extends AlanNode {
	public readonly properties:{
		readonly reference:Creference__type__parameter_definition.Dreference
	};
	public readonly output:{
		direction: () => interface_.Cdirection;
		node: () => interface_.Cnode;
	} = {
		direction: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.reference.ref)
				.then(context => context?.properties.referencer)
				.then(context => context?.component_root.output.direction())
				.result!
			).result!, false),
		node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.reference.ref)
				.then(context => context?.properties.referencer)
				.then(context => context?.component_root.output.referenced_node())
				.result!
			).result!, false)
	}
	constructor(init:Treference__type__parameter_definition, public parent:Cparameter_definition__context) {
		super();
		const $this = this;
		this.properties = {
			reference: new Creference__type__parameter_definition.Dreference(init['reference'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?reference`; }
}
export type Tstate_context_rule__type__parameter_definition = {
	'rule':string;
};
export class Cstate_context_rule__type__parameter_definition extends AlanNode {
	public readonly properties:{
		readonly rule:Cstate_context_rule__type__parameter_definition.Drule
	};
	public readonly output:{
		direction: () => interface_.Cdirection;
		node: () => interface_.Cnode;
	} = {
		direction: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.rule.ref)
				.then(context => context?.properties.tail)
				.then(context => context?.component_root.output.direction())
				.result!
			).result!, false),
		node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.rule.ref)
				.then(context => context?.properties.tail)
				.then(context => context?.component_root.output.node())
				.result!
			).result!, false)
	}
	public readonly inferences:{
		state: () => interface_.Cstates__state_group__type__properties
	} = {
		state: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.properties.head)
			.then(context => context?.component_root.output.parameter())
			.then(context => context?.component_root.output.location())
			.then(context => context?.cast('state'))
			.result!, true)
	}
	constructor(init:Tstate_context_rule__type__parameter_definition, public parent:Cparameter_definition__context) {
		super();
		const $this = this;
		this.properties = {
			rule: new Cstate_context_rule__type__parameter_definition.Drule(init['rule'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?state context rule`; }
}
export type Troot = {
};
export class Croot extends AlanNode {
	public readonly output:{
		direction: () => interface_.Cdirection;
		node: () => interface_.Cnode;
	} = {
		direction: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(() => interface_.Cdirection.Pself)
				.result!
			).result!, false),
		node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.root)
				.then(context => context?.properties.root)
				.result!
			).result!, false)
	}
	public readonly inferences:{
		unbounded_navigation: () => interface_.Ccontext_constraint
	} = {
		unbounded_navigation: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.component_root.input.context_constraint())
			.then(context => context?.cast('none'))
			.result!, true)
	}
	constructor(init:Troot, public parent:Ccontext_node_path) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/context?root`; }
}
export type Tthis_node = {
};
export class Cthis_node extends AlanNode {
	public readonly output:{
		direction: () => interface_.Cdirection;
		node: () => interface_.Cnode;
	} = {
		direction: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(() => interface_.Cdirection.Pself)
				.result!
			).result!, false),
		node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.this())
				.then(context => context?.component_root.output.this_node())
				.result!
			).result!, false)
	}
	public readonly inferences:{
		unbounded_navigation: () => interface_.Ccontext_constraint
	} = {
		unbounded_navigation: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.component_root.input.context_constraint())
			.then(context => context?.cast('none'))
			.result!, true)
	}
	constructor(init:Tthis_node, public parent:Ccontext_node_path) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/context?this node`; }
}
export type Tcontext_parameter_path = {
	'has steps':'no'|['no', {}]|['yes', Tyes__has_steps__context_parameter_path];
};
export class Ccontext_parameter_path extends AlanNode {
	public readonly properties:{
		readonly has_steps:Ccontext_parameter_path.Dhas_steps<
			{ name: 'no', node:Cno__has_steps__context_parameter_path, init:Tno__has_steps__context_parameter_path}|
			{ name: 'yes', node:Cyes__has_steps__context_parameter_path, init:Tyes__has_steps__context_parameter_path}>
	};
	public readonly output:{
		parameter: () => interface_.Cparameter_definition__interface;
	} = {
		parameter: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.has_steps.state.node.output.parameter())
				.result!
			).result!)
	};
	constructor(init:Tcontext_parameter_path, public location:AlanNode, public input: {
		context_parameter: () => interface_.Cparameter_definition__interface
	}) {
		super();
		const $this = this;
		this.properties = {
			has_steps: new Ccontext_parameter_path.Dhas_steps(init['has steps'], $this)
		};
	}
	public get root() { return this.location.root; }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/context parameter path`; }
}
export type Tno__has_steps__context_parameter_path = {
};
export class Cno__has_steps__context_parameter_path extends AlanNode {
	public readonly output:{
		parameter: () => interface_.Cparameter_definition__interface;
	} = {
		parameter: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.context_parameter())
				.result!
			).result!, false)
	}
	constructor(init:Tno__has_steps__context_parameter_path, public parent:Ccontext_parameter_path) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has steps?no`; }
}
export type Tyes__has_steps__context_parameter_path = {
	'tail':Tcontext_parameter_path;
	'type':['group', Tgroup__type__yes__has_steps__context_parameter_path]|'parent'|['parent', {}];
};
export class Cyes__has_steps__context_parameter_path extends AlanNode {
	public readonly properties:{
		readonly tail:Ccontext_parameter_path,
		readonly type:Cyes__has_steps__context_parameter_path.Dtype<
			{ name: 'group', node:Cgroup__type__yes__has_steps__context_parameter_path, init:Tgroup__type__yes__has_steps__context_parameter_path}|
			{ name: 'parent', node:Cparent__type__yes__has_steps__context_parameter_path, init:Tparent__type__yes__has_steps__context_parameter_path}>
	};
	public readonly output:{
		parameter: () => interface_.Cparameter_definition__interface;
	} = {
		parameter: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.tail)
				.then(context => context?.component_root.output.parameter())
				.result!
			).result!, false)
	}
	constructor(init:Tyes__has_steps__context_parameter_path, public parent:Ccontext_parameter_path) {
		super();
		const $this = this;
		this.properties = {
			tail: new Cyes__has_steps__context_parameter_path.Dtail(init['tail'], $this),
			type: new Cyes__has_steps__context_parameter_path.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has steps?yes`; }
}
export type Tgroup__type__yes__has_steps__context_parameter_path = {
	'group':string;
};
export class Cgroup__type__yes__has_steps__context_parameter_path extends AlanNode {
	public readonly properties:{
		readonly group:Cgroup__type__yes__has_steps__context_parameter_path.Dgroup
	};
	public readonly output:{
		parameter: () => interface_.Cparameter_definition__interface;
	} = {
		parameter: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.group.ref)
				.then(context => context?.properties.parameters)
				.result!
			).result!, false)
	}
	constructor(init:Tgroup__type__yes__has_steps__context_parameter_path, public parent:Cyes__has_steps__context_parameter_path) {
		super();
		const $this = this;
		this.properties = {
			group: new Cgroup__type__yes__has_steps__context_parameter_path.Dgroup(init['group'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?group`; }
}
export type Tparent__type__yes__has_steps__context_parameter_path = {
};
export class Cparent__type__yes__has_steps__context_parameter_path extends AlanNode {
	public readonly output:{
		parameter: () => interface_.Cparameter_definition__interface;
	} = {
		parameter: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.inferences.parent_parameter()).result!
			).result!, false)
	}
	public readonly inferences:{
		parent_parameter: () => interface_.Cparameter_definition__interface
	} = {
		parent_parameter: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.component_root.input.context_parameter())
			.then(context => context?.component_root.output.parent())
			.then(context => context?.cast('parameter'))
			.result!, true)
	}
	constructor(init:Tparent__type__yes__has_steps__context_parameter_path, public parent:Cyes__has_steps__context_parameter_path) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?parent`; }
}
type Vdependency = { name: 'allowed', definition: (typeof Cdependency.Pallowed)}|{ name: 'disallowed', definition: (typeof Cdependency.Pdisallowed)}
export class Cdependency extends AlanObject {
	public static Pallowed:Cdependency = new class PrimitiveInstance extends Cdependency {
		constructor () {
			super({name: 'allowed', definition: undefined as unknown as Cdependency})
			this.variant.definition = this;
		}
	}
	public static Pdisallowed:Cdependency = new class PrimitiveInstance extends Cdependency {
		constructor () {
			super({name: 'disallowed', definition: undefined as unknown as Cdependency})
			this.variant.definition = this;
		}
	}
	constructor(
		public readonly variant:Vdependency) { super(); }
	public cast<K extends Vdependency['name']>(_variant:K):Extract<Vdependency, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vdependency['name']]:(($:Extract<Vdependency, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/dependency`; }
	public is(other:Cdependency):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
type Vdirection = { name: 'dependency', definition: (typeof Cdirection.Pdependency)}|{ name: 'self', definition: (typeof Cdirection.Pself)}
export class Cdirection extends AlanObject {
	public static Pdependency:Cdirection = new class PrimitiveInstance extends Cdirection {
		constructor () {
			super({name: 'dependency', definition: undefined as unknown as Cdirection})
			this.variant.definition = this;
		}
	}
	public static Pself:Cdirection = new class PrimitiveInstance extends Cdirection {
		constructor () {
			super({name: 'self', definition: undefined as unknown as Cdirection})
			this.variant.definition = this;
		}
	}
	constructor(
		public readonly variant:Vdirection) { super(); }
	public cast<K extends Vdirection['name']>(_variant:K):Extract<Vdirection, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vdirection['name']]:(($:Extract<Vdirection, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/direction`; }
	public is(other:Cdirection):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
type Ventity = { name: 'collection', definition: Ccollection__interface}|{ name: 'root', definition: Cinterface}
export class Centity extends AlanObject {
	constructor(
		public readonly variant:Ventity) { super(); }
	public cast<K extends Ventity['name']>(_variant:K):Extract<Ventity, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Ventity['name']]:(($:Extract<Ventity, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/entity`; }
	public is(other:Centity):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
export type Tgraphs_definition = {
	'graphs':Record<string, Tgraphs__graphs_definition>;
};
export class Cgraphs_definition extends AlanNode {
	public readonly properties:{
		readonly graphs:Cgraphs_definition.Dgraphs
	};
	constructor(init:Tgraphs_definition, public location:AlanNode, public input: {
		collection: () => interface_.Ccollection__interface
	}) {
		super();
		const $this = this;
		this.properties = {
			graphs: new Cgraphs_definition.Dgraphs(init['graphs'], $this)
		};
	}
	public get root() { return this.location.root; }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/graphs definition`; }
}
export type Tgraphs__graphs_definition = {
	'type':'acyclic'|['acyclic', {}]|['ordered', Tordered];
};
export class Cgraphs__graphs_definition extends AlanNode {
	public key:string;
	public readonly properties:{
		readonly type:Cgraphs__graphs_definition.Dtype<
			{ name: 'acyclic', node:Cacyclic, init:Tacyclic}|
			{ name: 'ordered', node:Cordered, init:Tordered}>
	};
	constructor(key:string, init:Tgraphs__graphs_definition, public parent:Cgraphs_definition) {
		super();
		const $this = this;
		this.key = key;
		this.properties = {
			type: new Cgraphs__graphs_definition.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/graphs[${this.key}]`; }
}
export type Tacyclic = {
};
export class Cacyclic extends AlanNode {
	constructor(init:Tacyclic, public parent:Cgraphs__graphs_definition) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?acyclic`; }
}
export type Tordered = {
	'ordering property':string;
	'path':Tnode_path_tail;
};
export class Cordered extends AlanNode {
	public readonly properties:{
		readonly ordering_property:Cordered.Dordering_property,
		readonly path:Cnode_path_tail
	};
	constructor(init:Tordered, public parent:Cgraphs__graphs_definition) {
		super();
		const $this = this;
		this.properties = {
			ordering_property: new Cordered.Dordering_property(init['ordering property'], $this),
			path: new Cordered.Dpath(init['path'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?ordered`; }
}
type Vmember = { name: 'attribute', definition: Cattributes}|{ name: 'parameter', definition: Cproperties}
export class Cmember extends AlanObject {
	constructor(
		public readonly variant:Vmember, public input: {
			type: () => interface_.Cmember_type
		}) { super(); }
	public readonly output:{
		type: () => interface_.Cmember_type;
	} = {
		type: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.type())
				.result!
			).result!)
	};
	public cast<K extends Vmember['name']>(_variant:K):Extract<Vmember, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vmember['name']]:(($:Extract<Vmember, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/member`; }
	public is(other:Cmember):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
type Vmember_type = { name: 'key', definition: (typeof Cmember_type.Pkey)}|{ name: 'simple', definition: (typeof Cmember_type.Psimple)}
export class Cmember_type extends AlanObject {
	public static Pkey:Cmember_type = new class PrimitiveInstance extends Cmember_type {
		constructor () {
			super({name: 'key', definition: undefined as unknown as Cmember_type})
			this.variant.definition = this;
		}
	}
	public static Psimple:Cmember_type = new class PrimitiveInstance extends Cmember_type {
		constructor () {
			super({name: 'simple', definition: undefined as unknown as Cmember_type})
			this.variant.definition = this;
		}
	}
	constructor(
		public readonly variant:Vmember_type) { super(); }
	public cast<K extends Vmember_type['name']>(_variant:K):Extract<Vmember_type, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vmember_type['name']]:(($:Extract<Vmember_type, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/member type`; }
	public is(other:Cmember_type):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
function evaluate__member_type_derivation(input: {
	entity: () => interface_.Centity,
	member: () => interface_.Cmember
}):interface_.Cmember_type {
	const self = { component_root: { input: input } };
	return resolve(self).then(() => self).then(context => context?.component_root.input.entity())
		.then(context => {
			switch (context?.variant.name) {
				case 'collection': return resolve(context.cast('collection'))
					.then(match_context => {
						const expression_context = resolve(match_context).then(context => {
							const left = resolve(context)
								.then(() => self).then(context => context?.component_root.input.member())
							.result;
							const right = resolve(context)
								.then(context => context)
								.then(context => context?.component_root.output.key_member())
							.result;
							return left.is(right) ? left : undefined
						})
						.result;
						if (expression_context !== undefined) {
							return resolve(expression_context).then(() => self).then(() => interface_.Cmember_type.Pkey)
							.result
						} else {
							return resolve(match_context).then(() => self).then(() => interface_.Cmember_type.Psimple)
							.result
						}
					})
					.result;
				case undefined: return undefined;
				case 'root': return resolve(context.cast('root'))
					.then(() => self).then(() => interface_.Cmember_type.Psimple)
					.result;
				case undefined: return undefined;
				default: throw new Error(`Unexpected subtype '${(<any>context.variant).name}'`);
			};
		}).result!
}
function evaluate__navigation_step_direction(input: {
	current: () => interface_.Cdirection,
	step: () => interface_.Cdirection
}):interface_.Cdirection {
	const self = { component_root: { input: input } };
	return resolve(self).then(() => self).then(context => context?.component_root.input.current())
		.then(context => {
			switch (context?.variant.name) {
				case 'dependency': return resolve(context.cast('dependency'))
					.then(() => self).then(context => context?.component_root.input.current())
					.result;
				case undefined: return undefined;
				case 'self': return resolve(context.cast('self'))
					.then(() => self).then(context => context?.component_root.input.step())
					.result;
				case undefined: return undefined;
				default: throw new Error(`Unexpected subtype '${(<any>context.variant).name}'`);
			};
		}).result!
}
export type Tnode = {
	'attributes':Record<string, Tattributes>;
};
export class Cnode extends AlanNode {
	public definitions:{
		node_parent: Cnode_parent;
		object: Cobject;
	} = {
		node_parent: new Cnode_parent({name:'node', definition: this}),
		object: new Cobject({name:'node', definition: this}, {
			this_node: cache(() => resolve(this).then(this_context => resolve(this_context)
					.result!
				).result!, false)
		})
	}
	public readonly properties:{
		readonly attributes:Cnode.Dattributes
	};
	public readonly output:{
		entity: () => interface_.Centity;
		location: () => interface_.Cnode_location;
		parent: () => interface_.Cnode_parent;
	} = {
		entity: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.entity())
				.result!
			).result!),
		location: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.location())
				.result!
			).result!),
		parent: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.parent())
				.result!
			).result!)
	};
	constructor(init:Tnode, public location:AlanNode, public input: {
		entity: () => interface_.Centity,
		location: () => interface_.Cnode_location,
		parent: () => interface_.Cnode_parent
	}) {
		super();
		const $this = this;
		this.properties = {
			attributes: new Cnode.Dattributes(init['attributes'], $this)
		};
	}
	public get root() { return this.location.root; }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/node`; }
}
export type Tattributes = {
	'type':['command', Tcommand]|['property', Tproperty];
};
export class Cattributes extends AlanNode {
	public key:string;
	public definitions:{
		member: Cmember;
	} = {
		member: new Cmember({name:'attribute', definition: this}, {
			type: cache(() => resolve(this).then(this_context => resolve(this_context)
					.then(context => context?.properties.type.state.node.output.member_type())
					.result!
				).result!, false)
		})
	}
	public readonly properties:{
		readonly type:Cattributes.Dtype<
			{ name: 'command', node:Ccommand, init:Tcommand}|
			{ name: 'property', node:Cproperty, init:Tproperty}>
	};
	constructor(key:string, init:Tattributes, public parent:Cnode) {
		super();
		const $this = this;
		this.key = key;
		this.properties = {
			type: new Cattributes.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/attributes[${this.key}]`; }
}
export type Tcommand = {
	'parameters':Tparameter_definition__interface;
};
export class Ccommand extends AlanNode {
	public definitions:{
		parameter_location: Cparameter_location;
	} = {
		parameter_location: new Cparameter_location({name:'command', definition: this})
	}
	public readonly properties:{
		readonly parameters:Cparameter_definition__interface
	};
	public readonly output:{
		member_type: () => interface_.Cmember_type;
	} = {
		member_type: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(() => interface_.Cmember_type.Psimple)
				.result!
			).result!, false)
	}
	constructor(init:Tcommand, public parent:Cattributes) {
		super();
		const $this = this;
		this.properties = {
			parameters: new Ccommand.Dparameters(init['parameters'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?command`; }
}
export type Tproperty = {
	'type':['collection', Tcollection__type__property]|'file'|['file', {}]|['group', Tgroup__type__property]|['number', Tnumber__type__property]|['state group', Tstate_group__type__property]|['text', Ttext__type__property];
};
export class Cproperty extends AlanNode {
	public definitions:{
		value_member: Cvalue_member;
	} = {
		value_member: new Cvalue_member({name:'property', definition: this}, {
			member: cache(() => resolve(this).then(this_context => resolve(this_context)
					.then(context => context?.parent)
					.then(context => context?.definitions.member)
					.result!
				).result!, false),
			value: cache(() => resolve(this).then(this_context => resolve(this_context)
					.then(context => context?.properties.type.state.node.output.value())
					.result!
				).result!, false)
		})
	}
	public readonly properties:{
		readonly type:Cproperty.Dtype<
			{ name: 'collection', node:Ccollection__type__property, init:Tcollection__type__property}|
			{ name: 'file', node:Cfile__type__property, init:Tfile__type__property}|
			{ name: 'group', node:Cgroup__type__property, init:Tgroup__type__property}|
			{ name: 'number', node:Cnumber__type__property, init:Tnumber__type__property}|
			{ name: 'state group', node:Cstate_group__type__property, init:Tstate_group__type__property}|
			{ name: 'text', node:Ctext__type__property, init:Ttext__type__property}>
	};
	public readonly output:{
		member_type: () => interface_.Cmember_type;
	} = {
		member_type: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.inferences.member_type()).result!
			).result!, false)
	}
	public readonly inferences:{
		member_type: () => interface_.Cmember_type
	} = {
		member_type: cache(() => resolve(this.parent).then(context => evaluate__member_type_derivation(
				{
				entity: () => resolve(context).then(() => this.parent).then(context => context?.component_root.input.entity())
					.result
				,
				member: () => resolve(context).then(() => this.parent).then(context => context?.definitions.member)
					.result

				}))
			.result!, true)
	}
	constructor(init:Tproperty, public parent:Cattributes) {
		super();
		const $this = this;
		this.properties = {
			type: new Cproperty.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?property`; }
}
export type Tcollection__type__property = {
	'graphs':Tgraphs_definition;
	'key property':string;
	'node':Tnode;
};
export class Ccollection__type__property extends AlanNode {
	public definitions:{
		collection: Ccollection__interface;
		node_location: Cnode_location;
	} = {
		collection: new Ccollection__interface({name:'node collection', definition: this}, {
			key_member: cache(() => resolve(this).then(this_context => resolve(this_context)
					.then(context => context?.properties.key_property.ref)
					.then(context => context?.parent)
					.then(context => context?.parent)
					.then(context => context?.definitions.member)
					.result!
				).result!, false),
			value: cache(() => resolve(this).then(this_context => resolve(this_context)
					.then(context => context?.properties.node)
					.then(context => context?.definitions.object)
					.result!
				).result!, false)
		}),
		node_location: new Cnode_location({name:'collection', definition: this})
	}
	public readonly properties:{
		readonly graphs:Cgraphs_definition,
		readonly key_property:Ccollection__type__property.Dkey_property,
		readonly node:Cnode
	};
	public readonly output:{
		value: () => interface_.Cvalue;
	} = {
		value: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.definitions.collection)
				.then(context => context?.definitions.value)
				.result!
			).result!, false)
	}
	constructor(init:Tcollection__type__property, public parent:Cproperty) {
		super();
		const $this = this;
		this.properties = {
			graphs: new Ccollection__type__property.Dgraphs(init['graphs'], $this),
			key_property: new Ccollection__type__property.Dkey_property(init['key property'], $this),
			node: new Ccollection__type__property.Dnode(init['node'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?collection`; }
}
export type Tfile__type__property = {
};
export class Cfile__type__property extends AlanNode {
	public readonly output:{
		value: () => interface_.Cvalue;
	} = {
		value: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(() => interface_.Cvalue.Pfile)
				.result!
			).result!, false)
	}
	constructor(init:Tfile__type__property, public parent:Cproperty) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?file`; }
}
export type Tgroup__type__property = {
	'node':Tnode;
};
export class Cgroup__type__property extends AlanNode {
	public definitions:{
		node_location: Cnode_location;
	} = {
		node_location: new Cnode_location({name:'group', definition: this})
	}
	public readonly properties:{
		readonly node:Cnode
	};
	public readonly output:{
		value: () => interface_.Cvalue;
	} = {
		value: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.node)
				.then(context => context?.definitions.object)
				.then(context => context?.definitions.value)
				.result!
			).result!, false)
	}
	constructor(init:Tgroup__type__property, public parent:Cproperty) {
		super();
		const $this = this;
		this.properties = {
			node: new Cgroup__type__property.Dnode(init['node'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?group`; }
}
export type Tnumber__type__property = {
	'type':Tnumber_type;
};
export class Cnumber__type__property extends AlanNode {
	public readonly properties:{
		readonly type:Cnumber_type
	};
	public readonly output:{
		value: () => interface_.Cvalue;
	} = {
		value: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(() => interface_.Cvalue.Pnumber)
				.result!
			).result!, false)
	}
	constructor(init:Tnumber__type__property, public parent:Cproperty) {
		super();
		const $this = this;
		this.properties = {
			type: new Cnumber__type__property.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?number`; }
}
export type Tstate_group__type__property = {
	'first state':string;
	'states':Record<string, Tstates__state_group__type__property>;
};
export class Cstate_group__type__property extends AlanNode {
	public definitions:{
		choice: Cchoice;
	} = {
		choice: new Cchoice({name:'state group property', definition: this})
	}
	public readonly properties:{
		readonly first_state:Cstate_group__type__property.Dfirst_state,
		readonly states:Cstate_group__type__property.Dstates
	};
	public readonly output:{
		value: () => interface_.Cvalue;
	} = {
		value: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.definitions.choice)
				.then(context => context?.definitions.value)
				.result!
			).result!, false)
	}
	constructor(init:Tstate_group__type__property, public parent:Cproperty) {
		super();
		const $this = this;
		this.properties = {
			first_state: new Cstate_group__type__property.Dfirst_state(init['first state'], $this),
			states: new Cstate_group__type__property.Dstates(init['states'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?state group`; }
}
export type Tstates__state_group__type__property = {
	'context rules':Twhere_clause;
	'has successor':'no'|['no', {}]|['yes', Tyes__has_successor__states__state_group__type__property];
	'node':Tnode;
};
export class Cstates__state_group__type__property extends AlanNode {
	public key:string;
	public definitions:{
		node_location: Cnode_location;
		state: Cstate__interface;
	} = {
		node_location: new Cnode_location({name:'state', definition: this}),
		state: new Cstate__interface({name:'state node', definition: this}, {
			value: cache(() => resolve(this).then(this_context => resolve(this_context)
					.then(context => context?.properties.node)
					.then(context => context?.definitions.object)
					.result!
				).result!, false)
		})
	}
	public readonly properties:{
		readonly context_rules:Cwhere_clause,
		readonly has_successor:Cstates__state_group__type__property.Dhas_successor<
			{ name: 'no', node:Cno__has_successor__states__state_group__type__property, init:Tno__has_successor__states__state_group__type__property}|
			{ name: 'yes', node:Cyes__has_successor__states__state_group__type__property, init:Tyes__has_successor__states__state_group__type__property}>,
		readonly node:Cnode
	};
	constructor(key:string, init:Tstates__state_group__type__property, public parent:Cstate_group__type__property) {
		super();
		const $this = this;
		this.key = key;
		this.properties = {
			context_rules: new Cstates__state_group__type__property.Dcontext_rules(init['context rules'], $this),
			has_successor: new Cstates__state_group__type__property.Dhas_successor(init['has successor'], $this),
			node: new Cstates__state_group__type__property.Dnode(init['node'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/states[${this.key}]`; }
}
export type Tno__has_successor__states__state_group__type__property = {
};
export class Cno__has_successor__states__state_group__type__property extends AlanNode {
	constructor(init:Tno__has_successor__states__state_group__type__property, public parent:Cstates__state_group__type__property) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/has successor?no`; }
}
export type Tyes__has_successor__states__state_group__type__property = {
	'successor':string;
};
export class Cyes__has_successor__states__state_group__type__property extends AlanNode {
	public readonly properties:{
		readonly successor:Cyes__has_successor__states__state_group__type__property.Dsuccessor
	};
	constructor(init:Tyes__has_successor__states__state_group__type__property, public parent:Cstates__state_group__type__property) {
		super();
		const $this = this;
		this.properties = {
			successor: new Cyes__has_successor__states__state_group__type__property.Dsuccessor(init['successor'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/has successor?yes`; }
}
export type Ttext__type__property = {
	'has constraint':'no'|['no', {}]|['yes', Tyes__has_constraint__text__type__property];
};
export class Ctext__type__property extends AlanNode {
	public readonly properties:{
		readonly has_constraint:Ctext__type__property.Dhas_constraint<
			{ name: 'no', node:Cno__has_constraint__text__type__property, init:Tno__has_constraint__text__type__property}|
			{ name: 'yes', node:Cyes__has_constraint__text__type__property, init:Tyes__has_constraint__text__type__property}>
	};
	public readonly output:{
		value: () => interface_.Cvalue;
	} = {
		value: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(() => interface_.Cvalue.Ptext)
				.result!
			).result!, false)
	}
	constructor(init:Ttext__type__property, public parent:Cproperty) {
		super();
		const $this = this;
		this.properties = {
			has_constraint: new Ctext__type__property.Dhas_constraint(init['has constraint'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?text`; }
}
export type Tno__has_constraint__text__type__property = {
};
export class Cno__has_constraint__text__type__property extends AlanNode {
	public readonly output:{
		reference: () => interface_.Creference__interface;
	} = {
		reference: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(() => interface_.Creference__interface.Pundefined)
				.result!
			).result!, false)
	}
	constructor(init:Tno__has_constraint__text__type__property, public parent:Ctext__type__property) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/has constraint?no`; }
}
export type Tyes__has_constraint__text__type__property = {
	'referencer':Treferencer;
};
export class Cyes__has_constraint__text__type__property extends AlanNode {
	public readonly properties:{
		readonly referencer:Creferencer
	};
	public readonly output:{
		reference: () => interface_.Creference__interface;
	} = {
		reference: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.referencer)
				.then(context => context?.definitions.reference)
				.result!
			).result!, false)
	}
	constructor(init:Tyes__has_constraint__text__type__property, public parent:Ctext__type__property) {
		super();
		const $this = this;
		this.properties = {
			referencer: new Cyes__has_constraint__text__type__property.Dreferencer(init['referencer'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/has constraint?yes`; }
}
type Vnode_location = { name: 'collection', definition: Ccollection__type__property}|{ name: 'group', definition: Cgroup__type__property}|{ name: 'root', definition: Cinterface}|{ name: 'state', definition: Cstates__state_group__type__property}
export class Cnode_location extends AlanObject {
	constructor(
		public readonly variant:Vnode_location) { super(); }
	public cast<K extends Vnode_location['name']>(_variant:K):Extract<Vnode_location, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vnode_location['name']]:(($:Extract<Vnode_location, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/node location`; }
	public is(other:Cnode_location):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
type Vnode_parent = { name: 'node', definition: Cnode}|{ name: 'none', definition: (typeof Cnode_parent.Pnone)}
export class Cnode_parent extends AlanObject {
	public static Pnone:Cnode_parent = new class PrimitiveInstance extends Cnode_parent {
		constructor () {
			super({name: 'none', definition: undefined as unknown as Cnode_parent})
			this.variant.definition = this;
		}
	}
	constructor(
		public readonly variant:Vnode_parent) { super(); }
	public cast<K extends Vnode_parent['name']>(_variant:K):Extract<Vnode_parent, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vnode_parent['name']]:(($:Extract<Vnode_parent, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/node parent`; }
	public is(other:Cnode_parent):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
export type Tnode_path = {
	'head':Tcontext_node_path;
	'tail':Tnode_path_tail;
};
export class Cnode_path extends AlanNode {
	public readonly properties:{
		readonly head:Ccontext_node_path,
		readonly tail:Cnode_path_tail
	};
	public readonly output:{
		direction: () => interface_.Cdirection;
		node: () => interface_.Cnode;
	} = {
		direction: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.tail)
				.then(context => context?.component_root.output.direction())
				.result!
			).result!),
		node: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.tail)
				.then(context => context?.component_root.output.node())
				.result!
			).result!)
	};
	constructor(init:Tnode_path, public location:AlanNode, public input: {
		context_direction: () => interface_.Cdirection,
		context_node: () => interface_.Cnode,
		dependency: () => interface_.Cdependency,
		participation: () => interface_.Cparticipation,
		this: () => interface_.Cobject
	}) {
		super();
		const $this = this;
		this.properties = {
			head: new Cnode_path.Dhead(init['head'], $this),
			tail: new Cnode_path.Dtail(init['tail'], $this)
		};
	}
	public get root() { return this.location.root; }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/node path`; }
}
export type Tnode_path_tail = {
	'has steps':'no'|['no', {}]|['yes', Tyes__has_steps__node_path_tail];
};
export class Cnode_path_tail extends AlanNode {
	public readonly properties:{
		readonly has_steps:Cnode_path_tail.Dhas_steps<
			{ name: 'no', node:Cno__has_steps__node_path_tail, init:Tno__has_steps__node_path_tail}|
			{ name: 'yes', node:Cyes__has_steps__node_path_tail, init:Tyes__has_steps__node_path_tail}>
	};
	public readonly output:{
		direction: () => interface_.Cdirection;
		node: () => interface_.Cnode;
	} = {
		direction: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.has_steps.state.node.output.direction())
				.result!
			).result!),
		node: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.has_steps.state.node.output.node())
				.result!
			).result!)
	};
	constructor(init:Tnode_path_tail, public location:AlanNode, public input: {
		context_direction: () => interface_.Cdirection,
		context_node: () => interface_.Cnode,
		dependency: () => interface_.Cdependency,
		participation: () => interface_.Cparticipation
	}) {
		super();
		const $this = this;
		this.properties = {
			has_steps: new Cnode_path_tail.Dhas_steps(init['has steps'], $this)
		};
	}
	public get root() { return this.location.root; }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/node path tail`; }
}
export type Tno__has_steps__node_path_tail = {
};
export class Cno__has_steps__node_path_tail extends AlanNode {
	public readonly output:{
		direction: () => interface_.Cdirection;
		node: () => interface_.Cnode;
	} = {
		direction: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.context_direction())
				.result!
			).result!, false),
		node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.context_node())
				.result!
			).result!, false)
	}
	constructor(init:Tno__has_steps__node_path_tail, public parent:Cnode_path_tail) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has steps?no`; }
}
export type Tyes__has_steps__node_path_tail = {
	'tail':Tnode_path_tail;
	'type':['group', Tgroup__type__yes__has_steps__node_path_tail]|'parent'|['parent', {}]|['reference', Treference__type__yes]|['reference rule', Treference_rule]|['state', Tstate__type]|['state context rule', Tstate_context_rule__type__yes];
};
export class Cyes__has_steps__node_path_tail extends AlanNode {
	public readonly properties:{
		readonly tail:Cnode_path_tail,
		readonly type:Cyes__has_steps__node_path_tail.Dtype<
			{ name: 'group', node:Cgroup__type__yes__has_steps__node_path_tail, init:Tgroup__type__yes__has_steps__node_path_tail}|
			{ name: 'parent', node:Cparent__type__yes__has_steps__node_path_tail, init:Tparent__type__yes__has_steps__node_path_tail}|
			{ name: 'reference', node:Creference__type__yes, init:Treference__type__yes}|
			{ name: 'reference rule', node:Creference_rule, init:Treference_rule}|
			{ name: 'state', node:Cstate__type, init:Tstate__type}|
			{ name: 'state context rule', node:Cstate_context_rule__type__yes, init:Tstate_context_rule__type__yes}>
	};
	public readonly output:{
		direction: () => interface_.Cdirection;
		node: () => interface_.Cnode;
	} = {
		direction: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.tail)
				.then(context => context?.component_root.output.direction())
				.result!
			).result!, false),
		node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.tail)
				.then(context => context?.component_root.output.node())
				.result!
			).result!, false)
	}
	constructor(init:Tyes__has_steps__node_path_tail, public parent:Cnode_path_tail) {
		super();
		const $this = this;
		this.properties = {
			tail: new Cyes__has_steps__node_path_tail.Dtail(init['tail'], $this),
			type: new Cyes__has_steps__node_path_tail.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has steps?yes`; }
}
export type Tgroup__type__yes__has_steps__node_path_tail = {
	'group':string;
};
export class Cgroup__type__yes__has_steps__node_path_tail extends AlanNode {
	public readonly properties:{
		readonly group:Cgroup__type__yes__has_steps__node_path_tail.Dgroup
	};
	public readonly output:{
		dependency: () => interface_.Cdependency;
		direction: () => interface_.Cdirection;
		node: () => interface_.Cnode;
	} = {
		dependency: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.dependency())
				.result!
			).result!, false),
		direction: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.context_direction())
				.result!
			).result!, false),
		node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.group.ref)
				.then(context => context?.properties.node)
				.result!
			).result!, false)
	}
	constructor(init:Tgroup__type__yes__has_steps__node_path_tail, public parent:Cyes__has_steps__node_path_tail) {
		super();
		const $this = this;
		this.properties = {
			group: new Cgroup__type__yes__has_steps__node_path_tail.Dgroup(init['group'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?group`; }
}
export type Tparent__type__yes__has_steps__node_path_tail = {
};
export class Cparent__type__yes__has_steps__node_path_tail extends AlanNode {
	public readonly output:{
		dependency: () => interface_.Cdependency;
		direction: () => interface_.Cdirection;
		node: () => interface_.Cnode;
	} = {
		dependency: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.dependency())
				.result!
			).result!, false),
		direction: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.context_direction())
				.result!
			).result!, false),
		node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.inferences.parent_node()).result!
			).result!, false)
	}
	public readonly inferences:{
		context_entity: () => interface_.Centity,
		parent_node: () => interface_.Cnode
	} = {
		context_entity: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.component_root.input.context_direction())
			.then(context => {
				switch (context?.variant.name) {
					case 'dependency': return resolve(context.cast('dependency'))
						.then(context => {
							const left = resolve(context)
								.then(() => this.inferences.parent_node())
								.then(context => context?.component_root.output.entity())
							.result;
							const right = resolve(context)
								.then(() => this.parent).then(context => context?.component_root.input.context_node())
								.then(context => context?.component_root.output.entity())
							.result;
							return left.is(right) ? left : undefined
						})
						.result;
					case undefined: return undefined;
					case 'self': return resolve(context.cast('self'))
						.then(() => this.inferences.parent_node())
						.then(context => context?.component_root.output.entity())
						.result;
					case undefined: return undefined;
					default: throw new Error(`Unexpected subtype '${(<any>context.variant).name}'`);
				};
			}).result!, true),
		parent_node: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.component_root.input.context_node())
			.then(context => context?.component_root.output.parent())
			.then(context => context?.cast('node'))
			.result!, true)
	}
	constructor(init:Tparent__type__yes__has_steps__node_path_tail, public parent:Cyes__has_steps__node_path_tail) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?parent`; }
}
export type Treference__type__yes = {
	'reference':string;
};
export class Creference__type__yes extends AlanNode {
	public readonly properties:{
		readonly reference:Creference__type__yes.Dreference
	};
	public readonly output:{
		dependency: () => interface_.Cdependency;
		direction: () => interface_.Cdirection;
		node: () => interface_.Cnode;
	} = {
		dependency: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.dependency())
				.result!
			).result!, false),
		direction: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.reference.inferences.direction()).result!
			).result!, false),
		node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.reference.ref)
				.then(context => context?.properties.referencer)
				.then(context => context?.component_root.output.referenced_node())
				.result!
			).result!, false)
	}
	public readonly inferences:{
		dependency_allowed: () => interface_.Cdependency
	} = {
		dependency_allowed: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.component_root.input.dependency())
			.then(context => context?.cast('allowed'))
			.result!, true)
	}
	constructor(init:Treference__type__yes, public parent:Cyes__has_steps__node_path_tail) {
		super();
		const $this = this;
		this.properties = {
			reference: new Creference__type__yes.Dreference(init['reference'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?reference`; }
}
export type Treference_rule = {
	'reference':string;
	'rule':string;
};
export class Creference_rule extends AlanNode {
	public readonly properties:{
		readonly reference:Creference_rule.Dreference,
		readonly rule:Creference_rule.Drule
	};
	public readonly output:{
		dependency: () => interface_.Cdependency;
		direction: () => interface_.Cdirection;
		node: () => interface_.Cnode;
	} = {
		dependency: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.dependency())
				.result!
			).result!, false),
		direction: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.rule.inferences.direction()).result!
			).result!, false),
		node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.reference.ref)
				.then(context => context?.properties.referencer)
				.then(context => context?.component_root.output.referenced_node())
				.result!
			).result!, false)
	}
	public readonly inferences:{
		dependency_allowed: () => interface_.Cdependency
	} = {
		dependency_allowed: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.component_root.input.dependency())
			.then(context => context?.cast('allowed'))
			.result!, true)
	}
	constructor(init:Treference_rule, public parent:Cyes__has_steps__node_path_tail) {
		super();
		const $this = this;
		this.properties = {
			reference: new Creference_rule.Dreference(init['reference'], $this),
			rule: new Creference_rule.Drule(init['rule'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?reference rule`; }
}
export type Tstate__type = {
	'state':string;
	'state group':string;
};
export class Cstate__type extends AlanNode {
	public readonly properties:{
		readonly state:Cstate__type.Dstate,
		readonly state_group:Cstate__type.Dstate_group
	};
	public readonly output:{
		dependency: () => interface_.Cdependency;
		direction: () => interface_.Cdirection;
		node: () => interface_.Cnode;
	} = {
		dependency: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(() => interface_.Cdependency.Pdisallowed)
				.result!
			).result!, false),
		direction: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.context_direction())
				.result!
			).result!, false),
		node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.state.ref)
				.then(context => context?.properties.node)
				.result!
			).result!, false)
	}
	public readonly inferences:{
		conditional_result: () => interface_.Cparticipation
	} = {
		conditional_result: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.component_root.input.participation())
			.then(context => context?.cast('conditional'))
			.result!, true)
	}
	constructor(init:Tstate__type, public parent:Cyes__has_steps__node_path_tail) {
		super();
		const $this = this;
		this.properties = {
			state: new Cstate__type.Dstate(init['state'], $this),
			state_group: new Cstate__type.Dstate_group(init['state group'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?state`; }
}
export type Tstate_context_rule__type__yes = {
	'context rule':string;
};
export class Cstate_context_rule__type__yes extends AlanNode {
	public readonly properties:{
		readonly context_rule:Cstate_context_rule__type__yes.Dcontext_rule
	};
	public readonly output:{
		dependency: () => interface_.Cdependency;
		direction: () => interface_.Cdirection;
		node: () => interface_.Cnode;
	} = {
		dependency: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.dependency())
				.result!
			).result!, false),
		direction: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.context_rule.inferences.direction()).result!
			).result!, false),
		node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.context_rule.ref)
				.then(context => context?.properties.tail)
				.then(context => context?.component_root.output.node())
				.result!
			).result!, false)
	}
	public readonly inferences:{
		state: () => interface_.Cstates__state_group__type__property
	} = {
		state: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.component_root.input.context_node())
			.then(context => context?.component_root.output.location())
			.then(context => context?.cast('state'))
			.result!, true)
	}
	constructor(init:Tstate_context_rule__type__yes, public parent:Cyes__has_steps__node_path_tail) {
		super();
		const $this = this;
		this.properties = {
			context_rule: new Cstate_context_rule__type__yes.Dcontext_rule(init['context rule'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?state context rule`; }
}
type Vnumber_set_type = { name: 'integer', definition: (typeof Cnumber_set_type.Pinteger)}|{ name: 'natural', definition: (typeof Cnumber_set_type.Pnatural)}
export class Cnumber_set_type extends AlanObject {
	public static Pinteger:Cnumber_set_type = new class PrimitiveInstance extends Cnumber_set_type {
		constructor () {
			super({name: 'integer', definition: undefined as unknown as Cnumber_set_type})
			this.variant.definition = this;
		}
	}
	public static Pnatural:Cnumber_set_type = new class PrimitiveInstance extends Cnumber_set_type {
		constructor () {
			super({name: 'natural', definition: undefined as unknown as Cnumber_set_type})
			this.variant.definition = this;
		}
	}
	constructor(
		public readonly variant:Vnumber_set_type) { super(); }
	public cast<K extends Vnumber_set_type['name']>(_variant:K):Extract<Vnumber_set_type, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vnumber_set_type['name']]:(($:Extract<Vnumber_set_type, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/number set type`; }
	public is(other:Cnumber_set_type):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
export type Tnumber_type = {
	'decimal places':'no'|['no', {}]|['yes', Tyes__decimal_places];
	'set':'integer'|['integer', {}]|'natural'|['natural', {}];
	'type':string;
};
export class Cnumber_type extends AlanNode {
	public readonly properties:{
		readonly decimal_places:Cnumber_type.Ddecimal_places<
			{ name: 'no', node:Cno__decimal_places, init:Tno__decimal_places}|
			{ name: 'yes', node:Cyes__decimal_places, init:Tyes__decimal_places}>,
		readonly set:Cnumber_type.Dset<
			{ name: 'integer', node:Cinteger, init:Tinteger}|
			{ name: 'natural', node:Cnatural, init:Tnatural}>,
		readonly type:Cnumber_type.Dtype
	};
	constructor(init:Tnumber_type, public location:AlanNode) {
		super();
		const $this = this;
		this.properties = {
			decimal_places: new Cnumber_type.Ddecimal_places(init['decimal places'], $this),
			set: new Cnumber_type.Dset(init['set'], $this),
			type: new Cnumber_type.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.location.root; }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/number type`; }
}
export type Tno__decimal_places = {
};
export class Cno__decimal_places extends AlanNode {
	constructor(init:Tno__decimal_places, public parent:Cnumber_type) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/decimal places?no`; }
}
export type Tyes__decimal_places = {
	'places':number;
};
export class Cyes__decimal_places extends AlanNode {
	public readonly properties:{
		readonly places:number
	};
	constructor(init:Tyes__decimal_places, public parent:Cnumber_type) {
		super();
		const $this = this;
		this.properties = {
			places: init['places']
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/decimal places?yes`; }
}
export type Tinteger = {
};
export class Cinteger extends AlanNode {
	public readonly output:{
		set_type: () => interface_.Cnumber_set_type;
	} = {
		set_type: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(() => interface_.Cnumber_set_type.Pinteger)
				.result!
			).result!, false)
	}
	constructor(init:Tinteger, public parent:Cnumber_type) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/set?integer`; }
}
export type Tnatural = {
};
export class Cnatural extends AlanNode {
	public readonly output:{
		set_type: () => interface_.Cnumber_set_type;
	} = {
		set_type: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(() => interface_.Cnumber_set_type.Pnatural)
				.result!
			).result!, false)
	}
	constructor(init:Tnatural, public parent:Cnumber_type) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/set?natural`; }
}
type Vobject = { name: 'node', definition: Cnode}|{ name: 'parameter', definition: Cparameter_definition__interface}
export class Cobject extends AlanObject {
	constructor(
		public readonly variant:Vobject, public input: {
			this_node: () => interface_.Cnode
		}) { super(); }
	public definitions:{
		value: Cvalue;
		value_type: Cvalue_type;
	} = {
		value: new Cvalue({name:'object', definition: this}, {
			value_type: cache(() => resolve(this).then(this_context => resolve(this_context)
					.then(context => context?.definitions.value_type)
					.result!
				).result!, false)
		}),
		value_type: new Cvalue_type({name:'object', definition: this})
	}
	public readonly output:{
		this_node: () => interface_.Cnode;
	} = {
		this_node: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.this_node())
				.result!
			).result!)
	};
	public cast<K extends Vobject['name']>(_variant:K):Extract<Vobject, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vobject['name']]:(($:Extract<Vobject, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/object`; }
	public is(other:Cobject):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
export type Tparameter_definition__interface = {
	'properties':Record<string, Tproperties>;
};
export class Cparameter_definition__interface extends AlanNode {
	public definitions:{
		object: Cobject;
		parameter_parent: Cparameter_parent;
	} = {
		object: new Cobject({name:'parameter', definition: this}, {
			this_node: cache(() => resolve(this).then(this_context => resolve(this_context)
					.then(context => context?.component_root.input.this_node())
					.result!
				).result!, false)
		}),
		parameter_parent: new Cparameter_parent({name:'parameter', definition: this})
	}
	public readonly properties:{
		readonly properties:Cparameter_definition__interface.Dproperties
	};
	public readonly output:{
		entity: () => interface_.Centity;
		location: () => interface_.Cparameter_location;
		parent: () => interface_.Cparameter_parent;
	} = {
		entity: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.entity())
				.result!
			).result!),
		location: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.location())
				.result!
			).result!),
		parent: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.parent())
				.result!
			).result!)
	};
	constructor(init:Tparameter_definition__interface, public location:AlanNode, public input: {
		entity: () => interface_.Centity,
		location: () => interface_.Cparameter_location,
		parent: () => interface_.Cparameter_parent,
		this_node: () => interface_.Cnode
	}) {
		super();
		const $this = this;
		this.properties = {
			properties: new Cparameter_definition__interface.Dproperties(init['properties'], $this)
		};
	}
	public get root() { return this.location.root; }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/parameter definition`; }
}
export type Tproperties = {
	'type':['collection', Tcollection__type__properties]|'file'|['file', {}]|['group', Tgroup__type__properties]|['number', Tnumber__type__properties]|['state group', Tstate_group__type__properties]|['text', Ttext__type__properties];
};
export class Cproperties extends AlanNode {
	public key:string;
	public definitions:{
		member: Cmember;
		value_member: Cvalue_member;
	} = {
		member: new Cmember({name:'parameter', definition: this}, {
			type: cache(() => resolve(this).then(this_context => resolve(this_context)
					.then(context => context?.properties.type.state.node.output.member_type())
					.result!
				).result!, false)
		}),
		value_member: new Cvalue_member({name:'parameter', definition: this}, {
			member: cache(() => resolve(this).then(this_context => resolve(this_context)
					.then(context => context?.definitions.member)
					.result!
				).result!, false),
			value: cache(() => resolve(this).then(this_context => resolve(this_context)
					.then(context => context?.properties.type.state.node.output.value())
					.result!
				).result!, false)
		})
	}
	public readonly properties:{
		readonly type:Cproperties.Dtype<
			{ name: 'collection', node:Ccollection__type__properties, init:Tcollection__type__properties}|
			{ name: 'file', node:Cfile__type__properties, init:Tfile__type__properties}|
			{ name: 'group', node:Cgroup__type__properties, init:Tgroup__type__properties}|
			{ name: 'number', node:Cnumber__type__properties, init:Tnumber__type__properties}|
			{ name: 'state group', node:Cstate_group__type__properties, init:Tstate_group__type__properties}|
			{ name: 'text', node:Ctext__type__properties, init:Ttext__type__properties}>
	};
	constructor(key:string, init:Tproperties, public parent:Cparameter_definition__interface) {
		super();
		const $this = this;
		this.key = key;
		this.properties = {
			type: new Cproperties.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/properties[${this.key}]`; }
}
export type Tcollection__type__properties = {
	'key property':string;
	'parameters':Tparameter_definition__interface;
	'type':'dense map'|['dense map', {}]|'simple'|['simple', {}];
};
export class Ccollection__type__properties extends AlanNode {
	public definitions:{
		collection: Ccollection__interface;
		parameter_location: Cparameter_location;
	} = {
		collection: new Ccollection__interface({name:'parameter collection', definition: this}, {
			key_member: cache(() => resolve(this).then(this_context => resolve(this_context)
					.then(context => context?.properties.key_property.ref)
					.then(context => context?.parent)
					.then(context => context?.definitions.member)
					.result!
				).result!, false),
			value: cache(() => resolve(this).then(this_context => resolve(this_context)
					.then(context => context?.properties.parameters)
					.then(context => context?.definitions.object)
					.result!
				).result!, false)
		}),
		parameter_location: new Cparameter_location({name:'collection', definition: this})
	}
	public readonly properties:{
		readonly key_property:Ccollection__type__properties.Dkey_property,
		readonly parameters:Cparameter_definition__interface,
		readonly type:Ccollection__type__properties.Dtype<
			{ name: 'dense map', node:Cdense_map, init:Tdense_map}|
			{ name: 'simple', node:Csimple, init:Tsimple}>
	};
	public readonly output:{
		member_type: () => interface_.Cmember_type;
		value: () => interface_.Cvalue;
	} = {
		member_type: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(() => interface_.Cmember_type.Psimple)
				.result!
			).result!, false),
		value: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.definitions.collection)
				.then(context => context?.definitions.value)
				.result!
			).result!, false)
	}
	constructor(init:Tcollection__type__properties, public parent:Cproperties) {
		super();
		const $this = this;
		this.properties = {
			key_property: new Ccollection__type__properties.Dkey_property(init['key property'], $this),
			parameters: new Ccollection__type__properties.Dparameters(init['parameters'], $this),
			type: new Ccollection__type__properties.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?collection`; }
}
export type Tdense_map = {
};
export class Cdense_map extends AlanNode {
	public readonly inferences:{
		key_constraint: () => interface_.Cyes__has_constraint__text__type__properties
	} = {
		key_constraint: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.properties.key_property.ref)
			.then(context => context?.properties.has_constraint.cast('yes'))
			.result!, true)
	}
	constructor(init:Tdense_map, public parent:Ccollection__type__properties) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?dense map`; }
}
export type Tsimple = {
};
export class Csimple extends AlanNode {
	constructor(init:Tsimple, public parent:Ccollection__type__properties) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?simple`; }
}
export type Tfile__type__properties = {
};
export class Cfile__type__properties extends AlanNode {
	public readonly output:{
		member_type: () => interface_.Cmember_type;
		value: () => interface_.Cvalue;
	} = {
		member_type: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(() => interface_.Cmember_type.Psimple)
				.result!
			).result!, false),
		value: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(() => interface_.Cvalue.Pfile)
				.result!
			).result!, false)
	}
	constructor(init:Tfile__type__properties, public parent:Cproperties) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?file`; }
}
export type Tgroup__type__properties = {
	'parameters':Tparameter_definition__interface;
};
export class Cgroup__type__properties extends AlanNode {
	public definitions:{
		parameter_location: Cparameter_location;
	} = {
		parameter_location: new Cparameter_location({name:'group', definition: this})
	}
	public readonly properties:{
		readonly parameters:Cparameter_definition__interface
	};
	public readonly output:{
		member_type: () => interface_.Cmember_type;
		value: () => interface_.Cvalue;
	} = {
		member_type: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(() => interface_.Cmember_type.Psimple)
				.result!
			).result!, false),
		value: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.parameters)
				.then(context => context?.definitions.object)
				.then(context => context?.definitions.value)
				.result!
			).result!, false)
	}
	constructor(init:Tgroup__type__properties, public parent:Cproperties) {
		super();
		const $this = this;
		this.properties = {
			parameters: new Cgroup__type__properties.Dparameters(init['parameters'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?group`; }
}
export type Tnumber__type__properties = {
	'type':Tnumber_type;
};
export class Cnumber__type__properties extends AlanNode {
	public readonly properties:{
		readonly type:Cnumber_type
	};
	public readonly output:{
		member_type: () => interface_.Cmember_type;
		value: () => interface_.Cvalue;
	} = {
		member_type: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(() => interface_.Cmember_type.Psimple)
				.result!
			).result!, false),
		value: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(() => interface_.Cvalue.Pnumber)
				.result!
			).result!, false)
	}
	constructor(init:Tnumber__type__properties, public parent:Cproperties) {
		super();
		const $this = this;
		this.properties = {
			type: new Cnumber__type__properties.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?number`; }
}
export type Tstate_group__type__properties = {
	'first state':string;
	'states':Record<string, Tstates__state_group__type__properties>;
};
export class Cstate_group__type__properties extends AlanNode {
	public definitions:{
		choice: Cchoice;
	} = {
		choice: new Cchoice({name:'state group parameter', definition: this})
	}
	public readonly properties:{
		readonly first_state:Cstate_group__type__properties.Dfirst_state,
		readonly states:Cstate_group__type__properties.Dstates
	};
	public readonly output:{
		member_type: () => interface_.Cmember_type;
		value: () => interface_.Cvalue;
	} = {
		member_type: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(() => interface_.Cmember_type.Psimple)
				.result!
			).result!, false),
		value: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.definitions.choice)
				.then(context => context?.definitions.value)
				.result!
			).result!, false)
	}
	constructor(init:Tstate_group__type__properties, public parent:Cproperties) {
		super();
		const $this = this;
		this.properties = {
			first_state: new Cstate_group__type__properties.Dfirst_state(init['first state'], $this),
			states: new Cstate_group__type__properties.Dstates(init['states'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?state group`; }
}
export type Tstates__state_group__type__properties = {
	'context rules':Twhere_clause;
	'has successor':'no'|['no', {}]|['yes', Tyes__has_successor__states__state_group__type__properties];
	'parameters':Tparameter_definition__interface;
};
export class Cstates__state_group__type__properties extends AlanNode {
	public key:string;
	public definitions:{
		parameter_location: Cparameter_location;
		state: Cstate__interface;
	} = {
		parameter_location: new Cparameter_location({name:'state', definition: this}),
		state: new Cstate__interface({name:'state parameter', definition: this}, {
			value: cache(() => resolve(this).then(this_context => resolve(this_context)
					.then(context => context?.properties.parameters)
					.then(context => context?.definitions.object)
					.result!
				).result!, false)
		})
	}
	public readonly properties:{
		readonly context_rules:Cwhere_clause,
		readonly has_successor:Cstates__state_group__type__properties.Dhas_successor<
			{ name: 'no', node:Cno__has_successor__states__state_group__type__properties, init:Tno__has_successor__states__state_group__type__properties}|
			{ name: 'yes', node:Cyes__has_successor__states__state_group__type__properties, init:Tyes__has_successor__states__state_group__type__properties}>,
		readonly parameters:Cparameter_definition__interface
	};
	constructor(key:string, init:Tstates__state_group__type__properties, public parent:Cstate_group__type__properties) {
		super();
		const $this = this;
		this.key = key;
		this.properties = {
			context_rules: new Cstates__state_group__type__properties.Dcontext_rules(init['context rules'], $this),
			has_successor: new Cstates__state_group__type__properties.Dhas_successor(init['has successor'], $this),
			parameters: new Cstates__state_group__type__properties.Dparameters(init['parameters'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/states[${this.key}]`; }
}
export type Tno__has_successor__states__state_group__type__properties = {
};
export class Cno__has_successor__states__state_group__type__properties extends AlanNode {
	constructor(init:Tno__has_successor__states__state_group__type__properties, public parent:Cstates__state_group__type__properties) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/has successor?no`; }
}
export type Tyes__has_successor__states__state_group__type__properties = {
	'successor':string;
};
export class Cyes__has_successor__states__state_group__type__properties extends AlanNode {
	public readonly properties:{
		readonly successor:Cyes__has_successor__states__state_group__type__properties.Dsuccessor
	};
	constructor(init:Tyes__has_successor__states__state_group__type__properties, public parent:Cstates__state_group__type__properties) {
		super();
		const $this = this;
		this.properties = {
			successor: new Cyes__has_successor__states__state_group__type__properties.Dsuccessor(init['successor'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/has successor?yes`; }
}
export type Ttext__type__properties = {
	'has constraint':'no'|['no', {}]|['yes', Tyes__has_constraint__text__type__properties];
};
export class Ctext__type__properties extends AlanNode {
	public readonly properties:{
		readonly has_constraint:Ctext__type__properties.Dhas_constraint<
			{ name: 'no', node:Cno__has_constraint__text__type__properties, init:Tno__has_constraint__text__type__properties}|
			{ name: 'yes', node:Cyes__has_constraint__text__type__properties, init:Tyes__has_constraint__text__type__properties}>
	};
	public readonly output:{
		member_type: () => interface_.Cmember_type;
		value: () => interface_.Cvalue;
	} = {
		member_type: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.inferences.member_type()).result!
			).result!, false),
		value: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(() => interface_.Cvalue.Ptext)
				.result!
			).result!, false)
	}
	public readonly inferences:{
		member_type: () => interface_.Cmember_type
	} = {
		member_type: cache(() => resolve(this.parent).then(context => evaluate__member_type_derivation(
				{
				entity: () => resolve(context).then(() => this.parent).then(context => context?.component_root.input.entity())
					.result
				,
				member: () => resolve(context).then(() => this.parent).then(context => context?.definitions.member)
					.result

				}))
			.result!, true)
	}
	constructor(init:Ttext__type__properties, public parent:Cproperties) {
		super();
		const $this = this;
		this.properties = {
			has_constraint: new Ctext__type__properties.Dhas_constraint(init['has constraint'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?text`; }
}
export type Tno__has_constraint__text__type__properties = {
};
export class Cno__has_constraint__text__type__properties extends AlanNode {
	public readonly output:{
		reference: () => interface_.Creference__interface;
	} = {
		reference: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(() => interface_.Creference__interface.Pundefined)
				.result!
			).result!, false)
	}
	constructor(init:Tno__has_constraint__text__type__properties, public parent:Ctext__type__properties) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/has constraint?no`; }
}
export type Tyes__has_constraint__text__type__properties = {
	'referencer':Treferencer;
	'type':'existing'|['existing', {}]|'new'|['new', {}];
};
export class Cyes__has_constraint__text__type__properties extends AlanNode {
	public readonly properties:{
		readonly referencer:Creferencer,
		readonly type:Cyes__has_constraint__text__type__properties.Dtype<
			{ name: 'existing', node:Cexisting, init:Texisting}|
			{ name: 'new', node:Cnew, init:Tnew}>
	};
	public readonly output:{
		reference: () => interface_.Creference__interface;
	} = {
		reference: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.referencer)
				.then(context => context?.definitions.reference)
				.result!
			).result!, false)
	}
	constructor(init:Tyes__has_constraint__text__type__properties, public parent:Ctext__type__properties) {
		super();
		const $this = this;
		this.properties = {
			referencer: new Cyes__has_constraint__text__type__properties.Dreferencer(init['referencer'], $this),
			type: new Cyes__has_constraint__text__type__properties.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/has constraint?yes`; }
}
export type Texisting = {
};
export class Cexisting extends AlanNode {
	constructor(init:Texisting, public parent:Cyes__has_constraint__text__type__properties) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?existing`; }
}
export type Tnew = {
};
export class Cnew extends AlanNode {
	constructor(init:Tnew, public parent:Cyes__has_constraint__text__type__properties) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?new`; }
}
type Vparameter_location = { name: 'collection', definition: Ccollection__type__properties}|{ name: 'command', definition: Ccommand}|{ name: 'group', definition: Cgroup__type__properties}|{ name: 'state', definition: Cstates__state_group__type__properties}
export class Cparameter_location extends AlanObject {
	constructor(
		public readonly variant:Vparameter_location) { super(); }
	public cast<K extends Vparameter_location['name']>(_variant:K):Extract<Vparameter_location, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vparameter_location['name']]:(($:Extract<Vparameter_location, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/parameter location`; }
	public is(other:Cparameter_location):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
type Vparameter_parent = { name: 'none', definition: (typeof Cparameter_parent.Pnone)}|{ name: 'parameter', definition: Cparameter_definition__interface}
export class Cparameter_parent extends AlanObject {
	public static Pnone:Cparameter_parent = new class PrimitiveInstance extends Cparameter_parent {
		constructor () {
			super({name: 'none', definition: undefined as unknown as Cparameter_parent})
			this.variant.definition = this;
		}
	}
	constructor(
		public readonly variant:Vparameter_parent) { super(); }
	public cast<K extends Vparameter_parent['name']>(_variant:K):Extract<Vparameter_parent, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vparameter_parent['name']]:(($:Extract<Vparameter_parent, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/parameter parent`; }
	public is(other:Cparameter_parent):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
type Vparticipation = { name: 'conditional', definition: (typeof Cparticipation.Pconditional)}|{ name: 'singular', definition: (typeof Cparticipation.Psingular)}
export class Cparticipation extends AlanObject {
	public static Pconditional:Cparticipation = new class PrimitiveInstance extends Cparticipation {
		constructor () {
			super({name: 'conditional', definition: undefined as unknown as Cparticipation})
			this.variant.definition = this;
		}
	}
	public static Psingular:Cparticipation = new class PrimitiveInstance extends Cparticipation {
		constructor () {
			super({name: 'singular', definition: undefined as unknown as Cparticipation})
			this.variant.definition = this;
		}
	}
	constructor(
		public readonly variant:Vparticipation) { super(); }
	public cast<K extends Vparticipation['name']>(_variant:K):Extract<Vparticipation, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vparticipation['name']]:(($:Extract<Vparticipation, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/participation`; }
	public is(other:Cparticipation):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
type Vreference__interface = { name: 'defined', definition: Creferencer}|{ name: 'undefined', definition: (typeof Creference__interface.Pundefined)}
export class Creference__interface extends AlanObject {
	public static Pundefined:Creference__interface = new class PrimitiveInstance extends Creference__interface {
		constructor () {
			super({name: 'undefined', definition: undefined as unknown as Creference__interface})
			this.variant.definition = this;
		}
	}
	constructor(
		public readonly variant:Vreference__interface) { super(); }
	public cast<K extends Vreference__interface['name']>(_variant:K):Extract<Vreference__interface, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vreference__interface['name']]:(($:Extract<Vreference__interface, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/reference`; }
	public is(other:Creference__interface):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
export type Treferencer = {
	'has tail':'no'|['no', {}]|['yes', Tyes__has_tail];
	'head':Tnode_path;
	'rules':Twhere_clause;
	'type':['sibling', Tsibling]|['unrestricted', Tunrestricted];
};
export class Creferencer extends AlanNode {
	public definitions:{
		reference: Creference__interface;
	} = {
		reference: new Creference__interface({name:'defined', definition: this})
	}
	public readonly properties:{
		readonly has_tail:Creferencer.Dhas_tail<
			{ name: 'no', node:Cno__has_tail, init:Tno__has_tail}|
			{ name: 'yes', node:Cyes__has_tail, init:Tyes__has_tail}>,
		readonly head:Cnode_path,
		readonly rules:Cwhere_clause,
		readonly type:Creferencer.Dtype<
			{ name: 'sibling', node:Csibling, init:Tsibling}|
			{ name: 'unrestricted', node:Cunrestricted, init:Tunrestricted}>
	};
	public readonly output:{
		direction: () => interface_.Cdirection;
		referenced_node: () => interface_.Cnode;
	} = {
		direction: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.has_tail.state.node.output.direction())
				.result!
			).result!),
		referenced_node: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.has_tail.state.node.output.node())
				.result!
			).result!)
	};
	constructor(init:Treferencer, public location:AlanNode, public input: {
		this: () => interface_.Cobject
	}) {
		super();
		const $this = this;
		this.properties = {
			has_tail: new Creferencer.Dhas_tail(init['has tail'], $this),
			head: new Creferencer.Dhead(init['head'], $this),
			rules: new Creferencer.Drules(init['rules'], $this),
			type: new Creferencer.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.location.root; }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/referencer`; }
}
export type Tno__has_tail = {
};
export class Cno__has_tail extends AlanNode {
	public readonly output:{
		direction: () => interface_.Cdirection;
		node: () => interface_.Cnode;
	} = {
		direction: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.parent)
				.then(context => context?.properties.head)
				.then(context => context?.component_root.output.direction())
				.result!
			).result!, false),
		node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.parent)
				.then(context => context?.properties.type.state.node.output.collection())
				.then(context => context?.properties.node)
				.result!
			).result!, false)
	}
	constructor(init:Tno__has_tail, public parent:Creferencer) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has tail?no`; }
}
export type Tyes__has_tail = {
	'tail':Tnode_path_tail;
};
export class Cyes__has_tail extends AlanNode {
	public readonly properties:{
		readonly tail:Cnode_path_tail
	};
	public readonly output:{
		direction: () => interface_.Cdirection;
		node: () => interface_.Cnode;
	} = {
		direction: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.tail)
				.then(context => context?.component_root.output.direction())
				.result!
			).result!, false),
		node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.tail)
				.then(context => context?.component_root.output.node())
				.result!
			).result!, false)
	}
	constructor(init:Tyes__has_tail, public parent:Creferencer) {
		super();
		const $this = this;
		this.properties = {
			tail: new Cyes__has_tail.Dtail(init['tail'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has tail?yes`; }
}
export type Tsibling = {
	'graph participation':'no'|['no', {}]|['yes', Tyes__graph_participation];
};
export class Csibling extends AlanNode {
	public readonly properties:{
		readonly graph_participation:Csibling.Dgraph_participation<
			{ name: 'no', node:Cno__graph_participation, init:Tno__graph_participation}|
			{ name: 'yes', node:Cyes__graph_participation, init:Tyes__graph_participation}>
	};
	public readonly output:{
		collection: () => interface_.Ccollection__type__property;
	} = {
		collection: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.inferences.collection()).result!
			).result!, false)
	}
	public readonly inferences:{
		collection: () => interface_.Ccollection__type__property
	} = {
		collection: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.properties.head)
			.then(context => context?.component_root.output.node())
			.then(context => context?.component_root.output.location())
			.then(context => context?.cast('collection'))
			.result!, true)
	}
	constructor(init:Tsibling, public parent:Creferencer) {
		super();
		const $this = this;
		this.properties = {
			graph_participation: new Csibling.Dgraph_participation(init['graph participation'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/type?sibling`; }
}
export type Tno__graph_participation = {
};
export class Cno__graph_participation extends AlanNode {
	constructor(init:Tno__graph_participation, public parent:Csibling) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/graph participation?no`; }
}
export type Tyes__graph_participation = {
	'graphs':Record<string, {}>;
};
export class Cyes__graph_participation extends AlanNode {
	public readonly properties:{
		readonly graphs:Cyes__graph_participation.Dgraphs
	};
	public readonly inferences:{
		self_navigation: () => interface_.Cdirection
	} = {
		self_navigation: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.parent)
			.then(context => context?.properties.head)
			.then(context => context?.component_root.output.direction())
			.then(context => context?.cast('self'))
			.result!, true)
	}
	constructor(init:Tyes__graph_participation, public parent:Csibling) {
		super();
		const $this = this;
		this.properties = {
			graphs: new Cyes__graph_participation.Dgraphs(init['graphs'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/graph participation?yes`; }
}
export class Kgraphs__yes extends Reference<interface_.Cgraphs__graphs_definition, string> {
	constructor(key:string, $this:Cgraphs__yes) {
		super(key, cache(() => resolve($this.parent).then(() => $this.parent).then(context => context?.parent)
			.then(context => context?.inferences.collection()).then(context => context?.properties.graphs)
			.then(context => context?.properties.graphs.get(this.entry))
			.result!, true))
	}
}
export type Tgraphs__yes = {
};
export class Cgraphs__yes extends AlanNode {
	public key:Kgraphs__yes;
	constructor(key:string, init:Tgraphs__yes, public parent:Cyes__graph_participation) {
		super();
		const $this = this;
		this.key = new Kgraphs__yes(key, $this);
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/graphs[${this.key.entry}]`; }
}
export type Tunrestricted = {
	'collection':string;
};
export class Cunrestricted extends AlanNode {
	public readonly properties:{
		readonly collection:Cunrestricted.Dcollection
	};
	public readonly output:{
		collection: () => interface_.Ccollection__type__property;
	} = {
		collection: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.collection.ref)
				.result!
			).result!, false)
	}
	constructor(init:Tunrestricted, public parent:Creferencer) {
		super();
		const $this = this;
		this.properties = {
			collection: new Cunrestricted.Dcollection(init['collection'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/type?unrestricted`; }
}
type Vstate__interface = { name: 'state node', definition: Cstates__state_group__type__property}|{ name: 'state parameter', definition: Cstates__state_group__type__properties}
export class Cstate__interface extends AlanObject {
	constructor(
		public readonly variant:Vstate__interface, public input: {
			value: () => interface_.Cobject
		}) { super(); }
	public readonly output:{
		value: () => interface_.Cobject;
	} = {
		value: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.value())
				.result!
			).result!)
	};
	public cast<K extends Vstate__interface['name']>(_variant:K):Extract<Vstate__interface, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vstate__interface['name']]:(($:Extract<Vstate__interface, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/state`; }
	public is(other:Cstate__interface):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
type Vvalue = { name: 'choice', definition: Cchoice}|{ name: 'collection', definition: Ccollection__interface}|{ name: 'file', definition: (typeof Cvalue.Pfile)}|{ name: 'number', definition: (typeof Cvalue.Pnumber)}|{ name: 'object', definition: Cobject}|{ name: 'text', definition: (typeof Cvalue.Ptext)}
export class Cvalue extends AlanObject {
	public static Pfile:Cvalue = new class PrimitiveInstance extends Cvalue {
		constructor () {
			super({name: 'file', definition: undefined as unknown as Cvalue}, {
				value_type: () => resolve(this).then(() => interface_.Cvalue_type.Pscalar)
				.result
				}
			)
			this.variant.definition = this;
		}
	}
	public static Pnumber:Cvalue = new class PrimitiveInstance extends Cvalue {
		constructor () {
			super({name: 'number', definition: undefined as unknown as Cvalue}, {
				value_type: () => resolve(this).then(() => interface_.Cvalue_type.Pscalar)
				.result
				}
			)
			this.variant.definition = this;
		}
	}
	public static Ptext:Cvalue = new class PrimitiveInstance extends Cvalue {
		constructor () {
			super({name: 'text', definition: undefined as unknown as Cvalue}, {
				value_type: () => resolve(this).then(() => interface_.Cvalue_type.Pscalar)
				.result
				}
			)
			this.variant.definition = this;
		}
	}
	constructor(
		public readonly variant:Vvalue, public input: {
			value_type: () => interface_.Cvalue_type
		}) { super(); }
	public readonly output:{
		value_type: () => interface_.Cvalue_type;
	} = {
		value_type: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.value_type())
				.result!
			).result!)
	};
	public cast<K extends Vvalue['name']>(_variant:K):Extract<Vvalue, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vvalue['name']]:(($:Extract<Vvalue, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/value`; }
	public is(other:Cvalue):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
type Vvalue_member = { name: 'parameter', definition: Cproperties}|{ name: 'property', definition: Cproperty}
export class Cvalue_member extends AlanObject {
	constructor(
		public readonly variant:Vvalue_member, public input: {
			member: () => interface_.Cmember,
			value: () => interface_.Cvalue
		}) { super(); }
	public readonly output:{
		member: () => interface_.Cmember;
		value: () => interface_.Cvalue;
	} = {
		member: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.member())
				.result!
			).result!),
		value: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.value())
				.result!
			).result!)
	};
	public cast<K extends Vvalue_member['name']>(_variant:K):Extract<Vvalue_member, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vvalue_member['name']]:(($:Extract<Vvalue_member, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/value member`; }
	public is(other:Cvalue_member):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
type Vvalue_type = { name: 'choice', definition: Cchoice}|{ name: 'object', definition: Cobject}|{ name: 'scalar', definition: (typeof Cvalue_type.Pscalar)}
export class Cvalue_type extends AlanObject {
	public static Pscalar:Cvalue_type = new class PrimitiveInstance extends Cvalue_type {
		constructor () {
			super({name: 'scalar', definition: undefined as unknown as Cvalue_type})
			this.variant.definition = this;
		}
	}
	constructor(
		public readonly variant:Vvalue_type) { super(); }
	public cast<K extends Vvalue_type['name']>(_variant:K):Extract<Vvalue_type, {name:K}>['definition'] {
		return this.variant.definition as any;
	}
	switch<TS> (cases:{[K in Vvalue_type['name']]:(($:Extract<Vvalue_type, {name:K}>['definition']) => TS) | (() => TS) | Exclude<TS, Function>}):TS {
		const handler = cases[this.variant.name];
		if (isFunction(handler)) {
			return handler(this.variant.definition as any);
		} else {
			return handler as Exclude<TS, Function>;
		}
	}
	public get component_root() { return this; }
	public get path() { return `/value type`; }
	public is(other:Cvalue_type):boolean {
		return this.variant.name === other.variant.name
			&& (this.variant.definition === other.variant.definition || this.variant.definition.is(other.variant.definition as any));
	}
}
export type Twhere_clause = {
	'has rule':'no'|['no', {}]|['yes', Tyes__has_rule];
	'rules':Record<string, Trules>;
};
export class Cwhere_clause extends AlanNode {
	public readonly properties:{
		readonly has_rule:Cwhere_clause.Dhas_rule<
			{ name: 'no', node:Cno__has_rule, init:Tno__has_rule}|
			{ name: 'yes', node:Cyes__has_rule, init:Tyes__has_rule}>,
		readonly rules:Cwhere_clause.Drules
	};
	constructor(init:Twhere_clause, public location:AlanNode, public input: {
		context_constraint: () => interface_.Ccontext_constraint,
		context_direction: () => interface_.Cdirection,
		context_node: () => interface_.Cnode,
		this: () => interface_.Cobject
	}) {
		super();
		const $this = this;
		this.properties = {
			has_rule: new Cwhere_clause.Dhas_rule(init['has rule'], $this),
			rules: new Cwhere_clause.Drules(init['rules'], $this)
		};
	}
	public get root() { return this.location.root; }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/where clause`; }
}
export type Tno__has_rule = {
};
export class Cno__has_rule extends AlanNode {
	constructor(init:Tno__has_rule, public parent:Cwhere_clause) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has rule?no`; }
}
export type Tyes__has_rule = {
	'first':string;
};
export class Cyes__has_rule extends AlanNode {
	public readonly properties:{
		readonly first:Cyes__has_rule.Dfirst
	};
	constructor(init:Tyes__has_rule, public parent:Cwhere_clause) {
		super();
		const $this = this;
		this.properties = {
			first: new Cyes__has_rule.Dfirst(init['first'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has rule?yes`; }
}
export type Trules = {
	'context':['context', Tcontext]|['sibling rule', Tsibling_rule];
	'has successor':'no'|['no', {}]|['yes', Tyes__has_successor__rules];
	'tail':Tnode_path_tail;
};
export class Crules extends AlanNode {
	public key:string;
	public readonly properties:{
		readonly context:Crules.Dcontext<
			{ name: 'context', node:Ccontext, init:Tcontext}|
			{ name: 'sibling rule', node:Csibling_rule, init:Tsibling_rule}>,
		readonly has_successor:Crules.Dhas_successor<
			{ name: 'no', node:Cno__has_successor__rules, init:Tno__has_successor__rules}|
			{ name: 'yes', node:Cyes__has_successor__rules, init:Tyes__has_successor__rules}>,
		readonly tail:Cnode_path_tail
	};
	constructor(key:string, init:Trules, public parent:Cwhere_clause) {
		super();
		const $this = this;
		this.key = key;
		this.properties = {
			context: new Crules.Dcontext(init['context'], $this),
			has_successor: new Crules.Dhas_successor(init['has successor'], $this),
			tail: new Crules.Dtail(init['tail'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/rules[${this.key}]`; }
}
export type Tcontext = {
	'path':Tcontext_node_path;
};
export class Ccontext extends AlanNode {
	public readonly properties:{
		readonly path:Ccontext_node_path
	};
	public readonly output:{
		direction: () => interface_.Cdirection;
		node: () => interface_.Cnode;
	} = {
		direction: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.path)
				.then(context => context?.component_root.output.direction())
				.result!
			).result!, false),
		node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.path)
				.then(context => context?.component_root.output.node())
				.result!
			).result!, false)
	}
	constructor(init:Tcontext, public parent:Crules) {
		super();
		const $this = this;
		this.properties = {
			path: new Ccontext.Dpath(init['path'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/context?context`; }
}
export type Tsibling_rule = {
	'rule':string;
};
export class Csibling_rule extends AlanNode {
	public readonly properties:{
		readonly rule:Csibling_rule.Drule
	};
	public readonly output:{
		direction: () => interface_.Cdirection;
		node: () => interface_.Cnode;
	} = {
		direction: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.rule.ref)
				.then(context => context?.properties.tail)
				.then(context => context?.component_root.output.direction())
				.result!
			).result!, false),
		node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.rule.ref)
				.then(context => context?.properties.tail)
				.then(context => context?.component_root.output.node())
				.result!
			).result!, false)
	}
	constructor(init:Tsibling_rule, public parent:Crules) {
		super();
		const $this = this;
		this.properties = {
			rule: new Csibling_rule.Drule(init['rule'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/context?sibling rule`; }
}
export type Tno__has_successor__rules = {
};
export class Cno__has_successor__rules extends AlanNode {
	constructor(init:Tno__has_successor__rules, public parent:Crules) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/has successor?no`; }
}
export type Tyes__has_successor__rules = {
	'successor':string;
};
export class Cyes__has_successor__rules extends AlanNode {
	public readonly properties:{
		readonly successor:Cyes__has_successor__rules.Dsuccessor
	};
	constructor(init:Tyes__has_successor__rules, public parent:Crules) {
		super();
		const $this = this;
		this.properties = {
			successor: new Cyes__has_successor__rules.Dsuccessor(init['successor'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/has successor?yes`; }
}

export type Tinterface = {
	'context keys':Record<string, {}>;
	'numerical types':Record<string, {}>;
	'root':Tnode;
};
export class Cinterface extends AlanNode {
	public key?:string;
	public get root() { return this; }
	public definitions:{
		entity: Centity;
		node_location: Cnode_location;
	} = {
		entity: new Centity({name:'root', definition: this}),
		node_location: new Cnode_location({name:'root', definition: this})
	}
	public readonly properties:{
		readonly context_keys:Cinterface.Dcontext_keys,
		readonly numerical_types:Cinterface.Dnumerical_types,
		readonly root:Cnode
	};
	constructor(init:Tinterface, public lazy_eval:boolean) {
		super();
		const $this = this;
		this.properties = {
			context_keys: new Cinterface.Dcontext_keys(init['context keys'], $this),
			numerical_types: new Cinterface.Dnumerical_types(init['numerical types'], $this),
			root: new Cinterface.Droot(init['root'], $this)
		};
	}
	public get path() { return ``; }
}
export type Tcontext_keys = {
};
export class Ccontext_keys extends AlanNode {
	public key:string;
	constructor(key:string, init:Tcontext_keys, public parent:Cinterface) {
		super();
		const $this = this;
		this.key = key;
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/context keys[${this.key}]`; }
}
export type Tnumerical_types = {
};
export class Cnumerical_types extends AlanNode {
	public key:string;
	constructor(key:string, init:Tnumerical_types, public parent:Cinterface) {
		super();
		const $this = this;
		this.key = key;
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/numerical types[${this.key}]`; }
}

/* property classes */export namespace Ccontext_node_path {
	export class Dcontext<T extends
		{ name: 'context node', node:Ccontext_node, init:Tcontext_node}|
		{ name: 'parameter definition', node:Cparameter_definition__context, init:Tparameter_definition__context}|
		{ name: 'root', node:Croot, init:Troot}|
		{ name: 'this node', node:Cthis_node, init:Tthis_node}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'context node': return (init:Tcontext_node, parent:Ccontext_node_path) => new Ccontext_node(init, parent);
				case 'parameter definition': return (init:Tparameter_definition__context, parent:Ccontext_node_path) => new Cparameter_definition__context(init, parent);
				case 'root': return (init:Troot, parent:Ccontext_node_path) => new Croot(init, parent);
				case 'this node': return (init:Tthis_node, parent:Ccontext_node_path) => new Cthis_node(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'context node': return resolve_context_node;
				case 'parameter definition': return resolve_parameter_definition__context;
				case 'root': return resolve_root;
				case 'this node': return resolve_this_node;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tcontext_node_path['context'], parent:Ccontext_node_path) {
			super(data, parent);
		}
	}
}
export namespace Cparameter_definition__context {
	export class Dhead extends Ccontext_parameter_path {
		constructor(data:Tparameter_definition__context['head'], parent:Cparameter_definition__context) {
			super(data, parent, {
				context_parameter: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.inferences.context_parameter()).result!
					).result!, false)
			})
		}
	}
	export class Dtype<T extends
		{ name: 'reference', node:Creference__type__parameter_definition, init:Treference__type__parameter_definition}|
		{ name: 'state context rule', node:Cstate_context_rule__type__parameter_definition, init:Tstate_context_rule__type__parameter_definition}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'reference': return (init:Treference__type__parameter_definition, parent:Cparameter_definition__context) => new Creference__type__parameter_definition(init, parent);
				case 'state context rule': return (init:Tstate_context_rule__type__parameter_definition, parent:Cparameter_definition__context) => new Cstate_context_rule__type__parameter_definition(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'reference': return resolve_reference__type__parameter_definition;
				case 'state context rule': return resolve_state_context_rule__type__parameter_definition;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tparameter_definition__context['type'], parent:Cparameter_definition__context) {
			super(data, parent);
		}
	}
}
export namespace Creference__type__parameter_definition {
	export class Dreference extends Reference<interface_.Cyes__has_constraint__text__type__properties,string> {
		public readonly inferences:{
			existing_entry_reference: () => interface_.Cexisting
		}

		constructor(data:string, $this:Creference__type__parameter_definition) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.parent)
				.then(context => context?.properties.head)
				.then(context => context?.component_root.output.parameter())
				.then(context => context?.properties.properties.get(this.entry))

				.then(context => context?.properties.type.cast('text').properties.has_constraint.cast('yes')).result!, true))
			this.inferences = {
				existing_entry_reference: cache(() => resolve($this.properties.reference.ref).then(context => context)
					.then(context => context?.properties.type.cast('existing'))
					.result!, true)
			}
		}
	}
}
export namespace Cstate_context_rule__type__parameter_definition {
	export class Drule extends Reference<interface_.Crules,string> {

		constructor(data:string, $this:Cstate_context_rule__type__parameter_definition) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.inferences.state()).then(context => context?.properties.context_rules)
				.then(context => context?.properties.rules.get(this.entry))
				.result!, true))
		}
	}
}
export namespace Ccontext_parameter_path {
	export class Dhas_steps<T extends
		{ name: 'no', node:Cno__has_steps__context_parameter_path, init:Tno__has_steps__context_parameter_path}|
		{ name: 'yes', node:Cyes__has_steps__context_parameter_path, init:Tyes__has_steps__context_parameter_path}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__has_steps__context_parameter_path, parent:Ccontext_parameter_path) => new Cno__has_steps__context_parameter_path(init, parent);
				case 'yes': return (init:Tyes__has_steps__context_parameter_path, parent:Ccontext_parameter_path) => new Cyes__has_steps__context_parameter_path(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'no': return resolve_no__has_steps__context_parameter_path;
				case 'yes': return resolve_yes__has_steps__context_parameter_path;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tcontext_parameter_path['has steps'], parent:Ccontext_parameter_path) {
			super(data, parent);
		}
	}
}
export namespace Cyes__has_steps__context_parameter_path {
	export class Dtail extends Ccontext_parameter_path {
		constructor(data:Tyes__has_steps__context_parameter_path['tail'], parent:Cyes__has_steps__context_parameter_path) {
			super(data, parent, {
				context_parameter: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.properties.type.state.node.output.parameter())
						.result!
					).result!, false)
			})
		}
	}
	export class Dtype<T extends
		{ name: 'group', node:Cgroup__type__yes__has_steps__context_parameter_path, init:Tgroup__type__yes__has_steps__context_parameter_path}|
		{ name: 'parent', node:Cparent__type__yes__has_steps__context_parameter_path, init:Tparent__type__yes__has_steps__context_parameter_path}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'group': return (init:Tgroup__type__yes__has_steps__context_parameter_path, parent:Cyes__has_steps__context_parameter_path) => new Cgroup__type__yes__has_steps__context_parameter_path(init, parent);
				case 'parent': return (init:Tparent__type__yes__has_steps__context_parameter_path, parent:Cyes__has_steps__context_parameter_path) => new Cparent__type__yes__has_steps__context_parameter_path(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'group': return resolve_group__type__yes__has_steps__context_parameter_path;
				case 'parent': return resolve_parent__type__yes__has_steps__context_parameter_path;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tyes__has_steps__context_parameter_path['type'], parent:Cyes__has_steps__context_parameter_path) {
			super(data, parent);
		}
	}
}
export namespace Cgroup__type__yes__has_steps__context_parameter_path {
	export class Dgroup extends Reference<interface_.Cgroup__type__properties,string> {

		constructor(data:string, $this:Cgroup__type__yes__has_steps__context_parameter_path) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.component_root.input.context_parameter())
				.then(context => context?.properties.properties.get(this.entry))

				.then(context => context?.properties.type.cast('group')).result!, true))
		}
	}
}
export namespace Cgraphs_definition {
	export class Dgraphs extends AlanDictionary<{ node:Cgraphs__graphs_definition, init:Tgraphs__graphs_definition},Cgraphs_definition> {
		protected graph_iterator(graph:string):(node:Cgraphs__graphs_definition) => Cgraphs__graphs_definition { throw new Error(`Dictionary has no graph iterators.`); }
		protected initialize(parent:Cgraphs_definition, key:string, entry_init:Tgraphs__graphs_definition) { return new Cgraphs__graphs_definition(key, entry_init, parent); }
		protected resolve = resolve_graphs__graphs_definition
		protected get path() { return `${this.parent.path}/graphs`; }
		constructor(data:Tgraphs_definition['graphs'], parent:Cgraphs_definition) {
			super(data, parent);
		}
	}
}
export namespace Cgraphs__graphs_definition {
	export class Dtype<T extends
		{ name: 'acyclic', node:Cacyclic, init:Tacyclic}|
		{ name: 'ordered', node:Cordered, init:Tordered}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'acyclic': return (init:Tacyclic, parent:Cgraphs__graphs_definition) => new Cacyclic(init, parent);
				case 'ordered': return (init:Tordered, parent:Cgraphs__graphs_definition) => new Cordered(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'acyclic': return resolve_acyclic;
				case 'ordered': return resolve_ordered;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tgraphs__graphs_definition['type'], parent:Cgraphs__graphs_definition) {
			super(data, parent);
		}
	}
}
export namespace Cordered {
	export class Dordering_property extends Reference<interface_.Cproperty,string> {
		public readonly inferences:{
			graph_participation: () => interface_.Cyes__graph_participation,
			participates_in_this_graph: () => interface_.Cgraphs__yes,
			reference: () => interface_.Cyes__has_constraint__text__type__property
		}

		constructor(data:string, $this:Cordered) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.properties.path)
				.then(context => context?.component_root.output.node())
				.then(context => context?.properties.attributes.get(this.entry))

				.then(context => context?.properties.type.cast('property')).result!, true))
			this.inferences = {
				graph_participation: cache(() => resolve($this.properties.ordering_property.ref).then(() => $this.properties.ordering_property.inferences.reference())
					.then(context => context?.properties.referencer)
					.then(context => context?.properties.type.cast('sibling').properties.graph_participation.cast('yes'))
					.result!, true),
				participates_in_this_graph: cache(() => resolve($this.properties.ordering_property.ref).then(() => $this.properties.ordering_property.inferences.graph_participation())
					.then(context => {
						const key_object = resolve(context).then(() => $this).then(context => context?.parent)
						.result;
						return context.properties.graphs.get(key_object?.key);
					})
					.result!, true),
				reference: cache(() => resolve($this.properties.ordering_property.ref).then(context => context)
					.then(context => context?.properties.type.cast('text').properties.has_constraint.cast('yes'))
					.result!, true)
			}
		}
	}
	export class Dpath extends Cnode_path_tail {
		constructor(data:Tordered['path'], parent:Cordered) {
			super(data, parent, {
				context_direction: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(() => interface_.Cdirection.Pself)
						.result!
					).result!, false),
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.collection())
						.then(context => context?.component_root.output.value())
						.then(context => context?.component_root.output.this_node())
						.result!
					).result!, false),
				dependency: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(() => interface_.Cdependency.Pdisallowed)
						.result!
					).result!, false),
				participation: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(() => interface_.Cparticipation.Pconditional)
						.result!
					).result!, false)
			})
		}
	}
}
export namespace Cnode {
	export class Dattributes extends AlanDictionary<{ node:Cattributes, init:Tattributes},Cnode> {
		protected graph_iterator(graph:string):(node:Cattributes) => Cattributes { throw new Error(`Dictionary has no graph iterators.`); }
		protected initialize(parent:Cnode, key:string, entry_init:Tattributes) { return new Cattributes(key, entry_init, parent); }
		protected resolve = resolve_attributes
		protected get path() { return `${this.parent.path}/attributes`; }
		constructor(data:Tnode['attributes'], parent:Cnode) {
			super(data, parent);
		}
	}
}
export namespace Cattributes {
	export class Dtype<T extends
		{ name: 'command', node:Ccommand, init:Tcommand}|
		{ name: 'property', node:Cproperty, init:Tproperty}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'command': return (init:Tcommand, parent:Cattributes) => new Ccommand(init, parent);
				case 'property': return (init:Tproperty, parent:Cattributes) => new Cproperty(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'command': return resolve_command;
				case 'property': return resolve_property;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tattributes['type'], parent:Cattributes) {
			super(data, parent);
		}
	}
}
export namespace Ccommand {
	export class Dparameters extends Cparameter_definition__interface {
		constructor(data:Tcommand['parameters'], parent:Ccommand) {
			super(data, parent, {
				entity: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.entity())
						.result!
					).result!, false),
				location: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.definitions.parameter_location)
						.result!
					).result!, false),
				parent: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(() => interface_.Cparameter_parent.Pnone)
						.result!
					).result!, false),
				this_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.result!
					).result!, false)
			})
		}
	}
}
export namespace Cproperty {
	export class Dtype<T extends
		{ name: 'collection', node:Ccollection__type__property, init:Tcollection__type__property}|
		{ name: 'file', node:Cfile__type__property, init:Tfile__type__property}|
		{ name: 'group', node:Cgroup__type__property, init:Tgroup__type__property}|
		{ name: 'number', node:Cnumber__type__property, init:Tnumber__type__property}|
		{ name: 'state group', node:Cstate_group__type__property, init:Tstate_group__type__property}|
		{ name: 'text', node:Ctext__type__property, init:Ttext__type__property}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'collection': return (init:Tcollection__type__property, parent:Cproperty) => new Ccollection__type__property(init, parent);
				case 'file': return (init:Tfile__type__property, parent:Cproperty) => new Cfile__type__property(init, parent);
				case 'group': return (init:Tgroup__type__property, parent:Cproperty) => new Cgroup__type__property(init, parent);
				case 'number': return (init:Tnumber__type__property, parent:Cproperty) => new Cnumber__type__property(init, parent);
				case 'state group': return (init:Tstate_group__type__property, parent:Cproperty) => new Cstate_group__type__property(init, parent);
				case 'text': return (init:Ttext__type__property, parent:Cproperty) => new Ctext__type__property(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'collection': return resolve_collection__type__property;
				case 'file': return resolve_file__type__property;
				case 'group': return resolve_group__type__property;
				case 'number': return resolve_number__type__property;
				case 'state group': return resolve_state_group__type__property;
				case 'text': return resolve_text__type__property;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tproperty['type'], parent:Cproperty) {
			super(data, parent);
		}
	}
}
export namespace Ccollection__type__property {
	export class Dgraphs extends Cgraphs_definition {
		constructor(data:Tcollection__type__property['graphs'], parent:Ccollection__type__property) {
			super(data, parent, {
				collection: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.definitions.collection)
						.result!
					).result!, false)
			})
		}
	}
	export class Dkey_property extends Reference<interface_.Ctext__type__property,string> {

		constructor(data:string, $this:Ccollection__type__property) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.properties.node)
				.then(context => context?.properties.attributes.get(this.entry))

				.then(context => context?.properties.type.cast('property').properties.type.cast('text')).result!, true))
		}
	}
	export class Dnode extends Cnode {
		constructor(data:Tcollection__type__property['node'], parent:Ccollection__type__property) {
			super(data, parent, {
				entity: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.definitions.collection)
						.then(context => context?.definitions.entity)
						.result!
					).result!, false),
				location: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.definitions.node_location)
						.result!
					).result!, false),
				parent: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.definitions.node_parent)
						.result!
					).result!, false)
			})
		}
	}
}
export namespace Cgroup__type__property {
	export class Dnode extends Cnode {
		constructor(data:Tgroup__type__property['node'], parent:Cgroup__type__property) {
			super(data, parent, {
				entity: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.entity())
						.result!
					).result!, false),
				location: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.definitions.node_location)
						.result!
					).result!, false),
				parent: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.definitions.node_parent)
						.result!
					).result!, false)
			})
		}
	}
}
export namespace Cnumber__type__property {
	export class Dtype extends Cnumber_type {
		constructor(data:Tnumber__type__property['type'], parent:Cnumber__type__property) {
			super(data, parent)
		}
	}
}
export namespace Cstate_group__type__property {
	export class Dfirst_state extends Reference<interface_.Cstates__state_group__type__property,string> {

		constructor(data:string, $this:Cstate_group__type__property) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.properties.states.get(this.entry))
				.result!, true))
		}
	}
	export class Dstates extends AlanDictionary<{ node:Cstates__state_group__type__property, init:Tstates__state_group__type__property},Cstate_group__type__property,'order'> {
		protected graph_iterator(graph:('order')):(node:Cstates__state_group__type__property) => Cstates__state_group__type__property {
			switch (graph) {
				case 'order': return (entry:Cstates__state_group__type__property) => resolve(entry)
					.then(context => context?.properties.has_successor.state.name === 'yes' ? context.properties.has_successor.state.node as Cyes__has_successor__states__state_group__type__property : undefined)
					.then(context => context?.properties.successor.ref).result!
				default: throw new Error(`${graph} is not a valid graph iterator!`);
			}
		}
		protected initialize(parent:Cstate_group__type__property, key:string, entry_init:Tstates__state_group__type__property) { return new Cstates__state_group__type__property(key, entry_init, parent); }
		protected resolve = resolve_states__state_group__type__property
		protected get path() { return `${this.parent.path}/states`; }
		constructor(data:Tstate_group__type__property['states'], parent:Cstate_group__type__property) {
			super(data, parent);
		}
	}
}
export namespace Cstates__state_group__type__property {
	export class Dcontext_rules extends Cwhere_clause {
		constructor(data:Tstates__state_group__type__property['context rules'], parent:Cstates__state_group__type__property) {
			super(data, parent, {
				context_constraint: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(() => interface_.Ccontext_constraint.Pnone)
						.result!
					).result!, false),
				context_direction: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(() => interface_.Cdirection.Pself)
						.result!
					).result!, false),
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.result!
					).result!, false),
				this: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.definitions.object)
						.result!
					).result!, false)
			})
		}
	}
	export class Dhas_successor<T extends
		{ name: 'no', node:Cno__has_successor__states__state_group__type__property, init:Tno__has_successor__states__state_group__type__property}|
		{ name: 'yes', node:Cyes__has_successor__states__state_group__type__property, init:Tyes__has_successor__states__state_group__type__property}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__has_successor__states__state_group__type__property, parent:Cstates__state_group__type__property) => new Cno__has_successor__states__state_group__type__property(init, parent);
				case 'yes': return (init:Tyes__has_successor__states__state_group__type__property, parent:Cstates__state_group__type__property) => new Cyes__has_successor__states__state_group__type__property(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'no': return resolve_no__has_successor__states__state_group__type__property;
				case 'yes': return resolve_yes__has_successor__states__state_group__type__property;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tstates__state_group__type__property['has successor'], parent:Cstates__state_group__type__property) {
			super(data, parent);
		}
	}
	export class Dnode extends Cnode {
		constructor(data:Tstates__state_group__type__property['node'], parent:Cstates__state_group__type__property) {
			super(data, parent, {
				entity: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.entity())
						.result!
					).result!, false),
				location: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.definitions.node_location)
						.result!
					).result!, false),
				parent: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.definitions.node_parent)
						.result!
					).result!, false)
			})
		}
	}
}
export namespace Cyes__has_successor__states__state_group__type__property {
	export class Dsuccessor extends Reference<interface_.Cstates__state_group__type__property,string> {

		constructor(data:string, $this:Cyes__has_successor__states__state_group__type__property) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.parent)
				.then(context => context?.parent.properties.states.get(this.entry))
				.result!, true))
		}
	}
}
export namespace Ctext__type__property {
	export class Dhas_constraint<T extends
		{ name: 'no', node:Cno__has_constraint__text__type__property, init:Tno__has_constraint__text__type__property}|
		{ name: 'yes', node:Cyes__has_constraint__text__type__property, init:Tyes__has_constraint__text__type__property}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__has_constraint__text__type__property, parent:Ctext__type__property) => new Cno__has_constraint__text__type__property(init, parent);
				case 'yes': return (init:Tyes__has_constraint__text__type__property, parent:Ctext__type__property) => new Cyes__has_constraint__text__type__property(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'no': return resolve_no__has_constraint__text__type__property;
				case 'yes': return resolve_yes__has_constraint__text__type__property;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Ttext__type__property['has constraint'], parent:Ctext__type__property) {
			super(data, parent);
		}
	}
}
export namespace Cyes__has_constraint__text__type__property {
	export class Dreferencer extends Creferencer {
		constructor(data:Tyes__has_constraint__text__type__property['referencer'], parent:Cyes__has_constraint__text__type__property) {
			super(data, parent, {
				this: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.definitions.object)
						.result!
					).result!, false)
			})
		}
	}
}
export namespace Cnode_path {
	export class Dhead extends Ccontext_node_path {
		constructor(data:Tnode_path['head'], parent:Cnode_path) {
			super(data, parent, {
				context_constraint: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(() => interface_.Ccontext_constraint.Pnone)
						.result!
					).result!, false),
				context_direction: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.context_direction())
						.result!
					).result!, false),
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.context_node())
						.result!
					).result!, false),
				this: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.this())
						.result!
					).result!, false)
			})
		}
	}
	export class Dtail extends Cnode_path_tail {
		constructor(data:Tnode_path['tail'], parent:Cnode_path) {
			super(data, parent, {
				context_direction: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.properties.head)
						.then(context => context?.component_root.output.direction())
						.result!
					).result!, false),
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.properties.head)
						.then(context => context?.component_root.output.node())
						.result!
					).result!, false),
				dependency: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.dependency())
						.result!
					).result!, false),
				participation: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.participation())
						.result!
					).result!, false)
			})
		}
	}
}
export namespace Cnode_path_tail {
	export class Dhas_steps<T extends
		{ name: 'no', node:Cno__has_steps__node_path_tail, init:Tno__has_steps__node_path_tail}|
		{ name: 'yes', node:Cyes__has_steps__node_path_tail, init:Tyes__has_steps__node_path_tail}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__has_steps__node_path_tail, parent:Cnode_path_tail) => new Cno__has_steps__node_path_tail(init, parent);
				case 'yes': return (init:Tyes__has_steps__node_path_tail, parent:Cnode_path_tail) => new Cyes__has_steps__node_path_tail(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'no': return resolve_no__has_steps__node_path_tail;
				case 'yes': return resolve_yes__has_steps__node_path_tail;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tnode_path_tail['has steps'], parent:Cnode_path_tail) {
			super(data, parent);
		}
	}
}
export namespace Cyes__has_steps__node_path_tail {
	export class Dtail extends Cnode_path_tail {
		constructor(data:Tyes__has_steps__node_path_tail['tail'], parent:Cyes__has_steps__node_path_tail) {
			super(data, parent, {
				context_direction: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.properties.type.state.node.output.direction())
						.result!
					).result!, false),
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.properties.type.state.node.output.node())
						.result!
					).result!, false),
				dependency: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.properties.type.state.node.output.dependency())
						.result!
					).result!, false),
				participation: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.participation())
						.result!
					).result!, false)
			})
		}
	}
	export class Dtype<T extends
		{ name: 'group', node:Cgroup__type__yes__has_steps__node_path_tail, init:Tgroup__type__yes__has_steps__node_path_tail}|
		{ name: 'parent', node:Cparent__type__yes__has_steps__node_path_tail, init:Tparent__type__yes__has_steps__node_path_tail}|
		{ name: 'reference', node:Creference__type__yes, init:Treference__type__yes}|
		{ name: 'reference rule', node:Creference_rule, init:Treference_rule}|
		{ name: 'state', node:Cstate__type, init:Tstate__type}|
		{ name: 'state context rule', node:Cstate_context_rule__type__yes, init:Tstate_context_rule__type__yes}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'group': return (init:Tgroup__type__yes__has_steps__node_path_tail, parent:Cyes__has_steps__node_path_tail) => new Cgroup__type__yes__has_steps__node_path_tail(init, parent);
				case 'parent': return (init:Tparent__type__yes__has_steps__node_path_tail, parent:Cyes__has_steps__node_path_tail) => new Cparent__type__yes__has_steps__node_path_tail(init, parent);
				case 'reference': return (init:Treference__type__yes, parent:Cyes__has_steps__node_path_tail) => new Creference__type__yes(init, parent);
				case 'reference rule': return (init:Treference_rule, parent:Cyes__has_steps__node_path_tail) => new Creference_rule(init, parent);
				case 'state': return (init:Tstate__type, parent:Cyes__has_steps__node_path_tail) => new Cstate__type(init, parent);
				case 'state context rule': return (init:Tstate_context_rule__type__yes, parent:Cyes__has_steps__node_path_tail) => new Cstate_context_rule__type__yes(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'group': return resolve_group__type__yes__has_steps__node_path_tail;
				case 'parent': return resolve_parent__type__yes__has_steps__node_path_tail;
				case 'reference': return resolve_reference__type__yes;
				case 'reference rule': return resolve_reference_rule;
				case 'state': return resolve_state__type;
				case 'state context rule': return resolve_state_context_rule__type__yes;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tyes__has_steps__node_path_tail['type'], parent:Cyes__has_steps__node_path_tail) {
			super(data, parent);
		}
	}
}
export namespace Cgroup__type__yes__has_steps__node_path_tail {
	export class Dgroup extends Reference<interface_.Cgroup__type__property,string> {

		constructor(data:string, $this:Cgroup__type__yes__has_steps__node_path_tail) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.component_root.input.context_node())
				.then(context => context?.properties.attributes.get(this.entry))

				.then(context => context?.properties.type.cast('property').properties.type.cast('group')).result!, true))
		}
	}
}
export namespace Creference__type__yes {
	export class Dreference extends Reference<interface_.Cyes__has_constraint__text__type__property,string> {
		public readonly inferences:{
			direction: () => interface_.Cdirection
		}

		constructor(data:string, $this:Creference__type__yes) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.component_root.input.context_node())
				.then(context => context?.properties.attributes.get(this.entry))

				.then(context => context?.properties.type.cast('property').properties.type.cast('text').properties.has_constraint.cast('yes')).result!, true))
			this.inferences = {
				direction: cache(() => resolve($this.properties.reference.ref).then(context => evaluate__navigation_step_direction(
						{
						current: () => resolve(context).then(() => $this).then(context => context?.component_root.input.context_direction())
							.result
						,
						step: () => resolve(context).then(context => context)
							.then(context => context?.properties.referencer)
							.then(context => context?.component_root.output.direction())
							.result

						}))
					.result!, true)
			}
		}
	}
}
export namespace Creference_rule {
	export class Dreference extends Reference<interface_.Cyes__has_constraint__text__type__property,string> {

		constructor(data:string, $this:Creference_rule) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.component_root.input.context_node())
				.then(context => context?.properties.attributes.get(this.entry))

				.then(context => context?.properties.type.cast('property').properties.type.cast('text').properties.has_constraint.cast('yes')).result!, true))
		}
	}
	export class Drule extends Reference<interface_.Crules,string> {
		public readonly inferences:{
			direction: () => interface_.Cdirection
		}

		constructor(data:string, $this:Creference_rule) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.properties.reference.ref)
				.then(context => context?.properties.referencer)
				.then(context => context?.properties.rules)
				.then(context => context?.properties.rules.get(this.entry))
				.result!, true))
			this.inferences = {
				direction: cache(() => resolve($this.properties.rule.ref).then(context => evaluate__navigation_step_direction(
						{
						current: () => resolve(context).then(() => $this).then(context => context?.component_root.input.context_direction())
							.result
						,
						step: () => resolve(context).then(context => context)
							.then(context => context?.properties.tail)
							.then(context => context?.component_root.output.direction())
							.result

						}))
					.result!, true)
			}
		}
	}
}
export namespace Cstate__type {
	export class Dstate extends Reference<interface_.Cstates__state_group__type__property,string> {

		constructor(data:string, $this:Cstate__type) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.properties.state_group.ref)
				.then(context => context?.properties.states.get(this.entry))
				.result!, true))
		}
	}
	export class Dstate_group extends Reference<interface_.Cstate_group__type__property,string> {

		constructor(data:string, $this:Cstate__type) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.component_root.input.context_node())
				.then(context => context?.properties.attributes.get(this.entry))

				.then(context => context?.properties.type.cast('property').properties.type.cast('state group')).result!, true))
		}
	}
}
export namespace Cstate_context_rule__type__yes {
	export class Dcontext_rule extends Reference<interface_.Crules,string> {
		public readonly inferences:{
			direction: () => interface_.Cdirection
		}

		constructor(data:string, $this:Cstate_context_rule__type__yes) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.inferences.state()).then(context => context?.properties.context_rules)
				.then(context => context?.properties.rules.get(this.entry))
				.result!, true))
			this.inferences = {
				direction: cache(() => resolve($this.properties.context_rule.ref).then(context => evaluate__navigation_step_direction(
						{
						current: () => resolve(context).then(() => $this).then(context => context?.component_root.input.context_direction())
							.result
						,
						step: () => resolve(context).then(context => context)
							.then(context => context?.properties.tail)
							.then(context => context?.component_root.output.direction())
							.result

						}))
					.result!, true)
			}
		}
	}
}
export namespace Cnumber_type {
	export class Ddecimal_places<T extends
		{ name: 'no', node:Cno__decimal_places, init:Tno__decimal_places}|
		{ name: 'yes', node:Cyes__decimal_places, init:Tyes__decimal_places}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__decimal_places, parent:Cnumber_type) => new Cno__decimal_places(init, parent);
				case 'yes': return (init:Tyes__decimal_places, parent:Cnumber_type) => new Cyes__decimal_places(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'no': return resolve_no__decimal_places;
				case 'yes': return resolve_yes__decimal_places;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tnumber_type['decimal places'], parent:Cnumber_type) {
			super(data, parent);
		}
	}
	export class Dset<T extends
		{ name: 'integer', node:Cinteger, init:Tinteger}|
		{ name: 'natural', node:Cnatural, init:Tnatural}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'integer': return (init:Tinteger, parent:Cnumber_type) => new Cinteger(init, parent);
				case 'natural': return (init:Tnatural, parent:Cnumber_type) => new Cnatural(init, parent);
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
		constructor(data:Tnumber_type['set'], parent:Cnumber_type) {
			super(data, parent);
		}
	}
	export class Dtype extends Reference<interface_.Cnumerical_types,string> {

		constructor(data:string, $this:Cnumber_type) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.root)
				.then(context => context?.properties.numerical_types.get(this.entry))
				.result!, true))
		}
	}
}
export namespace Cyes__decimal_places {
}
export namespace Cparameter_definition__interface {
	export class Dproperties extends AlanDictionary<{ node:Cproperties, init:Tproperties},Cparameter_definition__interface> {
		protected graph_iterator(graph:string):(node:Cproperties) => Cproperties { throw new Error(`Dictionary has no graph iterators.`); }
		protected initialize(parent:Cparameter_definition__interface, key:string, entry_init:Tproperties) { return new Cproperties(key, entry_init, parent); }
		protected resolve = resolve_properties
		protected get path() { return `${this.parent.path}/properties`; }
		constructor(data:Tparameter_definition__interface['properties'], parent:Cparameter_definition__interface) {
			super(data, parent);
		}
	}
}
export namespace Cproperties {
	export class Dtype<T extends
		{ name: 'collection', node:Ccollection__type__properties, init:Tcollection__type__properties}|
		{ name: 'file', node:Cfile__type__properties, init:Tfile__type__properties}|
		{ name: 'group', node:Cgroup__type__properties, init:Tgroup__type__properties}|
		{ name: 'number', node:Cnumber__type__properties, init:Tnumber__type__properties}|
		{ name: 'state group', node:Cstate_group__type__properties, init:Tstate_group__type__properties}|
		{ name: 'text', node:Ctext__type__properties, init:Ttext__type__properties}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'collection': return (init:Tcollection__type__properties, parent:Cproperties) => new Ccollection__type__properties(init, parent);
				case 'file': return (init:Tfile__type__properties, parent:Cproperties) => new Cfile__type__properties(init, parent);
				case 'group': return (init:Tgroup__type__properties, parent:Cproperties) => new Cgroup__type__properties(init, parent);
				case 'number': return (init:Tnumber__type__properties, parent:Cproperties) => new Cnumber__type__properties(init, parent);
				case 'state group': return (init:Tstate_group__type__properties, parent:Cproperties) => new Cstate_group__type__properties(init, parent);
				case 'text': return (init:Ttext__type__properties, parent:Cproperties) => new Ctext__type__properties(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'collection': return resolve_collection__type__properties;
				case 'file': return resolve_file__type__properties;
				case 'group': return resolve_group__type__properties;
				case 'number': return resolve_number__type__properties;
				case 'state group': return resolve_state_group__type__properties;
				case 'text': return resolve_text__type__properties;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tproperties['type'], parent:Cproperties) {
			super(data, parent);
		}
	}
}
export namespace Ccollection__type__properties {
	export class Dkey_property extends Reference<interface_.Ctext__type__properties,string> {

		constructor(data:string, $this:Ccollection__type__properties) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.properties.parameters)
				.then(context => context?.properties.properties.get(this.entry))

				.then(context => context?.properties.type.cast('text')).result!, true))
		}
	}
	export class Dparameters extends Cparameter_definition__interface {
		constructor(data:Tcollection__type__properties['parameters'], parent:Ccollection__type__properties) {
			super(data, parent, {
				entity: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.definitions.collection)
						.then(context => context?.definitions.entity)
						.result!
					).result!, false),
				location: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.definitions.parameter_location)
						.result!
					).result!, false),
				parent: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.definitions.parameter_parent)
						.result!
					).result!, false),
				this_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.this_node())
						.result!
					).result!, false)
			})
		}
	}
	export class Dtype<T extends
		{ name: 'dense map', node:Cdense_map, init:Tdense_map}|
		{ name: 'simple', node:Csimple, init:Tsimple}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'dense map': return (init:Tdense_map, parent:Ccollection__type__properties) => new Cdense_map(init, parent);
				case 'simple': return (init:Tsimple, parent:Ccollection__type__properties) => new Csimple(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'dense map': return resolve_dense_map;
				case 'simple': return resolve_simple;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tcollection__type__properties['type'], parent:Ccollection__type__properties) {
			super(data, parent);
		}
	}
}
export namespace Cgroup__type__properties {
	export class Dparameters extends Cparameter_definition__interface {
		constructor(data:Tgroup__type__properties['parameters'], parent:Cgroup__type__properties) {
			super(data, parent, {
				entity: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.entity())
						.result!
					).result!, false),
				location: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.definitions.parameter_location)
						.result!
					).result!, false),
				parent: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.definitions.parameter_parent)
						.result!
					).result!, false),
				this_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.this_node())
						.result!
					).result!, false)
			})
		}
	}
}
export namespace Cnumber__type__properties {
	export class Dtype extends Cnumber_type {
		constructor(data:Tnumber__type__properties['type'], parent:Cnumber__type__properties) {
			super(data, parent)
		}
	}
}
export namespace Cstate_group__type__properties {
	export class Dfirst_state extends Reference<interface_.Cstates__state_group__type__properties,string> {

		constructor(data:string, $this:Cstate_group__type__properties) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.properties.states.get(this.entry))
				.result!, true))
		}
	}
	export class Dstates extends AlanDictionary<{ node:Cstates__state_group__type__properties, init:Tstates__state_group__type__properties},Cstate_group__type__properties,'order'> {
		protected graph_iterator(graph:('order')):(node:Cstates__state_group__type__properties) => Cstates__state_group__type__properties {
			switch (graph) {
				case 'order': return (entry:Cstates__state_group__type__properties) => resolve(entry)
					.then(context => context?.properties.has_successor.state.name === 'yes' ? context.properties.has_successor.state.node as Cyes__has_successor__states__state_group__type__properties : undefined)
					.then(context => context?.properties.successor.ref).result!
				default: throw new Error(`${graph} is not a valid graph iterator!`);
			}
		}
		protected initialize(parent:Cstate_group__type__properties, key:string, entry_init:Tstates__state_group__type__properties) { return new Cstates__state_group__type__properties(key, entry_init, parent); }
		protected resolve = resolve_states__state_group__type__properties
		protected get path() { return `${this.parent.path}/states`; }
		constructor(data:Tstate_group__type__properties['states'], parent:Cstate_group__type__properties) {
			super(data, parent);
		}
	}
}
export namespace Cstates__state_group__type__properties {
	export class Dcontext_rules extends Cwhere_clause {
		constructor(data:Tstates__state_group__type__properties['context rules'], parent:Cstates__state_group__type__properties) {
			super(data, parent, {
				context_constraint: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(() => interface_.Ccontext_constraint.Pnone)
						.result!
					).result!, false),
				context_direction: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(() => interface_.Cdirection.Pself)
						.result!
					).result!, false),
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.this_node())
						.result!
					).result!, false),
				this: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.definitions.object)
						.result!
					).result!, false)
			})
		}
	}
	export class Dhas_successor<T extends
		{ name: 'no', node:Cno__has_successor__states__state_group__type__properties, init:Tno__has_successor__states__state_group__type__properties}|
		{ name: 'yes', node:Cyes__has_successor__states__state_group__type__properties, init:Tyes__has_successor__states__state_group__type__properties}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__has_successor__states__state_group__type__properties, parent:Cstates__state_group__type__properties) => new Cno__has_successor__states__state_group__type__properties(init, parent);
				case 'yes': return (init:Tyes__has_successor__states__state_group__type__properties, parent:Cstates__state_group__type__properties) => new Cyes__has_successor__states__state_group__type__properties(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'no': return resolve_no__has_successor__states__state_group__type__properties;
				case 'yes': return resolve_yes__has_successor__states__state_group__type__properties;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tstates__state_group__type__properties['has successor'], parent:Cstates__state_group__type__properties) {
			super(data, parent);
		}
	}
	export class Dparameters extends Cparameter_definition__interface {
		constructor(data:Tstates__state_group__type__properties['parameters'], parent:Cstates__state_group__type__properties) {
			super(data, parent, {
				entity: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.entity())
						.result!
					).result!, false),
				location: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.definitions.parameter_location)
						.result!
					).result!, false),
				parent: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.definitions.parameter_parent)
						.result!
					).result!, false),
				this_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.this_node())
						.result!
					).result!, false)
			})
		}
	}
}
export namespace Cyes__has_successor__states__state_group__type__properties {
	export class Dsuccessor extends Reference<interface_.Cstates__state_group__type__properties,string> {

		constructor(data:string, $this:Cyes__has_successor__states__state_group__type__properties) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.parent)
				.then(context => context?.parent.properties.states.get(this.entry))
				.result!, true))
		}
	}
}
export namespace Ctext__type__properties {
	export class Dhas_constraint<T extends
		{ name: 'no', node:Cno__has_constraint__text__type__properties, init:Tno__has_constraint__text__type__properties}|
		{ name: 'yes', node:Cyes__has_constraint__text__type__properties, init:Tyes__has_constraint__text__type__properties}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__has_constraint__text__type__properties, parent:Ctext__type__properties) => new Cno__has_constraint__text__type__properties(init, parent);
				case 'yes': return (init:Tyes__has_constraint__text__type__properties, parent:Ctext__type__properties) => new Cyes__has_constraint__text__type__properties(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'no': return resolve_no__has_constraint__text__type__properties;
				case 'yes': return resolve_yes__has_constraint__text__type__properties;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Ttext__type__properties['has constraint'], parent:Ctext__type__properties) {
			super(data, parent);
		}
	}
}
export namespace Cyes__has_constraint__text__type__properties {
	export class Dreferencer extends Creferencer {
		constructor(data:Tyes__has_constraint__text__type__properties['referencer'], parent:Cyes__has_constraint__text__type__properties) {
			super(data, parent, {
				this: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.definitions.object)
						.result!
					).result!, false)
			})
		}
	}
	export class Dtype<T extends
		{ name: 'existing', node:Cexisting, init:Texisting}|
		{ name: 'new', node:Cnew, init:Tnew}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'existing': return (init:Texisting, parent:Cyes__has_constraint__text__type__properties) => new Cexisting(init, parent);
				case 'new': return (init:Tnew, parent:Cyes__has_constraint__text__type__properties) => new Cnew(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'existing': return resolve_existing;
				case 'new': return resolve_new;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tyes__has_constraint__text__type__properties['type'], parent:Cyes__has_constraint__text__type__properties) {
			super(data, parent);
		}
	}
}
export namespace Creferencer {
	export class Dhas_tail<T extends
		{ name: 'no', node:Cno__has_tail, init:Tno__has_tail}|
		{ name: 'yes', node:Cyes__has_tail, init:Tyes__has_tail}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__has_tail, parent:Creferencer) => new Cno__has_tail(init, parent);
				case 'yes': return (init:Tyes__has_tail, parent:Creferencer) => new Cyes__has_tail(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'no': return resolve_no__has_tail;
				case 'yes': return resolve_yes__has_tail;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Treferencer['has tail'], parent:Creferencer) {
			super(data, parent);
		}
	}
	export class Dhead extends Cnode_path {
		constructor(data:Treferencer['head'], parent:Creferencer) {
			super(data, parent, {
				context_direction: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(() => interface_.Cdirection.Pself)
						.result!
					).result!, false),
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.this())
						.then(context => context?.component_root.output.this_node())
						.result!
					).result!, false),
				dependency: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(() => interface_.Cdependency.Pallowed)
						.result!
					).result!, false),
				participation: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(() => interface_.Cparticipation.Psingular)
						.result!
					).result!, false),
				this: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.this())
						.result!
					).result!, false)
			})
		}
	}
	export class Drules extends Cwhere_clause {
		constructor(data:Treferencer['rules'], parent:Creferencer) {
			super(data, parent, {
				context_constraint: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(() => interface_.Ccontext_constraint.Pcontext_node)
						.result!
					).result!, false),
				context_direction: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.properties.has_tail.state.node.output.direction())
						.result!
					).result!, false),
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.properties.has_tail.state.node.output.node())
						.result!
					).result!, false),
				this: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.this())
						.result!
					).result!, false)
			})
		}
	}
	export class Dtype<T extends
		{ name: 'sibling', node:Csibling, init:Tsibling}|
		{ name: 'unrestricted', node:Cunrestricted, init:Tunrestricted}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'sibling': return (init:Tsibling, parent:Creferencer) => new Csibling(init, parent);
				case 'unrestricted': return (init:Tunrestricted, parent:Creferencer) => new Cunrestricted(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'sibling': return resolve_sibling;
				case 'unrestricted': return resolve_unrestricted;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Treferencer['type'], parent:Creferencer) {
			super(data, parent);
		}
	}
}
export namespace Cyes__has_tail {
	export class Dtail extends Cnode_path_tail {
		constructor(data:Tyes__has_tail['tail'], parent:Cyes__has_tail) {
			super(data, parent, {
				context_direction: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.properties.head)
						.then(context => context?.component_root.output.direction())
						.result!
					).result!, false),
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.properties.type.state.node.output.collection())
						.then(context => context?.properties.node)
						.result!
					).result!, false),
				dependency: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(() => interface_.Cdependency.Pdisallowed)
						.result!
					).result!, false),
				participation: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(() => interface_.Cparticipation.Pconditional)
						.result!
					).result!, false)
			})
		}
	}
}
export namespace Csibling {
	export class Dgraph_participation<T extends
		{ name: 'no', node:Cno__graph_participation, init:Tno__graph_participation}|
		{ name: 'yes', node:Cyes__graph_participation, init:Tyes__graph_participation}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__graph_participation, parent:Csibling) => new Cno__graph_participation(init, parent);
				case 'yes': return (init:Tyes__graph_participation, parent:Csibling) => new Cyes__graph_participation(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'no': return resolve_no__graph_participation;
				case 'yes': return resolve_yes__graph_participation;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tsibling['graph participation'], parent:Csibling) {
			super(data, parent);
		}
	}
}
export namespace Cyes__graph_participation {
	export class Dgraphs extends AlanDictionary<{ node:Cgraphs__yes, init:Tgraphs__yes},Cyes__graph_participation> {
		protected graph_iterator(graph:string):(node:Cgraphs__yes) => Cgraphs__yes { throw new Error(`Dictionary has no graph iterators.`); }
		protected initialize(parent:Cyes__graph_participation, key:string) { return new Cgraphs__yes(key, {}, parent); }
		protected resolve = resolve_graphs__yes
		protected get path() { return `${this.parent.path}/graphs`; }
		constructor(data:Tyes__graph_participation['graphs'], parent:Cyes__graph_participation) {
			super(data, parent);
		}
	}
}
export namespace Cunrestricted {
	export class Dcollection extends Reference<interface_.Ccollection__type__property,string> {

		constructor(data:string, $this:Cunrestricted) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.parent)
				.then(context => context?.properties.head)
				.then(context => context?.component_root.output.node())
				.then(context => context?.properties.attributes.get(this.entry))

				.then(context => context?.properties.type.cast('property').properties.type.cast('collection')).result!, true))
		}
	}
}
export namespace Cwhere_clause {
	export class Dhas_rule<T extends
		{ name: 'no', node:Cno__has_rule, init:Tno__has_rule}|
		{ name: 'yes', node:Cyes__has_rule, init:Tyes__has_rule}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__has_rule, parent:Cwhere_clause) => new Cno__has_rule(init, parent);
				case 'yes': return (init:Tyes__has_rule, parent:Cwhere_clause) => new Cyes__has_rule(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'no': return resolve_no__has_rule;
				case 'yes': return resolve_yes__has_rule;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Twhere_clause['has rule'], parent:Cwhere_clause) {
			super(data, parent);
		}
	}
	export class Drules extends AlanDictionary<{ node:Crules, init:Trules},Cwhere_clause,|'order'> {
		protected graph_iterator(graph:(|'order')):(node:Crules) => Crules {
			switch (graph) {
				case 'order': return (entry:Crules) => resolve(entry)
					.then(context => context?.properties.has_successor.state.name === 'yes' ? context.properties.has_successor.state.node as Cyes__has_successor__rules : undefined)
					.then(context => context?.properties.successor.ref).result!
				default: throw new Error(`${graph} is not a valid graph iterator!`);
			}
		}
		protected initialize(parent:Cwhere_clause, key:string, entry_init:Trules) { return new Crules(key, entry_init, parent); }
		protected resolve = resolve_rules
		protected get path() { return `${this.parent.path}/rules`; }
		constructor(data:Twhere_clause['rules'], parent:Cwhere_clause) {
			super(data, parent);
		}
	}
}
export namespace Cyes__has_rule {
	export class Dfirst extends Reference<interface_.Crules,string> {

		constructor(data:string, $this:Cyes__has_rule) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.parent)
				.then(context => context?.properties.rules.get(this.entry))
				.result!, true))
		}
	}
}
export namespace Crules {
	export class Dcontext<T extends
		{ name: 'context', node:Ccontext, init:Tcontext}|
		{ name: 'sibling rule', node:Csibling_rule, init:Tsibling_rule}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'context': return (init:Tcontext, parent:Crules) => new Ccontext(init, parent);
				case 'sibling rule': return (init:Tsibling_rule, parent:Crules) => new Csibling_rule(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'context': return resolve_context;
				case 'sibling rule': return resolve_sibling_rule;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Trules['context'], parent:Crules) {
			super(data, parent);
		}
	}
	export class Dhas_successor<T extends
		{ name: 'no', node:Cno__has_successor__rules, init:Tno__has_successor__rules}|
		{ name: 'yes', node:Cyes__has_successor__rules, init:Tyes__has_successor__rules}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__has_successor__rules, parent:Crules) => new Cno__has_successor__rules(init, parent);
				case 'yes': return (init:Tyes__has_successor__rules, parent:Crules) => new Cyes__has_successor__rules(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'no': return resolve_no__has_successor__rules;
				case 'yes': return resolve_yes__has_successor__rules;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Trules['has successor'], parent:Crules) {
			super(data, parent);
		}
	}
	export class Dtail extends Cnode_path_tail {
		constructor(data:Trules['tail'], parent:Crules) {
			super(data, parent, {
				context_direction: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.properties.context.state.node.output.direction())
						.result!
					).result!, false),
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.properties.context.state.node.output.node())
						.result!
					).result!, false),
				dependency: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(() => interface_.Cdependency.Pallowed)
						.result!
					).result!, false),
				participation: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(() => interface_.Cparticipation.Pconditional)
						.result!
					).result!, false)
			})
		}
	}
}
export namespace Ccontext {
	export class Dpath extends Ccontext_node_path {
		constructor(data:Tcontext['path'], parent:Ccontext) {
			super(data, parent, {
				context_constraint: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.context_constraint())
						.result!
					).result!, false),
				context_direction: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.context_direction())
						.result!
					).result!, false),
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.context_node())
						.result!
					).result!, false),
				this: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.this())
						.result!
					).result!, false)
			})
		}
	}
}
export namespace Csibling_rule {
	export class Drule extends Reference<interface_.Crules,string> {

		constructor(data:string, $this:Csibling_rule) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.parent)
				.then(context => context?.parent.properties.rules.get(this.entry))
				.result!, true))
		}
	}
}
export namespace Cyes__has_successor__rules {
	export class Dsuccessor extends Reference<interface_.Crules,string> {

		constructor(data:string, $this:Cyes__has_successor__rules) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.parent)
				.then(context => context?.parent.properties.rules.get(this.entry))
				.result!, true))
		}
	}
}
export namespace Cinterface {
	export class Dcontext_keys extends AlanDictionary<{ node:Ccontext_keys, init:Tcontext_keys},Cinterface> {
		protected graph_iterator(graph:string):(node:Ccontext_keys) => Ccontext_keys { throw new Error(`Dictionary has no graph iterators.`); }
		protected initialize(parent:Cinterface, key:string) { return new Ccontext_keys(key, {}, parent); }
		protected resolve = resolve_context_keys
		protected get path() { return `${this.parent.path}/context keys`; }
		constructor(data:Tinterface['context keys'], parent:Cinterface) {
			super(data, parent);
		}
	}
	export class Dnumerical_types extends AlanDictionary<{ node:Cnumerical_types, init:Tnumerical_types},Cinterface> {
		protected graph_iterator(graph:string):(node:Cnumerical_types) => Cnumerical_types { throw new Error(`Dictionary has no graph iterators.`); }
		protected initialize(parent:Cinterface, key:string) { return new Cnumerical_types(key, {}, parent); }
		protected resolve = resolve_numerical_types
		protected get path() { return `${this.parent.path}/numerical types`; }
		constructor(data:Tinterface['numerical types'], parent:Cinterface) {
			super(data, parent);
		}
	}
	export class Droot extends Cnode {
		constructor(data:Tinterface['root'], parent:Cinterface) {
			super(data, parent, {
				entity: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.definitions.entity)
						.result!
					).result!, false),
				location: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.definitions.node_location)
						.result!
					).result!, false),
				parent: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(() => interface_.Cnode_parent.Pnone)
						.result!
					).result!, false)
			})
		}
	}
}
/* de(resolution) */
function auto_defer<T extends (...args:any) => void>(root:Cinterface, callback:T):T {
	return callback;
}
function resolve_context_node(obj:Ccontext_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_reference__type__parameter_definition(obj:Creference__type__parameter_definition, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cyes__has_constraint__text__type__properties>(obj.properties.reference as any).resolve)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cexisting>obj.properties.reference.inferences.existing_entry_reference)(detach) !== undefined || detach);
}
function resolve_state_context_rule__type__parameter_definition(obj:Cstate_context_rule__type__parameter_definition, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cstates__state_group__type__properties>obj.inferences.state)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Crules>(obj.properties.rule as any).resolve)(detach) !== undefined || detach);
}
function resolve_parameter_definition__context(obj:Cparameter_definition__context, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cparameter_definition__interface>obj.inferences.context_parameter)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Ccontext_constraint>obj.inferences.unbounded_navigation)(detach) !== undefined || detach);
	resolve_context_parameter_path(obj.properties.head, detach);
	obj.properties.type.switch({
		'reference': node => resolve_reference__type__parameter_definition(node, detach),
		'state context rule': node => resolve_state_context_rule__type__parameter_definition(node, detach)
	});
}
function resolve_root(obj:Croot, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Ccontext_constraint>obj.inferences.unbounded_navigation)(detach) !== undefined || detach);
}
function resolve_this_node(obj:Cthis_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Ccontext_constraint>obj.inferences.unbounded_navigation)(detach) !== undefined || detach);
}
function resolve_context_node_path(obj:Ccontext_node_path, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.context.switch({
		'context node': node => resolve_context_node(node, detach),
		'parameter definition': node => resolve_parameter_definition__context(node, detach),
		'root': node => resolve_root(node, detach),
		'this node': node => resolve_this_node(node, detach)
	});
}
function resolve_no__has_steps__context_parameter_path(obj:Cno__has_steps__context_parameter_path, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_group__type__yes__has_steps__context_parameter_path(obj:Cgroup__type__yes__has_steps__context_parameter_path, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cgroup__type__properties>(obj.properties.group as any).resolve)(detach) !== undefined || detach);
}
function resolve_parent__type__yes__has_steps__context_parameter_path(obj:Cparent__type__yes__has_steps__context_parameter_path, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cparameter_definition__interface>obj.inferences.parent_parameter)(detach) !== undefined || detach);
}
function resolve_yes__has_steps__context_parameter_path(obj:Cyes__has_steps__context_parameter_path, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_context_parameter_path(obj.properties.tail, detach);
	obj.properties.type.switch({
		'group': node => resolve_group__type__yes__has_steps__context_parameter_path(node, detach),
		'parent': node => resolve_parent__type__yes__has_steps__context_parameter_path(node, detach)
	});
}
function resolve_context_parameter_path(obj:Ccontext_parameter_path, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.has_steps.switch({
		'no': node => resolve_no__has_steps__context_parameter_path(node, detach),
		'yes': node => resolve_yes__has_steps__context_parameter_path(node, detach)
	});
}
function resolve_acyclic(obj:Cacyclic, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_ordered(obj:Cordered, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cproperty>(obj.properties.ordering_property as any).resolve)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cyes__graph_participation>obj.properties.ordering_property.inferences.graph_participation)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cgraphs__yes>obj.properties.ordering_property.inferences.participates_in_this_graph)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cyes__has_constraint__text__type__property>obj.properties.ordering_property.inferences.reference)(detach) !== undefined || detach);
	resolve_node_path_tail(obj.properties.path, detach);
}
function resolve_graphs__graphs_definition(obj:Cgraphs__graphs_definition, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.type.switch({
		'acyclic': node => resolve_acyclic(node, detach),
		'ordered': node => resolve_ordered(node, detach)
	});
}
function resolve_graphs_definition(obj:Cgraphs_definition, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.graphs.forEach(entry => resolve_graphs__graphs_definition(entry, detach));
}
function resolve_command(obj:Ccommand, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_parameter_definition__interface(obj.properties.parameters, detach);
}
function resolve_collection__type__property(obj:Ccollection__type__property, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_graphs_definition(obj.properties.graphs, detach);
	assert((<(detach?:boolean) => interface_.Ctext__type__property>(obj.properties.key_property as any).resolve)(detach) !== undefined || detach);
	resolve_node(obj.properties.node, detach);
}
function resolve_file__type__property(obj:Cfile__type__property, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_group__type__property(obj:Cgroup__type__property, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_node(obj.properties.node, detach);
}
function resolve_number__type__property(obj:Cnumber__type__property, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_number_type(obj.properties.type, detach);
}
function resolve_no__has_successor__states__state_group__type__property(obj:Cno__has_successor__states__state_group__type__property, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_yes__has_successor__states__state_group__type__property(obj:Cyes__has_successor__states__state_group__type__property, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cstates__state_group__type__property>(obj.properties.successor as any).resolve)(detach) !== undefined || detach);
}
function resolve_states__state_group__type__property(obj:Cstates__state_group__type__property, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_where_clause(obj.properties.context_rules, detach);
	obj.properties.has_successor.switch({
		'no': node => resolve_no__has_successor__states__state_group__type__property(node, detach),
		'yes': node => resolve_yes__has_successor__states__state_group__type__property(node, detach)
	});
	resolve_node(obj.properties.node, detach);
}
function resolve_state_group__type__property(obj:Cstate_group__type__property, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cstates__state_group__type__property>(obj.properties.first_state as any).resolve)(detach) !== undefined || detach);
	obj.properties.states.forEach(entry => resolve_states__state_group__type__property(entry, detach));
}
function resolve_no__has_constraint__text__type__property(obj:Cno__has_constraint__text__type__property, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_yes__has_constraint__text__type__property(obj:Cyes__has_constraint__text__type__property, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_referencer(obj.properties.referencer, detach);
}
function resolve_text__type__property(obj:Ctext__type__property, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.has_constraint.switch({
		'no': node => resolve_no__has_constraint__text__type__property(node, detach),
		'yes': node => resolve_yes__has_constraint__text__type__property(node, detach)
	});
}
function resolve_property(obj:Cproperty, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cmember_type>obj.inferences.member_type)(detach) !== undefined || detach);
	obj.properties.type.switch({
		'collection': node => resolve_collection__type__property(node, detach),
		'file': node => resolve_file__type__property(node, detach),
		'group': node => resolve_group__type__property(node, detach),
		'number': node => resolve_number__type__property(node, detach),
		'state group': node => resolve_state_group__type__property(node, detach),
		'text': node => resolve_text__type__property(node, detach)
	});
}
function resolve_attributes(obj:Cattributes, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.type.switch({
		'command': node => resolve_command(node, detach),
		'property': node => resolve_property(node, detach)
	});
}
function resolve_node(obj:Cnode, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.attributes.forEach(entry => resolve_attributes(entry, detach));
}
function resolve_node_path(obj:Cnode_path, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_context_node_path(obj.properties.head, detach);
	resolve_node_path_tail(obj.properties.tail, detach);
}
function resolve_no__has_steps__node_path_tail(obj:Cno__has_steps__node_path_tail, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_group__type__yes__has_steps__node_path_tail(obj:Cgroup__type__yes__has_steps__node_path_tail, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cgroup__type__property>(obj.properties.group as any).resolve)(detach) !== undefined || detach);
}
function resolve_parent__type__yes__has_steps__node_path_tail(obj:Cparent__type__yes__has_steps__node_path_tail, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Centity>obj.inferences.context_entity)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cnode>obj.inferences.parent_node)(detach) !== undefined || detach);
}
function resolve_reference__type__yes(obj:Creference__type__yes, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cdependency>obj.inferences.dependency_allowed)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cyes__has_constraint__text__type__property>(obj.properties.reference as any).resolve)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cdirection>obj.properties.reference.inferences.direction)(detach) !== undefined || detach);
}
function resolve_reference_rule(obj:Creference_rule, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cdependency>obj.inferences.dependency_allowed)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cyes__has_constraint__text__type__property>(obj.properties.reference as any).resolve)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Crules>(obj.properties.rule as any).resolve)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cdirection>obj.properties.rule.inferences.direction)(detach) !== undefined || detach);
}
function resolve_state__type(obj:Cstate__type, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cparticipation>obj.inferences.conditional_result)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cstates__state_group__type__property>(obj.properties.state as any).resolve)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cstate_group__type__property>(obj.properties.state_group as any).resolve)(detach) !== undefined || detach);
}
function resolve_state_context_rule__type__yes(obj:Cstate_context_rule__type__yes, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cstates__state_group__type__property>obj.inferences.state)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Crules>(obj.properties.context_rule as any).resolve)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cdirection>obj.properties.context_rule.inferences.direction)(detach) !== undefined || detach);
}
function resolve_yes__has_steps__node_path_tail(obj:Cyes__has_steps__node_path_tail, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_node_path_tail(obj.properties.tail, detach);
	obj.properties.type.switch({
		'group': node => resolve_group__type__yes__has_steps__node_path_tail(node, detach),
		'parent': node => resolve_parent__type__yes__has_steps__node_path_tail(node, detach),
		'reference': node => resolve_reference__type__yes(node, detach),
		'reference rule': node => resolve_reference_rule(node, detach),
		'state': node => resolve_state__type(node, detach),
		'state context rule': node => resolve_state_context_rule__type__yes(node, detach)
	});
}
function resolve_node_path_tail(obj:Cnode_path_tail, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.has_steps.switch({
		'no': node => resolve_no__has_steps__node_path_tail(node, detach),
		'yes': node => resolve_yes__has_steps__node_path_tail(node, detach)
	});
}
function resolve_no__decimal_places(obj:Cno__decimal_places, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_yes__decimal_places(obj:Cyes__decimal_places, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_integer(obj:Cinteger, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_natural(obj:Cnatural, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_number_type(obj:Cnumber_type, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.decimal_places.switch({
		'no': node => resolve_no__decimal_places(node, detach),
		'yes': node => resolve_yes__decimal_places(node, detach)
	});
	obj.properties.set.switch({
		'integer': node => resolve_integer(node, detach),
		'natural': node => resolve_natural(node, detach)
	});
	assert((<(detach?:boolean) => interface_.Cnumerical_types>(obj.properties.type as any).resolve)(detach) !== undefined || detach);
}
function resolve_dense_map(obj:Cdense_map, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cyes__has_constraint__text__type__properties>obj.inferences.key_constraint)(detach) !== undefined || detach);
}
function resolve_simple(obj:Csimple, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_collection__type__properties(obj:Ccollection__type__properties, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Ctext__type__properties>(obj.properties.key_property as any).resolve)(detach) !== undefined || detach);
	resolve_parameter_definition__interface(obj.properties.parameters, detach);
	obj.properties.type.switch({
		'dense map': node => resolve_dense_map(node, detach),
		'simple': node => resolve_simple(node, detach)
	});
}
function resolve_file__type__properties(obj:Cfile__type__properties, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_group__type__properties(obj:Cgroup__type__properties, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_parameter_definition__interface(obj.properties.parameters, detach);
}
function resolve_number__type__properties(obj:Cnumber__type__properties, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_number_type(obj.properties.type, detach);
}
function resolve_no__has_successor__states__state_group__type__properties(obj:Cno__has_successor__states__state_group__type__properties, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_yes__has_successor__states__state_group__type__properties(obj:Cyes__has_successor__states__state_group__type__properties, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cstates__state_group__type__properties>(obj.properties.successor as any).resolve)(detach) !== undefined || detach);
}
function resolve_states__state_group__type__properties(obj:Cstates__state_group__type__properties, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_where_clause(obj.properties.context_rules, detach);
	obj.properties.has_successor.switch({
		'no': node => resolve_no__has_successor__states__state_group__type__properties(node, detach),
		'yes': node => resolve_yes__has_successor__states__state_group__type__properties(node, detach)
	});
	resolve_parameter_definition__interface(obj.properties.parameters, detach);
}
function resolve_state_group__type__properties(obj:Cstate_group__type__properties, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cstates__state_group__type__properties>(obj.properties.first_state as any).resolve)(detach) !== undefined || detach);
	obj.properties.states.forEach(entry => resolve_states__state_group__type__properties(entry, detach));
}
function resolve_no__has_constraint__text__type__properties(obj:Cno__has_constraint__text__type__properties, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_existing(obj:Cexisting, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_new(obj:Cnew, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_yes__has_constraint__text__type__properties(obj:Cyes__has_constraint__text__type__properties, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_referencer(obj.properties.referencer, detach);
	obj.properties.type.switch({
		'existing': node => resolve_existing(node, detach),
		'new': node => resolve_new(node, detach)
	});
}
function resolve_text__type__properties(obj:Ctext__type__properties, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cmember_type>obj.inferences.member_type)(detach) !== undefined || detach);
	obj.properties.has_constraint.switch({
		'no': node => resolve_no__has_constraint__text__type__properties(node, detach),
		'yes': node => resolve_yes__has_constraint__text__type__properties(node, detach)
	});
}
function resolve_properties(obj:Cproperties, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.type.switch({
		'collection': node => resolve_collection__type__properties(node, detach),
		'file': node => resolve_file__type__properties(node, detach),
		'group': node => resolve_group__type__properties(node, detach),
		'number': node => resolve_number__type__properties(node, detach),
		'state group': node => resolve_state_group__type__properties(node, detach),
		'text': node => resolve_text__type__properties(node, detach)
	});
}
function resolve_parameter_definition__interface(obj:Cparameter_definition__interface, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.properties.forEach(entry => resolve_properties(entry, detach));
}
function resolve_no__has_tail(obj:Cno__has_tail, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_yes__has_tail(obj:Cyes__has_tail, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_node_path_tail(obj.properties.tail, detach);
}
function resolve_no__graph_participation(obj:Cno__graph_participation, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_graphs__yes(obj:Cgraphs__yes, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cgraphs__graphs_definition>(obj.key as any).resolve)(detach) !== undefined || detach);
}
function resolve_yes__graph_participation(obj:Cyes__graph_participation, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cdirection>obj.inferences.self_navigation)(detach) !== undefined || detach);
	obj.properties.graphs.forEach(entry => resolve_graphs__yes(entry, detach));
}
function resolve_sibling(obj:Csibling, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Ccollection__type__property>obj.inferences.collection)(detach) !== undefined || detach);
	obj.properties.graph_participation.switch({
		'no': node => resolve_no__graph_participation(node, detach),
		'yes': node => resolve_yes__graph_participation(node, detach)
	});
}
function resolve_unrestricted(obj:Cunrestricted, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Ccollection__type__property>(obj.properties.collection as any).resolve)(detach) !== undefined || detach);
}
function resolve_referencer(obj:Creferencer, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.has_tail.switch({
		'no': node => resolve_no__has_tail(node, detach),
		'yes': node => resolve_yes__has_tail(node, detach)
	});
	resolve_node_path(obj.properties.head, detach);
	resolve_where_clause(obj.properties.rules, detach);
	obj.properties.type.switch({
		'sibling': node => resolve_sibling(node, detach),
		'unrestricted': node => resolve_unrestricted(node, detach)
	});
}
function resolve_no__has_rule(obj:Cno__has_rule, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_yes__has_rule(obj:Cyes__has_rule, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Crules>(obj.properties.first as any).resolve)(detach) !== undefined || detach);
}
function resolve_context(obj:Ccontext, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_context_node_path(obj.properties.path, detach);
}
function resolve_sibling_rule(obj:Csibling_rule, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Crules>(obj.properties.rule as any).resolve)(detach) !== undefined || detach);
}
function resolve_no__has_successor__rules(obj:Cno__has_successor__rules, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_yes__has_successor__rules(obj:Cyes__has_successor__rules, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Crules>(obj.properties.successor as any).resolve)(detach) !== undefined || detach);
}
function resolve_rules(obj:Crules, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.context.switch({
		'context': node => resolve_context(node, detach),
		'sibling rule': node => resolve_sibling_rule(node, detach)
	});
	obj.properties.has_successor.switch({
		'no': node => resolve_no__has_successor__rules(node, detach),
		'yes': node => resolve_yes__has_successor__rules(node, detach)
	});
	resolve_node_path_tail(obj.properties.tail, detach);
}
function resolve_where_clause(obj:Cwhere_clause, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.has_rule.switch({
		'no': node => resolve_no__has_rule(node, detach),
		'yes': node => resolve_yes__has_rule(node, detach)
	});
	obj.properties.rules.forEach(entry => resolve_rules(entry, detach));
}
function resolve_context_keys(obj:Ccontext_keys, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_numerical_types(obj:Cnumerical_types, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_interface(obj:Cinterface, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.context_keys.forEach(entry => resolve_context_keys(entry, detach));
	obj.properties.numerical_types.forEach(entry => resolve_numerical_types(entry, detach));
	resolve_node(obj.properties.root, detach);
}

export namespace Cinterface {
	export function create(init:Tinterface, lazy_eval:boolean = false):Cinterface {
		const instance = new Cinterface(init, lazy_eval);
		if (!lazy_eval) resolve_interface(instance);
		return instance;
	};
}
