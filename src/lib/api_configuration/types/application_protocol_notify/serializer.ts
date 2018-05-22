import * as read_api from "./read_api";
export var serialize = (
	function ($:read_api.Capplication_protocol_notify) { 
		if (!($ instanceof read_api.Capplication_protocol_notify)) { throw new Error("HMMM"); }
		let $_application_protocol_notify= $;
		var raw_data = {};
		raw_data["notification"] = $_application_protocol_notify.properties.notification;
		return raw_data;
	}
);