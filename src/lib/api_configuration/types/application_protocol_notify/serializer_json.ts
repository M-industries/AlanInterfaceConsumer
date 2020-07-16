import * as read_api from "./alan_api";
export var serialize = (
	function ($:read_api.Capplication_protocol_notify) { 
		let $_application_protocol_notify= $;
		var raw_data:{[key:string]:any} = {};
		switch ($_application_protocol_notify.properties.result.state.name) {
			case 'notification':
				raw_data["result"] = [$_application_protocol_notify.properties.result.state.name, (
					function ($:read_api.Cnotification) { 
						let $_notification= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["id"] = $_notification.properties.id;
						raw_data["notification"] = $_notification.properties.notification;
						return raw_data;
					}
				(<any>$_application_protocol_notify.properties.result.state.node))];
				break;
			case 'unsubscribe':
				raw_data["result"] = [$_application_protocol_notify.properties.result.state.name, (
					function ($:read_api.Cunsubscribe) { 
						let $_unsubscribe= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["id"] = $_unsubscribe.properties.id;
						return raw_data;
					}
				(<any>$_application_protocol_notify.properties.result.state.node))];
				break;
			default:
				throw new Error('Hmmm');
		}
		return raw_data;
	}
);