import * as read_api from "./alan_api";
let serialize_context_keys = (
	function ($:read_api.Ccontext_keys__interface_subscription) { 
		let $_context_keys__interface_subscription= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["context keys"] = (function ($) {
			var object:{[key:string]:any} = {};
			for (let [k,v] of $_context_keys__interface_subscription.properties.context_keys) {
				object[k] = (
					function ($:read_api.Ccontext_keys__context_keys) { 
						let $_context_keys__context_keys= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["value"] = $_context_keys__context_keys.properties.value;
						return raw_data;
					}
				(v));
			}
			return object;
		}($));
		return raw_data;
	}
);
export var serialize = (
	function ($:read_api.Cinterface_subscription) { 
		let $_interface_subscription= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["context keys"] = serialize_context_keys($_interface_subscription.properties.context_keys);
		switch ($_interface_subscription.properties.send_initialization_data.state.name) {
			case 'no':
				raw_data["send initialization data"] = [$_interface_subscription.properties.send_initialization_data.state.name, (
					function ($:read_api.Cno) { 
						let $_no= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_interface_subscription.properties.send_initialization_data.state.node))];
				break;
			case 'yes':
				raw_data["send initialization data"] = [$_interface_subscription.properties.send_initialization_data.state.name, (
					function ($:read_api.Cyes) { 
						let $_yes= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_interface_subscription.properties.send_initialization_data.state.node))];
				break;
			default:
				throw new Error('Hmmm');
		}
		return raw_data;
	}
);