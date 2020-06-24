import * as read_api from "./alan_api";
export var serialize = (
	function ($:read_api.Capplication_protocol_invoke) { 
		let $_application_protocol_invoke= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["command"] = $_application_protocol_invoke.properties.command;
		return raw_data;
	}
);