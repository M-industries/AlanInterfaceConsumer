import * as read_api from "./read_api";
export var serialize = (
	function ($:read_api.Capplication_protocol_invoke) { 
		if (!($ instanceof read_api.Capplication_protocol_invoke)) { throw new Error("HMMM"); }
		let $_application_protocol_invoke= $;
		var raw_data = {};
		raw_data["command"] = $_application_protocol_invoke.properties.command;
		return raw_data;
	}
);