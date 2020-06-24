import * as read_api from "./alan_api";
export var serialize = (
	function ($:read_api.Capplication_protocol_notify) { 
		let $_application_protocol_notify= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["notification"] = $_application_protocol_notify.properties.notification;
		return raw_data;
	}
);