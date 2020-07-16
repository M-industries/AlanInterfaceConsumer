import * as read_api from "./alan_api";
export var serialize = (
	function ($:read_api.Capplication_protocol_hand) { 
		let $_application_protocol_hand= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["interface version"] = $_application_protocol_hand.properties.interface_version;
		return raw_data;
	}
);