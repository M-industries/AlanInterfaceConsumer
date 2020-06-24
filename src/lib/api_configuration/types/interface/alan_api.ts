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
export type Tancestor_parameters_selection = {
	'has steps':'no'|['no', {}]|['yes', Tyes__has_steps__ancestor_parameters_selection];
};
export class Cancestor_parameters_selection extends AlanNode {
	public readonly properties:{
		readonly has_steps:Cancestor_parameters_selection.Dhas_steps<
			{ name: 'no', node:Cno__has_steps__ancestor_parameters_selection, init:Tno__has_steps__ancestor_parameters_selection}|
			{ name: 'yes', node:Cyes__has_steps__ancestor_parameters_selection, init:Tyes__has_steps__ancestor_parameters_selection}>
	};
	public readonly output:{
		result_parameters: () => interface_.Ccommand_parameters;
	} = {
		result_parameters: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.has_steps.state.node.output.result_parameters())
				.result!
			).result!)
	};
	constructor(init:Tancestor_parameters_selection, public location:AlanNode, public input: {
		context_parameters: () => interface_.Ccommand_parameters
	}) {
		super();
		const $this = this;
		this.properties = {
			has_steps: new Cancestor_parameters_selection.Dhas_steps(init['has steps'], $this)
		};
	}
	public get root() { return this.location.root; }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/ancestor parameters selection`; }
}
export type Tno__has_steps__ancestor_parameters_selection = {
};
export class Cno__has_steps__ancestor_parameters_selection extends AlanNode {
	public readonly output:{
		result_parameters: () => interface_.Ccommand_parameters;
	} = {
		result_parameters: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.context_parameters())
				.result!
			).result!, false)
	}
	constructor(init:Tno__has_steps__ancestor_parameters_selection, public parent:Cancestor_parameters_selection) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has steps?no`; }
}
export type Tyes__has_steps__ancestor_parameters_selection = {
	'tail':Tancestor_parameters_selection;
	'type':'matrix parent'|['matrix parent', {}]|'state parent'|['state parent', {}];
};
export class Cyes__has_steps__ancestor_parameters_selection extends AlanNode {
	public readonly properties:{
		readonly tail:Cancestor_parameters_selection,
		readonly type:Cyes__has_steps__ancestor_parameters_selection.Dtype<
			{ name: 'matrix parent', node:Cmatrix_parent, init:Tmatrix_parent}|
			{ name: 'state parent', node:Cstate_parent__type__yes__has_steps__ancestor_parameters_selection, init:Tstate_parent__type__yes__has_steps__ancestor_parameters_selection}>
	};
	public readonly output:{
		result_parameters: () => interface_.Ccommand_parameters;
	} = {
		result_parameters: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.tail)
				.then(context => context?.component_root.output.result_parameters())
				.result!
			).result!, false)
	}
	public readonly inferences:{
		parent_parameter: () => interface_.Ccommand_parameters
	} = {
		parent_parameter: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.component_root.input.context_parameters())
			.then(context => context?.component_root.output.parent())
			.then(context => context?.cast('parameter'))
			.result!, true)
	}
	constructor(init:Tyes__has_steps__ancestor_parameters_selection, public parent:Cancestor_parameters_selection) {
		super();
		const $this = this;
		this.properties = {
			tail: new Cyes__has_steps__ancestor_parameters_selection.Dtail(init['tail'], $this),
			type: new Cyes__has_steps__ancestor_parameters_selection.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has steps?yes`; }
}
export type Tmatrix_parent = {
};
export class Cmatrix_parent extends AlanNode {
	constructor(init:Tmatrix_parent, public parent:Cyes__has_steps__ancestor_parameters_selection) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?matrix parent`; }
}
export type Tstate_parent__type__yes__has_steps__ancestor_parameters_selection = {
};
export class Cstate_parent__type__yes__has_steps__ancestor_parameters_selection extends AlanNode {
	constructor(init:Tstate_parent__type__yes__has_steps__ancestor_parameters_selection, public parent:Cyes__has_steps__ancestor_parameters_selection) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?state parent`; }
}
type Vchoice = { name: 'state group parameter', definition: Cstate_group__type__properties}|{ name: 'state group property', definition: Cstate_group__type__property}
export class Cchoice extends AlanObject {
	constructor(
		public readonly variant:Vchoice) { super(); }
	public definitions:{
		value: Cvalue;
	} = {
		value: new Cvalue({name:'choice', definition: this})
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
type Vcollection__interface = { name: 'node collection', definition: Ccollection__type__property}|{ name: 'parameter collection', definition: Cmatrix__type__properties}
export class Ccollection__interface extends AlanObject {
	constructor(
		public readonly variant:Vcollection__interface, public input: {
			value: () => interface_.Cvalue
		}) { super(); }
	public definitions:{
		value: Cvalue;
	} = {
		value: new Cvalue({name:'collection', definition: this})
	}
	public readonly output:{
		value: () => interface_.Cvalue;
	} = {
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
export type Tcommand_parameter_referencer = {
	'collection':string;
	'context type':['command parameter', Tcommand_parameter]|'context node'|['context node', {}];
	'head':Tnode_selection_path;
	'tail':Tnode_content_path;
};
export class Ccommand_parameter_referencer extends AlanNode {
	public readonly properties:{
		readonly collection:Ccommand_parameter_referencer.Dcollection,
		readonly context_type:Ccommand_parameter_referencer.Dcontext_type<
			{ name: 'command parameter', node:Ccommand_parameter, init:Tcommand_parameter}|
			{ name: 'context node', node:Ccontext_node, init:Tcontext_node}>,
		readonly head:Cnode_selection_path,
		readonly tail:Cnode_content_path
	};
	public readonly output:{
		referenced_node: () => interface_.Cnode;
	} = {
		referenced_node: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.tail)
				.then(context => context?.component_root.output.result_interface_node())
				.result!
			).result!)
	};
	constructor(init:Tcommand_parameter_referencer, public location:AlanNode, public input: {
		context_node: () => interface_.Cnode,
		parameter: () => interface_.Ccommand_parameters
	}) {
		super();
		const $this = this;
		this.properties = {
			collection: new Ccommand_parameter_referencer.Dcollection(init['collection'], $this),
			context_type: new Ccommand_parameter_referencer.Dcontext_type(init['context type'], $this),
			head: new Ccommand_parameter_referencer.Dhead(init['head'], $this),
			tail: new Ccommand_parameter_referencer.Dtail(init['tail'], $this)
		};
	}
	public get root() { return this.location.root; }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/command parameter referencer`; }
}
export type Tcommand_parameter = {
	'ancestor selection':Tancestor_parameters_selection;
	'type':'key'|['key', {}]|['reference', Treference__type__command_parameter];
};
export class Ccommand_parameter extends AlanNode {
	public readonly properties:{
		readonly ancestor_selection:Cancestor_parameters_selection,
		readonly type:Ccommand_parameter.Dtype<
			{ name: 'key', node:Ckey, init:Tkey}|
			{ name: 'reference', node:Creference__type__command_parameter, init:Treference__type__command_parameter}>
	};
	public readonly output:{
		result_node: () => interface_.Cnode;
	} = {
		result_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.type.state.node.output.result_node())
				.result!
			).result!, false)
	}
	constructor(init:Tcommand_parameter, public parent:Ccommand_parameter_referencer) {
		super();
		const $this = this;
		this.properties = {
			ancestor_selection: new Ccommand_parameter.Dancestor_selection(init['ancestor selection'], $this),
			type: new Ccommand_parameter.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/context type?command parameter`; }
}
export type Tkey = {
};
export class Ckey extends AlanNode {
	public readonly output:{
		result_node: () => interface_.Cnode;
	} = {
		result_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.inferences.matrix()).then(context => context?.properties.referencer)
				.then(context => context?.component_root.output.referenced_node())
				.result!
			).result!, false)
	}
	public readonly inferences:{
		matrix: () => interface_.Cmatrix__type__properties
	} = {
		matrix: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.properties.ancestor_selection)
			.then(context => context?.component_root.output.result_parameters())
			.then(context => context?.component_root.output.location())
			.then(context => context?.cast('matrix'))
			.result!, true)
	}
	constructor(init:Tkey, public parent:Ccommand_parameter) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?key`; }
}
export type Treference__type__command_parameter = {
	'reference':string;
};
export class Creference__type__command_parameter extends AlanNode {
	public readonly properties:{
		readonly reference:Creference__type__command_parameter.Dreference
	};
	public readonly output:{
		result_node: () => interface_.Cnode;
	} = {
		result_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.reference.ref)
				.then(context => context?.properties.referencer)
				.then(context => context?.component_root.output.referenced_node())
				.result!
			).result!, false)
	}
	constructor(init:Treference__type__command_parameter, public parent:Ccommand_parameter) {
		super();
		const $this = this;
		this.properties = {
			reference: new Creference__type__command_parameter.Dreference(init['reference'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?reference`; }
}
export type Tcontext_node = {
};
export class Ccontext_node extends AlanNode {
	public readonly output:{
		result_node: () => interface_.Cnode;
	} = {
		result_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.context_node())
				.result!
			).result!, false)
	}
	constructor(init:Tcontext_node, public parent:Ccommand_parameter_referencer) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/context type?context node`; }
}
export type Tcommand_parameters = {
	'properties':Record<string, Tproperties>;
};
export class Ccommand_parameters extends AlanNode {
	public definitions:{
		object: Cobject;
		parameter_parent: Cparameter_parent;
	} = {
		object: new Cobject({name:'parameter', definition: this}),
		parameter_parent: new Cparameter_parent({name:'parameter', definition: this})
	}
	public readonly properties:{
		readonly properties:Ccommand_parameters.Dproperties
	};
	public readonly output:{
		location: () => interface_.Cparameter_location;
		parent: () => interface_.Cparameter_parent;
	} = {
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
	constructor(init:Tcommand_parameters, public location:AlanNode, public input: {
		context_node: () => interface_.Cnode,
		location: () => interface_.Cparameter_location,
		parent: () => interface_.Cparameter_parent
	}) {
		super();
		const $this = this;
		this.properties = {
			properties: new Ccommand_parameters.Dproperties(init['properties'], $this)
		};
	}
	public get root() { return this.location.root; }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/command parameters`; }
}
export type Tproperties = {
	'type':'file'|['file', {}]|['matrix', Tmatrix__type__properties]|['number', Tnumber__type__properties]|['reference', Treference__type__properties]|['state group', Tstate_group__type__properties]|'text'|['text', {}];
};
export class Cproperties extends AlanNode {
	public key:string;
	public definitions:{
		member: Cmember;
		value_member: Cvalue_member;
	} = {
		member: new Cmember({name:'parameter', definition: this}),
		value_member: new Cvalue_member({name:'parameter', definition: this}, {
			value: cache(() => resolve(this).then(this_context => resolve(this_context)
					.then(context => context?.properties.type.state.node.output.value())
					.result!
				).result!, false)
		})
	}
	public readonly properties:{
		readonly type:Cproperties.Dtype<
			{ name: 'file', node:Cfile__type__properties, init:Tfile__type__properties}|
			{ name: 'matrix', node:Cmatrix__type__properties, init:Tmatrix__type__properties}|
			{ name: 'number', node:Cnumber__type__properties, init:Tnumber__type__properties}|
			{ name: 'reference', node:Creference__type__properties, init:Treference__type__properties}|
			{ name: 'state group', node:Cstate_group__type__properties, init:Tstate_group__type__properties}|
			{ name: 'text', node:Ctext__type__properties, init:Ttext__type__properties}>
	};
	constructor(key:string, init:Tproperties, public parent:Ccommand_parameters) {
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
export type Tfile__type__properties = {
};
export class Cfile__type__properties extends AlanNode {
	public readonly output:{
		value: () => interface_.Cvalue;
	} = {
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
export type Tmatrix__type__properties = {
	'parameters':Tcommand_parameters;
	'referencer':Tcommand_parameter_referencer;
	'type':'dense'|['dense', {}]|'sparse'|['sparse', {}];
};
export class Cmatrix__type__properties extends AlanNode {
	public definitions:{
		collection: Ccollection__interface;
		parameter_location: Cparameter_location;
	} = {
		collection: new Ccollection__interface({name:'parameter collection', definition: this}, {
			value: cache(() => resolve(this).then(this_context => resolve(this_context)
					.then(context => context?.properties.parameters)
					.then(context => context?.definitions.object)
					.then(context => context?.definitions.value)
					.result!
				).result!, false)
		}),
		parameter_location: new Cparameter_location({name:'matrix', definition: this})
	}
	public readonly properties:{
		readonly parameters:Ccommand_parameters,
		readonly referencer:Ccommand_parameter_referencer,
		readonly type:Cmatrix__type__properties.Dtype<
			{ name: 'dense', node:Cdense, init:Tdense}|
			{ name: 'sparse', node:Csparse, init:Tsparse}>
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
	constructor(init:Tmatrix__type__properties, public parent:Cproperties) {
		super();
		const $this = this;
		this.properties = {
			parameters: new Cmatrix__type__properties.Dparameters(init['parameters'], $this),
			referencer: new Cmatrix__type__properties.Dreferencer(init['referencer'], $this),
			type: new Cmatrix__type__properties.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?matrix`; }
}
export type Tdense = {
};
export class Cdense extends AlanNode {
	constructor(init:Tdense, public parent:Cmatrix__type__properties) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?dense`; }
}
export type Tsparse = {
};
export class Csparse extends AlanNode {
	constructor(init:Tsparse, public parent:Cmatrix__type__properties) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?sparse`; }
}
export type Tnumber__type__properties = {
	'numerical type':string;
	'set':'integer'|['integer', {}]|'natural'|['natural', {}];
};
export class Cnumber__type__properties extends AlanNode {
	public readonly properties:{
		readonly numerical_type:Cnumber__type__properties.Dnumerical_type,
		readonly set:Cnumber__type__properties.Dset<
			{ name: 'integer', node:Cinteger__set__number__type__properties, init:Tinteger__set__number__type__properties}|
			{ name: 'natural', node:Cnatural__set__number__type__properties, init:Tnatural__set__number__type__properties}>
	};
	public readonly output:{
		value: () => interface_.Cvalue;
	} = {
		value: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(() => interface_.Cvalue.Pnumber)
				.result!
			).result!, false)
	}
	constructor(init:Tnumber__type__properties, public parent:Cproperties) {
		super();
		const $this = this;
		this.properties = {
			numerical_type: new Cnumber__type__properties.Dnumerical_type(init['numerical type'], $this),
			set: new Cnumber__type__properties.Dset(init['set'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?number`; }
}
export type Tinteger__set__number__type__properties = {
};
export class Cinteger__set__number__type__properties extends AlanNode {
	constructor(init:Tinteger__set__number__type__properties, public parent:Cnumber__type__properties) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/set?integer`; }
}
export type Tnatural__set__number__type__properties = {
};
export class Cnatural__set__number__type__properties extends AlanNode {
	constructor(init:Tnatural__set__number__type__properties, public parent:Cnumber__type__properties) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/set?natural`; }
}
export type Treference__type__properties = {
	'referencer':Tcommand_parameter_referencer;
};
export class Creference__type__properties extends AlanNode {
	public readonly properties:{
		readonly referencer:Ccommand_parameter_referencer
	};
	public readonly output:{
		value: () => interface_.Cvalue;
	} = {
		value: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(() => interface_.Cvalue.Ptext)
				.result!
			).result!, false)
	}
	constructor(init:Treference__type__properties, public parent:Cproperties) {
		super();
		const $this = this;
		this.properties = {
			referencer: new Creference__type__properties.Dreferencer(init['referencer'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?reference`; }
}
export type Tstate_group__type__properties = {
	'states':Record<string, Tstates__state_group__type__properties>;
};
export class Cstate_group__type__properties extends AlanNode {
	public definitions:{
		choice: Cchoice;
	} = {
		choice: new Cchoice({name:'state group parameter', definition: this})
	}
	public readonly properties:{
		readonly states:Cstate_group__type__properties.Dstates
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
	constructor(init:Tstate_group__type__properties, public parent:Cproperties) {
		super();
		const $this = this;
		this.properties = {
			states: new Cstate_group__type__properties.Dstates(init['states'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?state group`; }
}
export type Tstates__state_group__type__properties = {
	'parameters':Tcommand_parameters;
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
					.then(context => context?.definitions.value)
					.result!
				).result!, false)
		})
	}
	public readonly properties:{
		readonly parameters:Ccommand_parameters
	};
	constructor(key:string, init:Tstates__state_group__type__properties, public parent:Cstate_group__type__properties) {
		super();
		const $this = this;
		this.key = key;
		this.properties = {
			parameters: new Cstates__state_group__type__properties.Dparameters(init['parameters'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/states[${this.key}]`; }
}
export type Ttext__type__properties = {
};
export class Ctext__type__properties extends AlanNode {
	public readonly output:{
		value: () => interface_.Cvalue;
	} = {
		value: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(() => interface_.Cvalue.Ptext)
				.result!
			).result!, false)
	}
	constructor(init:Ttext__type__properties, public parent:Cproperties) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?text`; }
}
type Vmember = { name: 'attribute', definition: Cattributes}|{ name: 'parameter', definition: Cproperties}
export class Cmember extends AlanObject {
	constructor(
		public readonly variant:Vmember) { super(); }
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
export type Tnode = {
	'attributes':Record<string, Tattributes>;
};
export class Cnode extends AlanNode {
	public definitions:{
		node_parent: Cnode_parent;
		object: Cobject;
	} = {
		node_parent: new Cnode_parent({name:'node', definition: this}),
		object: new Cobject({name:'node', definition: this})
	}
	public readonly properties:{
		readonly attributes:Cnode.Dattributes
	};
	public readonly output:{
		location: () => interface_.Cnode_location;
		parent: () => interface_.Cnode_parent;
	} = {
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
		member: new Cmember({name:'attribute', definition: this})
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
	'parameters':Tcommand_parameters;
};
export class Ccommand extends AlanNode {
	public definitions:{
		parameter_location: Cparameter_location;
	} = {
		parameter_location: new Cparameter_location({name:'command', definition: this})
	}
	public readonly properties:{
		readonly parameters:Ccommand_parameters
	};
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
	'type':['collection', Tcollection__type__property]|'file'|['file', {}]|['group', Tgroup__type__property]|['number', Tnumber__type__property]|['reference', Treference__type__property]|['state group', Tstate_group__type__property]|'text'|['text', {}];
};
export class Cproperty extends AlanNode {
	public definitions:{
		value_member: Cvalue_member;
	} = {
		value_member: new Cvalue_member({name:'property', definition: this}, {
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
			{ name: 'reference', node:Creference__type__property, init:Treference__type__property}|
			{ name: 'state group', node:Cstate_group__type__property, init:Tstate_group__type__property}|
			{ name: 'text', node:Ctext__type__property, init:Ttext__type__property}>
	};
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
	'node':Tnode;
	'type':'dictionary'|['dictionary', {}]|['matrix', Tmatrix__type__collection];
};
export class Ccollection__type__property extends AlanNode {
	public definitions:{
		collection: Ccollection__interface;
		node_location: Cnode_location;
	} = {
		collection: new Ccollection__interface({name:'node collection', definition: this}, {
			value: cache(() => resolve(this).then(this_context => resolve(this_context)
					.then(context => context?.properties.node)
					.then(context => context?.definitions.object)
					.then(context => context?.definitions.value)
					.result!
				).result!, false)
		}),
		node_location: new Cnode_location({name:'collection', definition: this})
	}
	public readonly properties:{
		readonly node:Cnode,
		readonly type:Ccollection__type__property.Dtype<
			{ name: 'dictionary', node:Cdictionary, init:Tdictionary}|
			{ name: 'matrix', node:Cmatrix__type__collection, init:Tmatrix__type__collection}>
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
			node: new Ccollection__type__property.Dnode(init['node'], $this),
			type: new Ccollection__type__property.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?collection`; }
}
export type Tdictionary = {
};
export class Cdictionary extends AlanNode {
	constructor(init:Tdictionary, public parent:Ccollection__type__property) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?dictionary`; }
}
export type Tmatrix__type__collection = {
	'referencer':Treferencer;
};
export class Cmatrix__type__collection extends AlanNode {
	public readonly properties:{
		readonly referencer:Creferencer
	};
	constructor(init:Tmatrix__type__collection, public parent:Ccollection__type__property) {
		super();
		const $this = this;
		this.properties = {
			referencer: new Cmatrix__type__collection.Dreferencer(init['referencer'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?matrix`; }
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
	'set':'integer'|['integer', {}]|'natural'|['natural', {}];
	'type':string;
};
export class Cnumber__type__property extends AlanNode {
	public readonly properties:{
		readonly set:Cnumber__type__property.Dset<
			{ name: 'integer', node:Cinteger__set__number__type__property, init:Tinteger__set__number__type__property}|
			{ name: 'natural', node:Cnatural__set__number__type__property, init:Tnatural__set__number__type__property}>,
		readonly type:Cnumber__type__property.Dtype
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
			set: new Cnumber__type__property.Dset(init['set'], $this),
			type: new Cnumber__type__property.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?number`; }
}
export type Tinteger__set__number__type__property = {
};
export class Cinteger__set__number__type__property extends AlanNode {
	constructor(init:Tinteger__set__number__type__property, public parent:Cnumber__type__property) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/set?integer`; }
}
export type Tnatural__set__number__type__property = {
};
export class Cnatural__set__number__type__property extends AlanNode {
	constructor(init:Tnatural__set__number__type__property, public parent:Cnumber__type__property) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/set?natural`; }
}
export type Treference__type__property = {
	'referencer':Treferencer;
};
export class Creference__type__property extends AlanNode {
	public readonly properties:{
		readonly referencer:Creferencer
	};
	public readonly output:{
		value: () => interface_.Cvalue;
	} = {
		value: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(() => interface_.Cvalue.Ptext)
				.result!
			).result!, false)
	}
	constructor(init:Treference__type__property, public parent:Cproperty) {
		super();
		const $this = this;
		this.properties = {
			referencer: new Creference__type__property.Dreferencer(init['referencer'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?reference`; }
}
export type Tstate_group__type__property = {
	'output parameters':Record<string, Toutput_parameters>;
	'states':Record<string, Tstates__state_group__type__property>;
};
export class Cstate_group__type__property extends AlanNode {
	public definitions:{
		choice: Cchoice;
	} = {
		choice: new Cchoice({name:'state group property', definition: this})
	}
	public readonly properties:{
		readonly output_parameters:Cstate_group__type__property.Doutput_parameters,
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
			output_parameters: new Cstate_group__type__property.Doutput_parameters(init['output parameters'], $this),
			states: new Cstate_group__type__property.Dstates(init['states'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?state group`; }
}
export type Toutput_parameters = {
	'node selection':Tnode_type_path;
};
export class Coutput_parameters extends AlanNode {
	public key:string;
	public readonly properties:{
		readonly node_selection:Cnode_type_path
	};
	constructor(key:string, init:Toutput_parameters, public parent:Cstate_group__type__property) {
		super();
		const $this = this;
		this.key = key;
		this.properties = {
			node_selection: new Coutput_parameters.Dnode_selection(init['node selection'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/output parameters[${this.key}]`; }
}
export type Tstates__state_group__type__property = {
	'node':Tnode;
	'output arguments':Record<string, Toutput_arguments>;
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
					.then(context => context?.definitions.value)
					.result!
				).result!, false)
		})
	}
	public readonly properties:{
		readonly node:Cnode,
		readonly output_arguments:Cstates__state_group__type__property.Doutput_arguments
	};
	constructor(key:string, init:Tstates__state_group__type__property, public parent:Cstate_group__type__property) {
		super();
		const $this = this;
		this.key = key;
		this.properties = {
			node: new Cstates__state_group__type__property.Dnode(init['node'], $this),
			output_arguments: new Cstates__state_group__type__property.Doutput_arguments(init['output arguments'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/states[${this.key}]`; }
}
export class Koutput_arguments extends Reference<interface_.Coutput_parameters, string> {
	constructor(key:string, $this:Coutput_arguments) {
		super(key, cache(() => resolve($this.parent).then(() => $this.parent).then(context => context?.parent)
			.then(context => context?.properties.output_parameters.get(this.entry))
			.result!, true))
	}
}
export type Toutput_arguments = {
	'path':Tnode_selection_path;
};
export class Coutput_arguments extends AlanNode {
	public key:Koutput_arguments;
	public readonly properties:{
		readonly path:Cnode_selection_path & { readonly inferences: {
			constraint: () => interface_.Cnode;
		} }
	};
	constructor(key:string, init:Toutput_arguments, public parent:Cstates__state_group__type__property) {
		super();
		const $this = this;
		this.key = new Koutput_arguments(key, $this);
		this.properties = {
			path: new Coutput_arguments.Dpath(init['path'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent.parent.parent; }
	public get path() { return `${this.parent.path}/output arguments[${this.key.entry}]`; }
}
export type Ttext__type__property = {
};
export class Ctext__type__property extends AlanNode {
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
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent.parent; }
	public get path() { return `${this.parent.path}/type?text`; }
}
export type Tnode_content_path = {
	'has steps':'no'|['no', {}]|['yes', Tyes__has_steps__node_content_path];
};
export class Cnode_content_path extends AlanNode {
	public readonly properties:{
		readonly has_steps:Cnode_content_path.Dhas_steps<
			{ name: 'no', node:Cno__has_steps__node_content_path, init:Tno__has_steps__node_content_path}|
			{ name: 'yes', node:Cyes__has_steps__node_content_path, init:Tyes__has_steps__node_content_path}>
	};
	public readonly output:{
		result_interface_node: () => interface_.Cnode;
	} = {
		result_interface_node: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.has_steps.state.node.output.result_interface_node())
				.result!
			).result!)
	};
	constructor(init:Tnode_content_path, public location:AlanNode, public input: {
		context_node: () => interface_.Cnode
	}) {
		super();
		const $this = this;
		this.properties = {
			has_steps: new Cnode_content_path.Dhas_steps(init['has steps'], $this)
		};
	}
	public get root() { return this.location.root; }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/node content path`; }
}
export type Tno__has_steps__node_content_path = {
};
export class Cno__has_steps__node_content_path extends AlanNode {
	public readonly output:{
		result_interface_node: () => interface_.Cnode;
	} = {
		result_interface_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.context_node())
				.result!
			).result!, false)
	}
	constructor(init:Tno__has_steps__node_content_path, public parent:Cnode_content_path) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has steps?no`; }
}
export type Tyes__has_steps__node_content_path = {
	'tail':Tnode_content_path;
	'type':['group', Tgroup__type__yes__has_steps__node_content_path]|['state', Tstate__type__yes__has_steps__node_content_path];
};
export class Cyes__has_steps__node_content_path extends AlanNode {
	public readonly properties:{
		readonly tail:Cnode_content_path,
		readonly type:Cyes__has_steps__node_content_path.Dtype<
			{ name: 'group', node:Cgroup__type__yes__has_steps__node_content_path, init:Tgroup__type__yes__has_steps__node_content_path}|
			{ name: 'state', node:Cstate__type__yes__has_steps__node_content_path, init:Tstate__type__yes__has_steps__node_content_path}>
	};
	public readonly output:{
		result_interface_node: () => interface_.Cnode;
	} = {
		result_interface_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.tail)
				.then(context => context?.component_root.output.result_interface_node())
				.result!
			).result!, false)
	}
	constructor(init:Tyes__has_steps__node_content_path, public parent:Cnode_content_path) {
		super();
		const $this = this;
		this.properties = {
			tail: new Cyes__has_steps__node_content_path.Dtail(init['tail'], $this),
			type: new Cyes__has_steps__node_content_path.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has steps?yes`; }
}
export type Tgroup__type__yes__has_steps__node_content_path = {
	'group':string;
};
export class Cgroup__type__yes__has_steps__node_content_path extends AlanNode {
	public readonly properties:{
		readonly group:Cgroup__type__yes__has_steps__node_content_path.Dgroup
	};
	public readonly output:{
		result_interface_node: () => interface_.Cnode;
	} = {
		result_interface_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.group.ref)
				.then(context => context?.properties.node)
				.result!
			).result!, false)
	}
	constructor(init:Tgroup__type__yes__has_steps__node_content_path, public parent:Cyes__has_steps__node_content_path) {
		super();
		const $this = this;
		this.properties = {
			group: new Cgroup__type__yes__has_steps__node_content_path.Dgroup(init['group'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?group`; }
}
export type Tstate__type__yes__has_steps__node_content_path = {
	'state':string;
	'state group':string;
};
export class Cstate__type__yes__has_steps__node_content_path extends AlanNode {
	public readonly properties:{
		readonly state:Cstate__type__yes__has_steps__node_content_path.Dstate,
		readonly state_group:Cstate__type__yes__has_steps__node_content_path.Dstate_group
	};
	public readonly output:{
		result_interface_node: () => interface_.Cnode;
	} = {
		result_interface_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.state.ref)
				.then(context => context?.properties.node)
				.result!
			).result!, false)
	}
	constructor(init:Tstate__type__yes__has_steps__node_content_path, public parent:Cyes__has_steps__node_content_path) {
		super();
		const $this = this;
		this.properties = {
			state: new Cstate__type__yes__has_steps__node_content_path.Dstate(init['state'], $this),
			state_group: new Cstate__type__yes__has_steps__node_content_path.Dstate_group(init['state group'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?state`; }
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
export type Tnode_selection_path = {
	'has steps':'no'|['no', {}]|['yes', Tyes__has_steps__node_selection_path];
};
export class Cnode_selection_path extends AlanNode {
	public readonly properties:{
		readonly has_steps:Cnode_selection_path.Dhas_steps<
			{ name: 'no', node:Cno__has_steps__node_selection_path, init:Tno__has_steps__node_selection_path}|
			{ name: 'yes', node:Cyes__has_steps__node_selection_path, init:Tyes__has_steps__node_selection_path}>
	};
	public readonly output:{
		result_interface_node: () => interface_.Cnode;
	} = {
		result_interface_node: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.has_steps.state.node.output.result_interface_node())
				.result!
			).result!)
	};
	constructor(init:Tnode_selection_path, public location:AlanNode, public input: {
		context_node: () => interface_.Cnode
	}) {
		super();
		const $this = this;
		this.properties = {
			has_steps: new Cnode_selection_path.Dhas_steps(init['has steps'], $this)
		};
	}
	public get root() { return this.location.root; }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/node selection path`; }
}
export type Tno__has_steps__node_selection_path = {
};
export class Cno__has_steps__node_selection_path extends AlanNode {
	public readonly output:{
		result_interface_node: () => interface_.Cnode;
	} = {
		result_interface_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.context_node())
				.result!
			).result!, false)
	}
	constructor(init:Tno__has_steps__node_selection_path, public parent:Cnode_selection_path) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has steps?no`; }
}
export type Tyes__has_steps__node_selection_path = {
	'tail':Tnode_selection_path;
	'type':'collection parent'|['collection parent', {}]|['group', Tgroup__type__yes__has_steps__node_selection_path]|'group parent'|['group parent', {}]|'matrix key'|['matrix key', {}]|['reference', Treference__type__yes]|['state group output parameter', Tstate_group_output_parameter]|'state parent'|['state parent', {}];
};
export class Cyes__has_steps__node_selection_path extends AlanNode {
	public readonly properties:{
		readonly tail:Cnode_selection_path,
		readonly type:Cyes__has_steps__node_selection_path.Dtype<
			{ name: 'collection parent', node:Ccollection_parent, init:Tcollection_parent}|
			{ name: 'group', node:Cgroup__type__yes__has_steps__node_selection_path, init:Tgroup__type__yes__has_steps__node_selection_path}|
			{ name: 'group parent', node:Cgroup_parent, init:Tgroup_parent}|
			{ name: 'matrix key', node:Cmatrix_key, init:Tmatrix_key}|
			{ name: 'reference', node:Creference__type__yes, init:Treference__type__yes}|
			{ name: 'state group output parameter', node:Cstate_group_output_parameter, init:Tstate_group_output_parameter}|
			{ name: 'state parent', node:Cstate_parent__type__yes__has_steps__node_selection_path, init:Tstate_parent__type__yes__has_steps__node_selection_path}>
	};
	public readonly output:{
		result_interface_node: () => interface_.Cnode;
	} = {
		result_interface_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.tail)
				.then(context => context?.component_root.output.result_interface_node())
				.result!
			).result!, false)
	}
	constructor(init:Tyes__has_steps__node_selection_path, public parent:Cnode_selection_path) {
		super();
		const $this = this;
		this.properties = {
			tail: new Cyes__has_steps__node_selection_path.Dtail(init['tail'], $this),
			type: new Cyes__has_steps__node_selection_path.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has steps?yes`; }
}
export type Tcollection_parent = {
};
export class Ccollection_parent extends AlanNode {
	public readonly output:{
		result_interface_node: () => interface_.Cnode;
	} = {
		result_interface_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.inferences.parent_node()).result!
			).result!, false)
	}
	public readonly inferences:{
		parent_node: () => interface_.Cnode
	} = {
		parent_node: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.component_root.input.context_node())
			.then(context => context?.component_root.output.parent())
			.then(context => context?.cast('node'))
			.result!, true)
	}
	constructor(init:Tcollection_parent, public parent:Cyes__has_steps__node_selection_path) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?collection parent`; }
}
export type Tgroup__type__yes__has_steps__node_selection_path = {
	'group':string;
};
export class Cgroup__type__yes__has_steps__node_selection_path extends AlanNode {
	public readonly properties:{
		readonly group:Cgroup__type__yes__has_steps__node_selection_path.Dgroup
	};
	public readonly output:{
		result_interface_node: () => interface_.Cnode;
	} = {
		result_interface_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.group.ref)
				.then(context => context?.properties.node)
				.result!
			).result!, false)
	}
	constructor(init:Tgroup__type__yes__has_steps__node_selection_path, public parent:Cyes__has_steps__node_selection_path) {
		super();
		const $this = this;
		this.properties = {
			group: new Cgroup__type__yes__has_steps__node_selection_path.Dgroup(init['group'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?group`; }
}
export type Tgroup_parent = {
};
export class Cgroup_parent extends AlanNode {
	public readonly output:{
		result_interface_node: () => interface_.Cnode;
	} = {
		result_interface_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.inferences.parent_node()).result!
			).result!, false)
	}
	public readonly inferences:{
		parent_node: () => interface_.Cnode
	} = {
		parent_node: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.component_root.input.context_node())
			.then(context => context?.component_root.output.parent())
			.then(context => context?.cast('node'))
			.result!, true)
	}
	constructor(init:Tgroup_parent, public parent:Cyes__has_steps__node_selection_path) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?group parent`; }
}
export type Tmatrix_key = {
};
export class Cmatrix_key extends AlanNode {
	public readonly output:{
		result_interface_node: () => interface_.Cnode;
	} = {
		result_interface_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.inferences.matrix()).then(context => context?.properties.referencer)
				.then(context => context?.component_root.output.referenced_interface_node())
				.result!
			).result!, false)
	}
	public readonly inferences:{
		collection: () => interface_.Ccollection__type__property,
		matrix: () => interface_.Cmatrix__type__collection
	} = {
		collection: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.component_root.input.context_node())
			.then(context => context?.component_root.output.location())
			.then(context => context?.cast('collection'))
			.result!, true),
		matrix: cache(() => resolve(this.parent).then(() => this.inferences.collection())
			.then(context => context?.properties.type.cast('matrix'))
			.result!, true)
	}
	constructor(init:Tmatrix_key, public parent:Cyes__has_steps__node_selection_path) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?matrix key`; }
}
export type Treference__type__yes = {
	'reference':string;
};
export class Creference__type__yes extends AlanNode {
	public readonly properties:{
		readonly reference:Creference__type__yes.Dreference
	};
	public readonly output:{
		result_interface_node: () => interface_.Cnode;
	} = {
		result_interface_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.reference.ref)
				.then(context => context?.properties.referencer)
				.then(context => context?.component_root.output.referenced_interface_node())
				.result!
			).result!, false)
	}
	constructor(init:Treference__type__yes, public parent:Cyes__has_steps__node_selection_path) {
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
export type Tstate_group_output_parameter = {
	'output parameter':string;
	'state group':string;
};
export class Cstate_group_output_parameter extends AlanNode {
	public readonly properties:{
		readonly output_parameter:Cstate_group_output_parameter.Doutput_parameter,
		readonly state_group:Cstate_group_output_parameter.Dstate_group
	};
	public readonly output:{
		result_interface_node: () => interface_.Cnode;
	} = {
		result_interface_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.output_parameter.ref)
				.then(context => context?.properties.node_selection)
				.then(context => context?.component_root.output.result_interface_node())
				.result!
			).result!, false)
	}
	constructor(init:Tstate_group_output_parameter, public parent:Cyes__has_steps__node_selection_path) {
		super();
		const $this = this;
		this.properties = {
			output_parameter: new Cstate_group_output_parameter.Doutput_parameter(init['output parameter'], $this),
			state_group: new Cstate_group_output_parameter.Dstate_group(init['state group'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?state group output parameter`; }
}
export type Tstate_parent__type__yes__has_steps__node_selection_path = {
};
export class Cstate_parent__type__yes__has_steps__node_selection_path extends AlanNode {
	public readonly output:{
		result_interface_node: () => interface_.Cnode;
	} = {
		result_interface_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.inferences.parent_node()).result!
			).result!, false)
	}
	public readonly inferences:{
		parent_node: () => interface_.Cnode
	} = {
		parent_node: cache(() => resolve(this.parent).then(() => this.parent).then(context => context?.component_root.input.context_node())
			.then(context => context?.component_root.output.parent())
			.then(context => context?.cast('node'))
			.result!, true)
	}
	constructor(init:Tstate_parent__type__yes__has_steps__node_selection_path, public parent:Cyes__has_steps__node_selection_path) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?state parent`; }
}
export type Tnode_type_path = {
	'steps':Tnode_type_path_step;
};
export class Cnode_type_path extends AlanNode {
	public readonly properties:{
		readonly steps:Cnode_type_path_step
	};
	public readonly output:{
		result_interface_node: () => interface_.Cnode;
	} = {
		result_interface_node: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.steps)
				.then(context => context?.component_root.output.result_interface_node())
				.result!
			).result!)
	};
	constructor(init:Tnode_type_path, public location:AlanNode) {
		super();
		const $this = this;
		this.properties = {
			steps: new Cnode_type_path.Dsteps(init['steps'], $this)
		};
	}
	public get root() { return this.location.root; }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/node type path`; }
}
export type Tnode_type_path_step = {
	'has steps':'no'|['no', {}]|['yes', Tyes__has_steps__node_type_path_step];
};
export class Cnode_type_path_step extends AlanNode {
	public readonly properties:{
		readonly has_steps:Cnode_type_path_step.Dhas_steps<
			{ name: 'no', node:Cno__has_steps__node_type_path_step, init:Tno__has_steps__node_type_path_step}|
			{ name: 'yes', node:Cyes__has_steps__node_type_path_step, init:Tyes__has_steps__node_type_path_step}>
	};
	public readonly output:{
		result_interface_node: () => interface_.Cnode;
	} = {
		result_interface_node: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.has_steps.state.node.output.result_interface_node())
				.result!
			).result!)
	};
	constructor(init:Tnode_type_path_step, public location:AlanNode, public input: {
		context_node: () => interface_.Cnode
	}) {
		super();
		const $this = this;
		this.properties = {
			has_steps: new Cnode_type_path_step.Dhas_steps(init['has steps'], $this)
		};
	}
	public get root() { return this.location.root; }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/node type path step`; }
}
export type Tno__has_steps__node_type_path_step = {
};
export class Cno__has_steps__node_type_path_step extends AlanNode {
	public readonly output:{
		result_interface_node: () => interface_.Cnode;
	} = {
		result_interface_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.component_root.input.context_node())
				.result!
			).result!, false)
	}
	constructor(init:Tno__has_steps__node_type_path_step, public parent:Cnode_type_path_step) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has steps?no`; }
}
export type Tyes__has_steps__node_type_path_step = {
	'tail':Tnode_type_path_step;
	'type':['collection', Tcollection__type__yes]|['group', Tgroup__type__yes__has_steps__node_type_path_step]|['state', Tstate__type__yes__has_steps__node_type_path_step];
};
export class Cyes__has_steps__node_type_path_step extends AlanNode {
	public readonly properties:{
		readonly tail:Cnode_type_path_step,
		readonly type:Cyes__has_steps__node_type_path_step.Dtype<
			{ name: 'collection', node:Ccollection__type__yes, init:Tcollection__type__yes}|
			{ name: 'group', node:Cgroup__type__yes__has_steps__node_type_path_step, init:Tgroup__type__yes__has_steps__node_type_path_step}|
			{ name: 'state', node:Cstate__type__yes__has_steps__node_type_path_step, init:Tstate__type__yes__has_steps__node_type_path_step}>
	};
	public readonly output:{
		result_interface_node: () => interface_.Cnode;
	} = {
		result_interface_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.tail)
				.then(context => context?.component_root.output.result_interface_node())
				.result!
			).result!, false)
	}
	constructor(init:Tyes__has_steps__node_type_path_step, public parent:Cnode_type_path_step) {
		super();
		const $this = this;
		this.properties = {
			tail: new Cyes__has_steps__node_type_path_step.Dtail(init['tail'], $this),
			type: new Cyes__has_steps__node_type_path_step.Dtype(init['type'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/has steps?yes`; }
}
export type Tcollection__type__yes = {
	'collection':string;
};
export class Ccollection__type__yes extends AlanNode {
	public readonly properties:{
		readonly collection:Ccollection__type__yes.Dcollection
	};
	public readonly output:{
		result_interface_node: () => interface_.Cnode;
	} = {
		result_interface_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.collection.ref)
				.then(context => context?.properties.node)
				.result!
			).result!, false)
	}
	constructor(init:Tcollection__type__yes, public parent:Cyes__has_steps__node_type_path_step) {
		super();
		const $this = this;
		this.properties = {
			collection: new Ccollection__type__yes.Dcollection(init['collection'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?collection`; }
}
export type Tgroup__type__yes__has_steps__node_type_path_step = {
	'group':string;
};
export class Cgroup__type__yes__has_steps__node_type_path_step extends AlanNode {
	public readonly properties:{
		readonly group:Cgroup__type__yes__has_steps__node_type_path_step.Dgroup
	};
	public readonly output:{
		result_interface_node: () => interface_.Cnode;
	} = {
		result_interface_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.group.ref)
				.then(context => context?.properties.node)
				.result!
			).result!, false)
	}
	constructor(init:Tgroup__type__yes__has_steps__node_type_path_step, public parent:Cyes__has_steps__node_type_path_step) {
		super();
		const $this = this;
		this.properties = {
			group: new Cgroup__type__yes__has_steps__node_type_path_step.Dgroup(init['group'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?group`; }
}
export type Tstate__type__yes__has_steps__node_type_path_step = {
	'state':string;
	'state group':string;
};
export class Cstate__type__yes__has_steps__node_type_path_step extends AlanNode {
	public readonly properties:{
		readonly state:Cstate__type__yes__has_steps__node_type_path_step.Dstate,
		readonly state_group:Cstate__type__yes__has_steps__node_type_path_step.Dstate_group
	};
	public readonly output:{
		result_interface_node: () => interface_.Cnode;
	} = {
		result_interface_node: cache(() => resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.state.ref)
				.then(context => context?.properties.node)
				.result!
			).result!, false)
	}
	constructor(init:Tstate__type__yes__has_steps__node_type_path_step, public parent:Cyes__has_steps__node_type_path_step) {
		super();
		const $this = this;
		this.properties = {
			state: new Cstate__type__yes__has_steps__node_type_path_step.Dstate(init['state'], $this),
			state_group: new Cstate__type__yes__has_steps__node_type_path_step.Dstate_group(init['state group'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/type?state`; }
}
type Vobject = { name: 'node', definition: Cnode}|{ name: 'parameter', definition: Ccommand_parameters}
export class Cobject extends AlanObject {
	constructor(
		public readonly variant:Vobject) { super(); }
	public definitions:{
		value: Cvalue;
	} = {
		value: new Cvalue({name:'object', definition: this})
	}
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
type Vparameter_location = { name: 'command', definition: Ccommand}|{ name: 'matrix', definition: Cmatrix__type__properties}|{ name: 'state', definition: Cstates__state_group__type__properties}
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
type Vparameter_parent = { name: 'none', definition: (typeof Cparameter_parent.Pnone)}|{ name: 'parameter', definition: Ccommand_parameters}
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
export type Treferencer = {
	'collection':string;
	'head':Tnode_selection_path;
	'tail':Tnode_content_path;
};
export class Creferencer extends AlanNode {
	public readonly properties:{
		readonly collection:Creferencer.Dcollection,
		readonly head:Cnode_selection_path,
		readonly tail:Cnode_content_path
	};
	public readonly output:{
		referenced_interface_node: () => interface_.Cnode;
	} = {
		referenced_interface_node: cache(() =>
			resolve(this).then(this_context => resolve(this_context)
				.then(context => context?.properties.tail)
				.then(context => context?.component_root.output.result_interface_node())
				.result!
			).result!)
	};
	constructor(init:Treferencer, public location:AlanNode, public input: {
		context_node: () => interface_.Cnode
	}) {
		super();
		const $this = this;
		this.properties = {
			collection: new Creferencer.Dcollection(init['collection'], $this),
			head: new Creferencer.Dhead(init['head'], $this),
			tail: new Creferencer.Dtail(init['tail'], $this)
		};
	}
	public get root() { return this.location.root; }
	public get component_root() { return this; }
	public get path() { return `${this.location.path}/referencer`; }
}
type Vstate__interface = { name: 'state node', definition: Cstates__state_group__type__property}|{ name: 'state parameter', definition: Cstates__state_group__type__properties}
export class Cstate__interface extends AlanObject {
	constructor(
		public readonly variant:Vstate__interface, public input: {
			value: () => interface_.Cvalue
		}) { super(); }
	public readonly output:{
		value: () => interface_.Cvalue;
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
			super({name: 'file', definition: undefined as unknown as Cvalue})
			this.variant.definition = this;
		}
	}
	public static Pnumber:Cvalue = new class PrimitiveInstance extends Cvalue {
		constructor () {
			super({name: 'number', definition: undefined as unknown as Cvalue})
			this.variant.definition = this;
		}
	}
	public static Ptext:Cvalue = new class PrimitiveInstance extends Cvalue {
		constructor () {
			super({name: 'text', definition: undefined as unknown as Cvalue})
			this.variant.definition = this;
		}
	}
	constructor(
		public readonly variant:Vvalue) { super(); }
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
			value: () => interface_.Cvalue
		}) { super(); }
	public readonly output:{
		value: () => interface_.Cvalue;
	} = {
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

export type Tinterface = {
	'context keys':Record<string, {}>;
	'numerical types':Record<string, Tnumerical_types>;
	'root':Tnode;
};
export class Cinterface extends AlanNode {
	public key?:string;
	public get root() { return this; }
	public definitions:{
		node_location: Cnode_location;
	} = {
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
	'has factor':'no'|['no', {}]|['yes', Tyes__has_factor];
};
export class Cnumerical_types extends AlanNode {
	public key:string;
	public readonly properties:{
		readonly has_factor:Cnumerical_types.Dhas_factor<
			{ name: 'no', node:Cno__has_factor, init:Tno__has_factor}|
			{ name: 'yes', node:Cyes__has_factor, init:Tyes__has_factor}>
	};
	constructor(key:string, init:Tnumerical_types, public parent:Cinterface) {
		super();
		const $this = this;
		this.key = key;
		this.properties = {
			has_factor: new Cnumerical_types.Dhas_factor(init['has factor'], $this)
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent; }
	public get path() { return `${this.parent.path}/numerical types[${this.key}]`; }
}
export type Tno__has_factor = {
};
export class Cno__has_factor extends AlanNode {
	constructor(init:Tno__has_factor, public parent:Cnumerical_types) {
		super();
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/has factor?no`; }
}
export type Tyes__has_factor = {
	'base':number;
	'exponent':number;
};
export class Cyes__has_factor extends AlanNode {
	public readonly properties:{
		readonly base:number,
		readonly exponent:number
	};
	constructor(init:Tyes__has_factor, public parent:Cnumerical_types) {
		super();
		const $this = this;
		this.properties = {
			base: init['base'],
			exponent: init['exponent']
		};
	}
	public get root() { return this.component_root.root; }
	public get component_root() { return this.parent.parent; }
	public get path() { return `${this.parent.path}/has factor?yes`; }
}

/* property classes */export namespace Cancestor_parameters_selection {
	export class Dhas_steps<T extends
		{ name: 'no', node:Cno__has_steps__ancestor_parameters_selection, init:Tno__has_steps__ancestor_parameters_selection}|
		{ name: 'yes', node:Cyes__has_steps__ancestor_parameters_selection, init:Tyes__has_steps__ancestor_parameters_selection}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__has_steps__ancestor_parameters_selection, parent:Cancestor_parameters_selection) => new Cno__has_steps__ancestor_parameters_selection(init, parent);
				case 'yes': return (init:Tyes__has_steps__ancestor_parameters_selection, parent:Cancestor_parameters_selection) => new Cyes__has_steps__ancestor_parameters_selection(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'no': return resolve_no__has_steps__ancestor_parameters_selection;
				case 'yes': return resolve_yes__has_steps__ancestor_parameters_selection;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tancestor_parameters_selection['has steps'], parent:Cancestor_parameters_selection) {
			super(data, parent);
		}
	}
}
export namespace Cyes__has_steps__ancestor_parameters_selection {
	export class Dtail extends Cancestor_parameters_selection {
		constructor(data:Tyes__has_steps__ancestor_parameters_selection['tail'], parent:Cyes__has_steps__ancestor_parameters_selection) {
			super(data, parent, {
				context_parameters: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.inferences.parent_parameter()).result!
					).result!, false)
			})
		}
	}
	export class Dtype<T extends
		{ name: 'matrix parent', node:Cmatrix_parent, init:Tmatrix_parent}|
		{ name: 'state parent', node:Cstate_parent__type__yes__has_steps__ancestor_parameters_selection, init:Tstate_parent__type__yes__has_steps__ancestor_parameters_selection}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'matrix parent': return (init:Tmatrix_parent, parent:Cyes__has_steps__ancestor_parameters_selection) => new Cmatrix_parent(init, parent);
				case 'state parent': return (init:Tstate_parent__type__yes__has_steps__ancestor_parameters_selection, parent:Cyes__has_steps__ancestor_parameters_selection) => new Cstate_parent__type__yes__has_steps__ancestor_parameters_selection(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'matrix parent': return resolve_matrix_parent;
				case 'state parent': return resolve_state_parent__type__yes__has_steps__ancestor_parameters_selection;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tyes__has_steps__ancestor_parameters_selection['type'], parent:Cyes__has_steps__ancestor_parameters_selection) {
			super(data, parent);
		}
	}
}
export namespace Ccommand_parameter_referencer {
	export class Dcollection extends Reference<interface_.Ccollection__type__property,string> {

		constructor(data:string, $this:Ccommand_parameter_referencer) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.properties.head)
				.then(context => context?.component_root.output.result_interface_node())
				.then(context => context?.properties.attributes.get(this.entry))

				.then(context => context?.properties.type.cast('property').properties.type.cast('collection')).result!, true))
		}
	}
	export class Dcontext_type<T extends
		{ name: 'command parameter', node:Ccommand_parameter, init:Tcommand_parameter}|
		{ name: 'context node', node:Ccontext_node, init:Tcontext_node}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'command parameter': return (init:Tcommand_parameter, parent:Ccommand_parameter_referencer) => new Ccommand_parameter(init, parent);
				case 'context node': return (init:Tcontext_node, parent:Ccommand_parameter_referencer) => new Ccontext_node(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'command parameter': return resolve_command_parameter;
				case 'context node': return resolve_context_node;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tcommand_parameter_referencer['context type'], parent:Ccommand_parameter_referencer) {
			super(data, parent);
		}
	}
	export class Dhead extends Cnode_selection_path {
		constructor(data:Tcommand_parameter_referencer['head'], parent:Ccommand_parameter_referencer) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.properties.context_type.state.node.output.result_node())
						.result!
					).result!, false)
			})
		}
	}
	export class Dtail extends Cnode_content_path {
		constructor(data:Tcommand_parameter_referencer['tail'], parent:Ccommand_parameter_referencer) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.properties.collection.ref)
						.then(context => context?.properties.node)
						.result!
					).result!, false)
			})
		}
	}
}
export namespace Ccommand_parameter {
	export class Dancestor_selection extends Cancestor_parameters_selection {
		constructor(data:Tcommand_parameter['ancestor selection'], parent:Ccommand_parameter) {
			super(data, parent, {
				context_parameters: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.parameter())
						.result!
					).result!, false)
			})
		}
	}
	export class Dtype<T extends
		{ name: 'key', node:Ckey, init:Tkey}|
		{ name: 'reference', node:Creference__type__command_parameter, init:Treference__type__command_parameter}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'key': return (init:Tkey, parent:Ccommand_parameter) => new Ckey(init, parent);
				case 'reference': return (init:Treference__type__command_parameter, parent:Ccommand_parameter) => new Creference__type__command_parameter(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'key': return resolve_key;
				case 'reference': return resolve_reference__type__command_parameter;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tcommand_parameter['type'], parent:Ccommand_parameter) {
			super(data, parent);
		}
	}
}
export namespace Creference__type__command_parameter {
	export class Dreference extends Reference<interface_.Creference__type__properties,string> {

		constructor(data:string, $this:Creference__type__command_parameter) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.parent)
				.then(context => context?.properties.ancestor_selection)
				.then(context => context?.component_root.output.result_parameters())
				.then(context => context?.properties.properties.get(this.entry))

				.then(context => context?.properties.type.cast('reference')).result!, true))
		}
	}
}
export namespace Ccommand_parameters {
	export class Dproperties extends AlanDictionary<{ node:Cproperties, init:Tproperties},Ccommand_parameters> {
		protected graph_iterator(graph:string):(node:Cproperties) => Cproperties { throw new Error(`Dictionary has no graph iterators.`); }
		protected initialize(parent:Ccommand_parameters, key:string, entry_init:Tproperties) { return new Cproperties(key, entry_init, parent); }
		protected resolve = resolve_properties
		protected get path() { return `${this.parent.path}/properties`; }
		constructor(data:Tcommand_parameters['properties'], parent:Ccommand_parameters) {
			super(data, parent);
		}
	}
}
export namespace Cproperties {
	export class Dtype<T extends
		{ name: 'file', node:Cfile__type__properties, init:Tfile__type__properties}|
		{ name: 'matrix', node:Cmatrix__type__properties, init:Tmatrix__type__properties}|
		{ name: 'number', node:Cnumber__type__properties, init:Tnumber__type__properties}|
		{ name: 'reference', node:Creference__type__properties, init:Treference__type__properties}|
		{ name: 'state group', node:Cstate_group__type__properties, init:Tstate_group__type__properties}|
		{ name: 'text', node:Ctext__type__properties, init:Ttext__type__properties}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'file': return (init:Tfile__type__properties, parent:Cproperties) => new Cfile__type__properties(init, parent);
				case 'matrix': return (init:Tmatrix__type__properties, parent:Cproperties) => new Cmatrix__type__properties(init, parent);
				case 'number': return (init:Tnumber__type__properties, parent:Cproperties) => new Cnumber__type__properties(init, parent);
				case 'reference': return (init:Treference__type__properties, parent:Cproperties) => new Creference__type__properties(init, parent);
				case 'state group': return (init:Tstate_group__type__properties, parent:Cproperties) => new Cstate_group__type__properties(init, parent);
				case 'text': return (init:Ttext__type__properties, parent:Cproperties) => new Ctext__type__properties(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'file': return resolve_file__type__properties;
				case 'matrix': return resolve_matrix__type__properties;
				case 'number': return resolve_number__type__properties;
				case 'reference': return resolve_reference__type__properties;
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
export namespace Cmatrix__type__properties {
	export class Dparameters extends Ccommand_parameters {
		constructor(data:Tmatrix__type__properties['parameters'], parent:Cmatrix__type__properties) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.context_node())
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
					).result!, false)
			})
		}
	}
	export class Dreferencer extends Ccommand_parameter_referencer {
		constructor(data:Tmatrix__type__properties['referencer'], parent:Cmatrix__type__properties) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.context_node())
						.result!
					).result!, false),
				parameter: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.result!
					).result!, false)
			})
		}
	}
	export class Dtype<T extends
		{ name: 'dense', node:Cdense, init:Tdense}|
		{ name: 'sparse', node:Csparse, init:Tsparse}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'dense': return (init:Tdense, parent:Cmatrix__type__properties) => new Cdense(init, parent);
				case 'sparse': return (init:Tsparse, parent:Cmatrix__type__properties) => new Csparse(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'dense': return resolve_dense;
				case 'sparse': return resolve_sparse;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tmatrix__type__properties['type'], parent:Cmatrix__type__properties) {
			super(data, parent);
		}
	}
}
export namespace Cnumber__type__properties {
	export class Dnumerical_type extends Reference<interface_.Cnumerical_types,string> {

		constructor(data:string, $this:Cnumber__type__properties) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.root)
				.then(context => context?.properties.numerical_types.get(this.entry))
				.result!, true))
		}
	}
	export class Dset<T extends
		{ name: 'integer', node:Cinteger__set__number__type__properties, init:Tinteger__set__number__type__properties}|
		{ name: 'natural', node:Cnatural__set__number__type__properties, init:Tnatural__set__number__type__properties}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'integer': return (init:Tinteger__set__number__type__properties, parent:Cnumber__type__properties) => new Cinteger__set__number__type__properties(init, parent);
				case 'natural': return (init:Tnatural__set__number__type__properties, parent:Cnumber__type__properties) => new Cnatural__set__number__type__properties(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'integer': return resolve_integer__set__number__type__properties;
				case 'natural': return resolve_natural__set__number__type__properties;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tnumber__type__properties['set'], parent:Cnumber__type__properties) {
			super(data, parent);
		}
	}
}
export namespace Creference__type__properties {
	export class Dreferencer extends Ccommand_parameter_referencer {
		constructor(data:Treference__type__properties['referencer'], parent:Creference__type__properties) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.context_node())
						.result!
					).result!, false),
				parameter: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.result!
					).result!, false)
			})
		}
	}
}
export namespace Cstate_group__type__properties {
	export class Dstates extends AlanDictionary<{ node:Cstates__state_group__type__properties, init:Tstates__state_group__type__properties},Cstate_group__type__properties> {
		protected graph_iterator(graph:string):(node:Cstates__state_group__type__properties) => Cstates__state_group__type__properties { throw new Error(`Dictionary has no graph iterators.`); }
		protected initialize(parent:Cstate_group__type__properties, key:string, entry_init:Tstates__state_group__type__properties) { return new Cstates__state_group__type__properties(key, entry_init, parent); }
		protected resolve = resolve_states__state_group__type__properties
		protected get path() { return `${this.parent.path}/states`; }
		constructor(data:Tstate_group__type__properties['states'], parent:Cstate_group__type__properties) {
			super(data, parent);
		}
	}
}
export namespace Cstates__state_group__type__properties {
	export class Dparameters extends Ccommand_parameters {
		constructor(data:Tstates__state_group__type__properties['parameters'], parent:Cstates__state_group__type__properties) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.context_node())
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
	export class Dparameters extends Ccommand_parameters {
		constructor(data:Tcommand['parameters'], parent:Ccommand) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.result!
					).result!, false),
				location: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.definitions.parameter_location)
						.result!
					).result!, false),
				parent: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(() => interface_.Cparameter_parent.Pnone)
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
		{ name: 'reference', node:Creference__type__property, init:Treference__type__property}|
		{ name: 'state group', node:Cstate_group__type__property, init:Tstate_group__type__property}|
		{ name: 'text', node:Ctext__type__property, init:Ttext__type__property}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'collection': return (init:Tcollection__type__property, parent:Cproperty) => new Ccollection__type__property(init, parent);
				case 'file': return (init:Tfile__type__property, parent:Cproperty) => new Cfile__type__property(init, parent);
				case 'group': return (init:Tgroup__type__property, parent:Cproperty) => new Cgroup__type__property(init, parent);
				case 'number': return (init:Tnumber__type__property, parent:Cproperty) => new Cnumber__type__property(init, parent);
				case 'reference': return (init:Treference__type__property, parent:Cproperty) => new Creference__type__property(init, parent);
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
				case 'reference': return resolve_reference__type__property;
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
	export class Dnode extends Cnode {
		constructor(data:Tcollection__type__property['node'], parent:Ccollection__type__property) {
			super(data, parent, {
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
	export class Dtype<T extends
		{ name: 'dictionary', node:Cdictionary, init:Tdictionary}|
		{ name: 'matrix', node:Cmatrix__type__collection, init:Tmatrix__type__collection}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'dictionary': return (init:Tdictionary, parent:Ccollection__type__property) => new Cdictionary(init, parent);
				case 'matrix': return (init:Tmatrix__type__collection, parent:Ccollection__type__property) => new Cmatrix__type__collection(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'dictionary': return resolve_dictionary;
				case 'matrix': return resolve_matrix__type__collection;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tcollection__type__property['type'], parent:Ccollection__type__property) {
			super(data, parent);
		}
	}
}
export namespace Cmatrix__type__collection {
	export class Dreferencer extends Creferencer {
		constructor(data:Tmatrix__type__collection['referencer'], parent:Cmatrix__type__collection) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.parent)
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
	export class Dset<T extends
		{ name: 'integer', node:Cinteger__set__number__type__property, init:Tinteger__set__number__type__property}|
		{ name: 'natural', node:Cnatural__set__number__type__property, init:Tnatural__set__number__type__property}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'integer': return (init:Tinteger__set__number__type__property, parent:Cnumber__type__property) => new Cinteger__set__number__type__property(init, parent);
				case 'natural': return (init:Tnatural__set__number__type__property, parent:Cnumber__type__property) => new Cnatural__set__number__type__property(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'integer': return resolve_integer__set__number__type__property;
				case 'natural': return resolve_natural__set__number__type__property;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tnumber__type__property['set'], parent:Cnumber__type__property) {
			super(data, parent);
		}
	}
	export class Dtype extends Reference<interface_.Cnumerical_types,string> {

		constructor(data:string, $this:Cnumber__type__property) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.root)
				.then(context => context?.properties.numerical_types.get(this.entry))
				.result!, true))
		}
	}
}
export namespace Creference__type__property {
	export class Dreferencer extends Creferencer {
		constructor(data:Treference__type__property['referencer'], parent:Creference__type__property) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.then(context => context?.parent)
						.result!
					).result!, false)
			})
		}
	}
}
export namespace Cstate_group__type__property {
	export class Doutput_parameters extends AlanDictionary<{ node:Coutput_parameters, init:Toutput_parameters},Cstate_group__type__property> {
		protected graph_iterator(graph:string):(node:Coutput_parameters) => Coutput_parameters { throw new Error(`Dictionary has no graph iterators.`); }
		protected initialize(parent:Cstate_group__type__property, key:string, entry_init:Toutput_parameters) { return new Coutput_parameters(key, entry_init, parent); }
		protected resolve = resolve_output_parameters
		protected get path() { return `${this.parent.path}/output parameters`; }
		constructor(data:Tstate_group__type__property['output parameters'], parent:Cstate_group__type__property) {
			super(data, parent);
		}
	}
	export class Dstates extends AlanDictionary<{ node:Cstates__state_group__type__property, init:Tstates__state_group__type__property},Cstate_group__type__property> {
		protected graph_iterator(graph:string):(node:Cstates__state_group__type__property) => Cstates__state_group__type__property { throw new Error(`Dictionary has no graph iterators.`); }
		protected initialize(parent:Cstate_group__type__property, key:string, entry_init:Tstates__state_group__type__property) { return new Cstates__state_group__type__property(key, entry_init, parent); }
		protected resolve = resolve_states__state_group__type__property
		protected get path() { return `${this.parent.path}/states`; }
		constructor(data:Tstate_group__type__property['states'], parent:Cstate_group__type__property) {
			super(data, parent);
		}
	}
}
export namespace Coutput_parameters {
	export class Dnode_selection extends Cnode_type_path {
		constructor(data:Toutput_parameters['node selection'], parent:Coutput_parameters) {
			super(data, parent)
		}
	}
}
export namespace Cstates__state_group__type__property {
	export class Dnode extends Cnode {
		constructor(data:Tstates__state_group__type__property['node'], parent:Cstates__state_group__type__property) {
			super(data, parent, {
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
	export class Doutput_arguments extends AlanDictionary<{ node:Coutput_arguments, init:Toutput_arguments},Cstates__state_group__type__property> {
		protected graph_iterator(graph:string):(node:Coutput_arguments) => Coutput_arguments { throw new Error(`Dictionary has no graph iterators.`); }
		protected initialize(parent:Cstates__state_group__type__property, key:string, entry_init:Toutput_arguments) { return new Coutput_arguments(key, entry_init, parent); }
		protected resolve = resolve_output_arguments
		protected get path() { return `${this.parent.path}/output arguments`; }
		constructor(data:Tstates__state_group__type__property['output arguments'], parent:Cstates__state_group__type__property) {
			super(data, parent);
		}
	}
}
export namespace Coutput_arguments {
	export class Dpath extends Cnode_selection_path {
		public readonly inferences:{
			constraint: () => interface_.Cnode
		}
		constructor(data:Toutput_arguments['path'], parent:Coutput_arguments) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.parent)
						.then(context => context?.properties.node)
						.result!
					).result!, false)
			})
			this.inferences = {
				constraint: cache(() => resolve(parent.properties.path).then(context => {
						const left = resolve(context)
							.then(context => context)
							.then(context => context?.component_root.output.result_interface_node())
						.result;
						const right = resolve(context)
							.then(() => parent).then(context => context?.key.ref)
							.then(context => context?.properties.node_selection)
							.then(context => context?.component_root.output.result_interface_node())
						.result;
						return left.is(right) ? left : undefined
					})
					.result!, true)
			}
		}
	}
}
export namespace Cnode_content_path {
	export class Dhas_steps<T extends
		{ name: 'no', node:Cno__has_steps__node_content_path, init:Tno__has_steps__node_content_path}|
		{ name: 'yes', node:Cyes__has_steps__node_content_path, init:Tyes__has_steps__node_content_path}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__has_steps__node_content_path, parent:Cnode_content_path) => new Cno__has_steps__node_content_path(init, parent);
				case 'yes': return (init:Tyes__has_steps__node_content_path, parent:Cnode_content_path) => new Cyes__has_steps__node_content_path(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'no': return resolve_no__has_steps__node_content_path;
				case 'yes': return resolve_yes__has_steps__node_content_path;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tnode_content_path['has steps'], parent:Cnode_content_path) {
			super(data, parent);
		}
	}
}
export namespace Cyes__has_steps__node_content_path {
	export class Dtail extends Cnode_content_path {
		constructor(data:Tyes__has_steps__node_content_path['tail'], parent:Cyes__has_steps__node_content_path) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.properties.type.state.node.output.result_interface_node())
						.result!
					).result!, false)
			})
		}
	}
	export class Dtype<T extends
		{ name: 'group', node:Cgroup__type__yes__has_steps__node_content_path, init:Tgroup__type__yes__has_steps__node_content_path}|
		{ name: 'state', node:Cstate__type__yes__has_steps__node_content_path, init:Tstate__type__yes__has_steps__node_content_path}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'group': return (init:Tgroup__type__yes__has_steps__node_content_path, parent:Cyes__has_steps__node_content_path) => new Cgroup__type__yes__has_steps__node_content_path(init, parent);
				case 'state': return (init:Tstate__type__yes__has_steps__node_content_path, parent:Cyes__has_steps__node_content_path) => new Cstate__type__yes__has_steps__node_content_path(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'group': return resolve_group__type__yes__has_steps__node_content_path;
				case 'state': return resolve_state__type__yes__has_steps__node_content_path;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tyes__has_steps__node_content_path['type'], parent:Cyes__has_steps__node_content_path) {
			super(data, parent);
		}
	}
}
export namespace Cgroup__type__yes__has_steps__node_content_path {
	export class Dgroup extends Reference<interface_.Cgroup__type__property,string> {

		constructor(data:string, $this:Cgroup__type__yes__has_steps__node_content_path) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.component_root.input.context_node())
				.then(context => context?.properties.attributes.get(this.entry))

				.then(context => context?.properties.type.cast('property').properties.type.cast('group')).result!, true))
		}
	}
}
export namespace Cstate__type__yes__has_steps__node_content_path {
	export class Dstate extends Reference<interface_.Cstates__state_group__type__property,string> {

		constructor(data:string, $this:Cstate__type__yes__has_steps__node_content_path) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.properties.state_group.ref)
				.then(context => context?.properties.states.get(this.entry))
				.result!, true))
		}
	}
	export class Dstate_group extends Reference<interface_.Cstate_group__type__property,string> {

		constructor(data:string, $this:Cstate__type__yes__has_steps__node_content_path) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.component_root.input.context_node())
				.then(context => context?.properties.attributes.get(this.entry))

				.then(context => context?.properties.type.cast('property').properties.type.cast('state group')).result!, true))
		}
	}
}
export namespace Cnode_selection_path {
	export class Dhas_steps<T extends
		{ name: 'no', node:Cno__has_steps__node_selection_path, init:Tno__has_steps__node_selection_path}|
		{ name: 'yes', node:Cyes__has_steps__node_selection_path, init:Tyes__has_steps__node_selection_path}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__has_steps__node_selection_path, parent:Cnode_selection_path) => new Cno__has_steps__node_selection_path(init, parent);
				case 'yes': return (init:Tyes__has_steps__node_selection_path, parent:Cnode_selection_path) => new Cyes__has_steps__node_selection_path(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'no': return resolve_no__has_steps__node_selection_path;
				case 'yes': return resolve_yes__has_steps__node_selection_path;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tnode_selection_path['has steps'], parent:Cnode_selection_path) {
			super(data, parent);
		}
	}
}
export namespace Cyes__has_steps__node_selection_path {
	export class Dtail extends Cnode_selection_path {
		constructor(data:Tyes__has_steps__node_selection_path['tail'], parent:Cyes__has_steps__node_selection_path) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.properties.type.state.node.output.result_interface_node())
						.result!
					).result!, false)
			})
		}
	}
	export class Dtype<T extends
		{ name: 'collection parent', node:Ccollection_parent, init:Tcollection_parent}|
		{ name: 'group', node:Cgroup__type__yes__has_steps__node_selection_path, init:Tgroup__type__yes__has_steps__node_selection_path}|
		{ name: 'group parent', node:Cgroup_parent, init:Tgroup_parent}|
		{ name: 'matrix key', node:Cmatrix_key, init:Tmatrix_key}|
		{ name: 'reference', node:Creference__type__yes, init:Treference__type__yes}|
		{ name: 'state group output parameter', node:Cstate_group_output_parameter, init:Tstate_group_output_parameter}|
		{ name: 'state parent', node:Cstate_parent__type__yes__has_steps__node_selection_path, init:Tstate_parent__type__yes__has_steps__node_selection_path}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'collection parent': return (init:Tcollection_parent, parent:Cyes__has_steps__node_selection_path) => new Ccollection_parent(init, parent);
				case 'group': return (init:Tgroup__type__yes__has_steps__node_selection_path, parent:Cyes__has_steps__node_selection_path) => new Cgroup__type__yes__has_steps__node_selection_path(init, parent);
				case 'group parent': return (init:Tgroup_parent, parent:Cyes__has_steps__node_selection_path) => new Cgroup_parent(init, parent);
				case 'matrix key': return (init:Tmatrix_key, parent:Cyes__has_steps__node_selection_path) => new Cmatrix_key(init, parent);
				case 'reference': return (init:Treference__type__yes, parent:Cyes__has_steps__node_selection_path) => new Creference__type__yes(init, parent);
				case 'state group output parameter': return (init:Tstate_group_output_parameter, parent:Cyes__has_steps__node_selection_path) => new Cstate_group_output_parameter(init, parent);
				case 'state parent': return (init:Tstate_parent__type__yes__has_steps__node_selection_path, parent:Cyes__has_steps__node_selection_path) => new Cstate_parent__type__yes__has_steps__node_selection_path(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'collection parent': return resolve_collection_parent;
				case 'group': return resolve_group__type__yes__has_steps__node_selection_path;
				case 'group parent': return resolve_group_parent;
				case 'matrix key': return resolve_matrix_key;
				case 'reference': return resolve_reference__type__yes;
				case 'state group output parameter': return resolve_state_group_output_parameter;
				case 'state parent': return resolve_state_parent__type__yes__has_steps__node_selection_path;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tyes__has_steps__node_selection_path['type'], parent:Cyes__has_steps__node_selection_path) {
			super(data, parent);
		}
	}
}
export namespace Cgroup__type__yes__has_steps__node_selection_path {
	export class Dgroup extends Reference<interface_.Cgroup__type__property,string> {

		constructor(data:string, $this:Cgroup__type__yes__has_steps__node_selection_path) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.component_root.input.context_node())
				.then(context => context?.properties.attributes.get(this.entry))

				.then(context => context?.properties.type.cast('property').properties.type.cast('group')).result!, true))
		}
	}
}
export namespace Creference__type__yes {
	export class Dreference extends Reference<interface_.Creference__type__property,string> {

		constructor(data:string, $this:Creference__type__yes) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.component_root.input.context_node())
				.then(context => context?.properties.attributes.get(this.entry))

				.then(context => context?.properties.type.cast('property').properties.type.cast('reference')).result!, true))
		}
	}
}
export namespace Cstate_group_output_parameter {
	export class Doutput_parameter extends Reference<interface_.Coutput_parameters,string> {

		constructor(data:string, $this:Cstate_group_output_parameter) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.properties.state_group.ref)
				.then(context => context?.properties.output_parameters.get(this.entry))
				.result!, true))
		}
	}
	export class Dstate_group extends Reference<interface_.Cstate_group__type__property,string> {

		constructor(data:string, $this:Cstate_group_output_parameter) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.component_root.input.context_node())
				.then(context => context?.properties.attributes.get(this.entry))

				.then(context => context?.properties.type.cast('property').properties.type.cast('state group')).result!, true))
		}
	}
}
export namespace Cnode_type_path {
	export class Dsteps extends Cnode_type_path_step {
		constructor(data:Tnode_type_path['steps'], parent:Cnode_type_path) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.root)
						.then(context => context?.properties.root)
						.result!
					).result!, false)
			})
		}
	}
}
export namespace Cnode_type_path_step {
	export class Dhas_steps<T extends
		{ name: 'no', node:Cno__has_steps__node_type_path_step, init:Tno__has_steps__node_type_path_step}|
		{ name: 'yes', node:Cyes__has_steps__node_type_path_step, init:Tyes__has_steps__node_type_path_step}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__has_steps__node_type_path_step, parent:Cnode_type_path_step) => new Cno__has_steps__node_type_path_step(init, parent);
				case 'yes': return (init:Tyes__has_steps__node_type_path_step, parent:Cnode_type_path_step) => new Cyes__has_steps__node_type_path_step(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'no': return resolve_no__has_steps__node_type_path_step;
				case 'yes': return resolve_yes__has_steps__node_type_path_step;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tnode_type_path_step['has steps'], parent:Cnode_type_path_step) {
			super(data, parent);
		}
	}
}
export namespace Cyes__has_steps__node_type_path_step {
	export class Dtail extends Cnode_type_path_step {
		constructor(data:Tyes__has_steps__node_type_path_step['tail'], parent:Cyes__has_steps__node_type_path_step) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.properties.type.state.node.output.result_interface_node())
						.result!
					).result!, false)
			})
		}
	}
	export class Dtype<T extends
		{ name: 'collection', node:Ccollection__type__yes, init:Tcollection__type__yes}|
		{ name: 'group', node:Cgroup__type__yes__has_steps__node_type_path_step, init:Tgroup__type__yes__has_steps__node_type_path_step}|
		{ name: 'state', node:Cstate__type__yes__has_steps__node_type_path_step, init:Tstate__type__yes__has_steps__node_type_path_step}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'collection': return (init:Tcollection__type__yes, parent:Cyes__has_steps__node_type_path_step) => new Ccollection__type__yes(init, parent);
				case 'group': return (init:Tgroup__type__yes__has_steps__node_type_path_step, parent:Cyes__has_steps__node_type_path_step) => new Cgroup__type__yes__has_steps__node_type_path_step(init, parent);
				case 'state': return (init:Tstate__type__yes__has_steps__node_type_path_step, parent:Cyes__has_steps__node_type_path_step) => new Cstate__type__yes__has_steps__node_type_path_step(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'collection': return resolve_collection__type__yes;
				case 'group': return resolve_group__type__yes__has_steps__node_type_path_step;
				case 'state': return resolve_state__type__yes__has_steps__node_type_path_step;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tyes__has_steps__node_type_path_step['type'], parent:Cyes__has_steps__node_type_path_step) {
			super(data, parent);
		}
	}
}
export namespace Ccollection__type__yes {
	export class Dcollection extends Reference<interface_.Ccollection__type__property,string> {

		constructor(data:string, $this:Ccollection__type__yes) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.component_root.input.context_node())
				.then(context => context?.properties.attributes.get(this.entry))

				.then(context => context?.properties.type.cast('property').properties.type.cast('collection')).result!, true))
		}
	}
}
export namespace Cgroup__type__yes__has_steps__node_type_path_step {
	export class Dgroup extends Reference<interface_.Cgroup__type__property,string> {

		constructor(data:string, $this:Cgroup__type__yes__has_steps__node_type_path_step) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.component_root.input.context_node())
				.then(context => context?.properties.attributes.get(this.entry))

				.then(context => context?.properties.type.cast('property').properties.type.cast('group')).result!, true))
		}
	}
}
export namespace Cstate__type__yes__has_steps__node_type_path_step {
	export class Dstate extends Reference<interface_.Cstates__state_group__type__property,string> {

		constructor(data:string, $this:Cstate__type__yes__has_steps__node_type_path_step) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.properties.state_group.ref)
				.then(context => context?.properties.states.get(this.entry))
				.result!, true))
		}
	}
	export class Dstate_group extends Reference<interface_.Cstate_group__type__property,string> {

		constructor(data:string, $this:Cstate__type__yes__has_steps__node_type_path_step) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.component_root.input.context_node())
				.then(context => context?.properties.attributes.get(this.entry))

				.then(context => context?.properties.type.cast('property').properties.type.cast('state group')).result!, true))
		}
	}
}
export namespace Creferencer {
	export class Dcollection extends Reference<interface_.Ccollection__type__property,string> {

		constructor(data:string, $this:Creferencer) {
			super(data, cache(() => resolve($this).then(() => $this).then(context => context?.properties.head)
				.then(context => context?.component_root.output.result_interface_node())
				.then(context => context?.properties.attributes.get(this.entry))

				.then(context => context?.properties.type.cast('property').properties.type.cast('collection')).result!, true))
		}
	}
	export class Dhead extends Cnode_selection_path {
		constructor(data:Treferencer['head'], parent:Creferencer) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.component_root.input.context_node())
						.result!
					).result!, false)
			})
		}
	}
	export class Dtail extends Cnode_content_path {
		constructor(data:Treferencer['tail'], parent:Creferencer) {
			super(data, parent, {
				context_node: cache(() => resolve(parent).then(this_context => resolve(this_context)
						.then(context => context?.properties.collection.ref)
						.then(context => context?.properties.node)
						.result!
					).result!, false)
			})
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
		protected initialize(parent:Cinterface, key:string, entry_init:Tnumerical_types) { return new Cnumerical_types(key, entry_init, parent); }
		protected resolve = resolve_numerical_types
		protected get path() { return `${this.parent.path}/numerical types`; }
		constructor(data:Tinterface['numerical types'], parent:Cinterface) {
			super(data, parent);
		}
	}
	export class Droot extends Cnode {
		constructor(data:Tinterface['root'], parent:Cinterface) {
			super(data, parent, {
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
export namespace Cnumerical_types {
	export class Dhas_factor<T extends
		{ name: 'no', node:Cno__has_factor, init:Tno__has_factor}|
		{ name: 'yes', node:Cyes__has_factor, init:Tyes__has_factor}> extends StateGroup<T> {
		protected initializer(state:T['name']) {
			switch (state) {
				case 'no': return (init:Tno__has_factor, parent:Cnumerical_types) => new Cno__has_factor(init, parent);
				case 'yes': return (init:Tyes__has_factor, parent:Cnumerical_types) => new Cyes__has_factor(init, parent);
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		protected resolver(state:T['name']) {
			switch (state) {
				case 'no': return resolve_no__has_factor;
				case 'yes': return resolve_yes__has_factor;
				default: throw new Error(`Unexpected state ${state}.`);
			}
		}
		constructor(data:Tnumerical_types['has factor'], parent:Cnumerical_types) {
			super(data, parent);
		}
	}
}
export namespace Cyes__has_factor {
}
/* de(resolution) */
function auto_defer<T extends (...args:any) => void>(root:Cinterface, callback:T):T {
	return callback;
}
function resolve_no__has_steps__ancestor_parameters_selection(obj:Cno__has_steps__ancestor_parameters_selection, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_matrix_parent(obj:Cmatrix_parent, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_state_parent__type__yes__has_steps__ancestor_parameters_selection(obj:Cstate_parent__type__yes__has_steps__ancestor_parameters_selection, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_yes__has_steps__ancestor_parameters_selection(obj:Cyes__has_steps__ancestor_parameters_selection, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Ccommand_parameters>obj.inferences.parent_parameter)(detach) !== undefined || detach);
	resolve_ancestor_parameters_selection(obj.properties.tail, detach);
	obj.properties.type.switch({
		'matrix parent': node => resolve_matrix_parent(node, detach),
		'state parent': node => resolve_state_parent__type__yes__has_steps__ancestor_parameters_selection(node, detach)
	});
}
function resolve_ancestor_parameters_selection(obj:Cancestor_parameters_selection, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.has_steps.switch({
		'no': node => resolve_no__has_steps__ancestor_parameters_selection(node, detach),
		'yes': node => resolve_yes__has_steps__ancestor_parameters_selection(node, detach)
	});
}
function resolve_key(obj:Ckey, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cmatrix__type__properties>obj.inferences.matrix)(detach) !== undefined || detach);
}
function resolve_reference__type__command_parameter(obj:Creference__type__command_parameter, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Creference__type__properties>(obj.properties.reference as any).resolve)(detach) !== undefined || detach);
}
function resolve_command_parameter(obj:Ccommand_parameter, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_ancestor_parameters_selection(obj.properties.ancestor_selection, detach);
	obj.properties.type.switch({
		'key': node => resolve_key(node, detach),
		'reference': node => resolve_reference__type__command_parameter(node, detach)
	});
}
function resolve_context_node(obj:Ccontext_node, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_command_parameter_referencer(obj:Ccommand_parameter_referencer, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Ccollection__type__property>(obj.properties.collection as any).resolve)(detach) !== undefined || detach);
	obj.properties.context_type.switch({
		'command parameter': node => resolve_command_parameter(node, detach),
		'context node': node => resolve_context_node(node, detach)
	});
	resolve_node_selection_path(obj.properties.head, detach);
	resolve_node_content_path(obj.properties.tail, detach);
}
function resolve_file__type__properties(obj:Cfile__type__properties, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_dense(obj:Cdense, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_sparse(obj:Csparse, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_matrix__type__properties(obj:Cmatrix__type__properties, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_command_parameters(obj.properties.parameters, detach);
	resolve_command_parameter_referencer(obj.properties.referencer, detach);
	obj.properties.type.switch({
		'dense': node => resolve_dense(node, detach),
		'sparse': node => resolve_sparse(node, detach)
	});
}
function resolve_integer__set__number__type__properties(obj:Cinteger__set__number__type__properties, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_natural__set__number__type__properties(obj:Cnatural__set__number__type__properties, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_number__type__properties(obj:Cnumber__type__properties, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cnumerical_types>(obj.properties.numerical_type as any).resolve)(detach) !== undefined || detach);
	obj.properties.set.switch({
		'integer': node => resolve_integer__set__number__type__properties(node, detach),
		'natural': node => resolve_natural__set__number__type__properties(node, detach)
	});
}
function resolve_reference__type__properties(obj:Creference__type__properties, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_command_parameter_referencer(obj.properties.referencer, detach);
}
function resolve_states__state_group__type__properties(obj:Cstates__state_group__type__properties, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_command_parameters(obj.properties.parameters, detach);
}
function resolve_state_group__type__properties(obj:Cstate_group__type__properties, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.states.forEach(entry => resolve_states__state_group__type__properties(entry, detach));
}
function resolve_text__type__properties(obj:Ctext__type__properties, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_properties(obj:Cproperties, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.type.switch({
		'file': node => resolve_file__type__properties(node, detach),
		'matrix': node => resolve_matrix__type__properties(node, detach),
		'number': node => resolve_number__type__properties(node, detach),
		'reference': node => resolve_reference__type__properties(node, detach),
		'state group': node => resolve_state_group__type__properties(node, detach),
		'text': node => resolve_text__type__properties(node, detach)
	});
}
function resolve_command_parameters(obj:Ccommand_parameters, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.properties.forEach(entry => resolve_properties(entry, detach));
}
function resolve_command(obj:Ccommand, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_command_parameters(obj.properties.parameters, detach);
}
function resolve_dictionary(obj:Cdictionary, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_matrix__type__collection(obj:Cmatrix__type__collection, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_referencer(obj.properties.referencer, detach);
}
function resolve_collection__type__property(obj:Ccollection__type__property, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_node(obj.properties.node, detach);
	obj.properties.type.switch({
		'dictionary': node => resolve_dictionary(node, detach),
		'matrix': node => resolve_matrix__type__collection(node, detach)
	});
}
function resolve_file__type__property(obj:Cfile__type__property, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_group__type__property(obj:Cgroup__type__property, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_node(obj.properties.node, detach);
}
function resolve_integer__set__number__type__property(obj:Cinteger__set__number__type__property, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_natural__set__number__type__property(obj:Cnatural__set__number__type__property, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_number__type__property(obj:Cnumber__type__property, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.set.switch({
		'integer': node => resolve_integer__set__number__type__property(node, detach),
		'natural': node => resolve_natural__set__number__type__property(node, detach)
	});
	assert((<(detach?:boolean) => interface_.Cnumerical_types>(obj.properties.type as any).resolve)(detach) !== undefined || detach);
}
function resolve_reference__type__property(obj:Creference__type__property, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_referencer(obj.properties.referencer, detach);
}
function resolve_output_parameters(obj:Coutput_parameters, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_node_type_path(obj.properties.node_selection, detach);
}
function resolve_output_arguments(obj:Coutput_arguments, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Coutput_parameters>(obj.key as any).resolve)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cnode>obj.properties.path.inferences.constraint)(detach) !== undefined || detach);
	resolve_node_selection_path(obj.properties.path, detach);
}
function resolve_states__state_group__type__property(obj:Cstates__state_group__type__property, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_node(obj.properties.node, detach);
	obj.properties.output_arguments.forEach(entry => resolve_output_arguments(entry, detach));
}
function resolve_state_group__type__property(obj:Cstate_group__type__property, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.output_parameters.forEach(entry => resolve_output_parameters(entry, detach));
	obj.properties.states.forEach(entry => resolve_states__state_group__type__property(entry, detach));
}
function resolve_text__type__property(obj:Ctext__type__property, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_property(obj:Cproperty, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.type.switch({
		'collection': node => resolve_collection__type__property(node, detach),
		'file': node => resolve_file__type__property(node, detach),
		'group': node => resolve_group__type__property(node, detach),
		'number': node => resolve_number__type__property(node, detach),
		'reference': node => resolve_reference__type__property(node, detach),
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
function resolve_no__has_steps__node_content_path(obj:Cno__has_steps__node_content_path, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_group__type__yes__has_steps__node_content_path(obj:Cgroup__type__yes__has_steps__node_content_path, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cgroup__type__property>(obj.properties.group as any).resolve)(detach) !== undefined || detach);
}
function resolve_state__type__yes__has_steps__node_content_path(obj:Cstate__type__yes__has_steps__node_content_path, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cstates__state_group__type__property>(obj.properties.state as any).resolve)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cstate_group__type__property>(obj.properties.state_group as any).resolve)(detach) !== undefined || detach);
}
function resolve_yes__has_steps__node_content_path(obj:Cyes__has_steps__node_content_path, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_node_content_path(obj.properties.tail, detach);
	obj.properties.type.switch({
		'group': node => resolve_group__type__yes__has_steps__node_content_path(node, detach),
		'state': node => resolve_state__type__yes__has_steps__node_content_path(node, detach)
	});
}
function resolve_node_content_path(obj:Cnode_content_path, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.has_steps.switch({
		'no': node => resolve_no__has_steps__node_content_path(node, detach),
		'yes': node => resolve_yes__has_steps__node_content_path(node, detach)
	});
}
function resolve_no__has_steps__node_selection_path(obj:Cno__has_steps__node_selection_path, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_collection_parent(obj:Ccollection_parent, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cnode>obj.inferences.parent_node)(detach) !== undefined || detach);
}
function resolve_group__type__yes__has_steps__node_selection_path(obj:Cgroup__type__yes__has_steps__node_selection_path, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cgroup__type__property>(obj.properties.group as any).resolve)(detach) !== undefined || detach);
}
function resolve_group_parent(obj:Cgroup_parent, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cnode>obj.inferences.parent_node)(detach) !== undefined || detach);
}
function resolve_matrix_key(obj:Cmatrix_key, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Ccollection__type__property>obj.inferences.collection)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cmatrix__type__collection>obj.inferences.matrix)(detach) !== undefined || detach);
}
function resolve_reference__type__yes(obj:Creference__type__yes, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Creference__type__property>(obj.properties.reference as any).resolve)(detach) !== undefined || detach);
}
function resolve_state_group_output_parameter(obj:Cstate_group_output_parameter, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Coutput_parameters>(obj.properties.output_parameter as any).resolve)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cstate_group__type__property>(obj.properties.state_group as any).resolve)(detach) !== undefined || detach);
}
function resolve_state_parent__type__yes__has_steps__node_selection_path(obj:Cstate_parent__type__yes__has_steps__node_selection_path, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cnode>obj.inferences.parent_node)(detach) !== undefined || detach);
}
function resolve_yes__has_steps__node_selection_path(obj:Cyes__has_steps__node_selection_path, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_node_selection_path(obj.properties.tail, detach);
	obj.properties.type.switch({
		'collection parent': node => resolve_collection_parent(node, detach),
		'group': node => resolve_group__type__yes__has_steps__node_selection_path(node, detach),
		'group parent': node => resolve_group_parent(node, detach),
		'matrix key': node => resolve_matrix_key(node, detach),
		'reference': node => resolve_reference__type__yes(node, detach),
		'state group output parameter': node => resolve_state_group_output_parameter(node, detach),
		'state parent': node => resolve_state_parent__type__yes__has_steps__node_selection_path(node, detach)
	});
}
function resolve_node_selection_path(obj:Cnode_selection_path, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.has_steps.switch({
		'no': node => resolve_no__has_steps__node_selection_path(node, detach),
		'yes': node => resolve_yes__has_steps__node_selection_path(node, detach)
	});
}
function resolve_node_type_path(obj:Cnode_type_path, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_node_type_path_step(obj.properties.steps, detach);
}
function resolve_no__has_steps__node_type_path_step(obj:Cno__has_steps__node_type_path_step, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_collection__type__yes(obj:Ccollection__type__yes, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Ccollection__type__property>(obj.properties.collection as any).resolve)(detach) !== undefined || detach);
}
function resolve_group__type__yes__has_steps__node_type_path_step(obj:Cgroup__type__yes__has_steps__node_type_path_step, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cgroup__type__property>(obj.properties.group as any).resolve)(detach) !== undefined || detach);
}
function resolve_state__type__yes__has_steps__node_type_path_step(obj:Cstate__type__yes__has_steps__node_type_path_step, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Cstates__state_group__type__property>(obj.properties.state as any).resolve)(detach) !== undefined || detach);
	assert((<(detach?:boolean) => interface_.Cstate_group__type__property>(obj.properties.state_group as any).resolve)(detach) !== undefined || detach);
}
function resolve_yes__has_steps__node_type_path_step(obj:Cyes__has_steps__node_type_path_step, detach:boolean = false) {
	if (obj.destroyed) { return; };
	resolve_node_type_path_step(obj.properties.tail, detach);
	obj.properties.type.switch({
		'collection': node => resolve_collection__type__yes(node, detach),
		'group': node => resolve_group__type__yes__has_steps__node_type_path_step(node, detach),
		'state': node => resolve_state__type__yes__has_steps__node_type_path_step(node, detach)
	});
}
function resolve_node_type_path_step(obj:Cnode_type_path_step, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.has_steps.switch({
		'no': node => resolve_no__has_steps__node_type_path_step(node, detach),
		'yes': node => resolve_yes__has_steps__node_type_path_step(node, detach)
	});
}
function resolve_referencer(obj:Creferencer, detach:boolean = false) {
	if (obj.destroyed) { return; };
	assert((<(detach?:boolean) => interface_.Ccollection__type__property>(obj.properties.collection as any).resolve)(detach) !== undefined || detach);
	resolve_node_selection_path(obj.properties.head, detach);
	resolve_node_content_path(obj.properties.tail, detach);
}
function resolve_context_keys(obj:Ccontext_keys, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_no__has_factor(obj:Cno__has_factor, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_yes__has_factor(obj:Cyes__has_factor, detach:boolean = false) {
	if (obj.destroyed) { return; };
}
function resolve_numerical_types(obj:Cnumerical_types, detach:boolean = false) {
	if (obj.destroyed) { return; };
	obj.properties.has_factor.switch({
		'no': node => resolve_no__has_factor(node, detach),
		'yes': node => resolve_yes__has_factor(node, detach)
	});
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
