import * as read_api from "./alan_api";
export var serialize = (
	function ($:read_api.Capplication_protocol_request) { 
		let $_application_protocol_request= $;
		var raw_data:{[key:string]:any} = {};
		switch ($_application_protocol_request.properties.type.state.name) {
			case 'invoke':
				raw_data["type"] = [$_application_protocol_request.properties.type.state.name, (
					function ($:read_api.Cinvoke) { 
						let $_invoke= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["command"] = $_invoke.properties.command;
						return raw_data;
					}
				(<any>$_application_protocol_request.properties.type.state.node))];
				break;
			case 'subscribe':
				raw_data["type"] = [$_application_protocol_request.properties.type.state.name, (
					function ($:read_api.Csubscribe) { 
						let $_subscribe= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["id"] = $_subscribe.properties.id;
						raw_data["subscription"] = $_subscribe.properties.subscription;
						return raw_data;
					}
				(<any>$_application_protocol_request.properties.type.state.node))];
				break;
			case 'unsubscribe':
				raw_data["type"] = [$_application_protocol_request.properties.type.state.name, (
					function ($:read_api.Cunsubscribe) { 
						let $_unsubscribe= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["id"] = $_unsubscribe.properties.id;
						return raw_data;
					}
				(<any>$_application_protocol_request.properties.type.state.node))];
				break;
			default:
				throw new Error('Hmmm');
		}
		return raw_data;
	}
);