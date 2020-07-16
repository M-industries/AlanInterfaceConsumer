import * as read_api from "./alan_api";
export var serialize = (
	function ($:read_api.Capplication_protocol_shake) { 
		let $_application_protocol_shake= $;
		var raw_data:{[key:string]:any} = {};
		switch ($_application_protocol_shake.properties.result.state.name) {
			case 'failure':
				raw_data["result"] = [$_application_protocol_shake.properties.result.state.name, (
					function ($:read_api.Cfailure) { 
						let $_failure= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_application_protocol_shake.properties.result.state.node))];
				break;
			case 'success':
				raw_data["result"] = [$_application_protocol_shake.properties.result.state.name, (
					function ($:read_api.Csuccess) { 
						let $_success= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_application_protocol_shake.properties.result.state.node))];
				break;
			default:
				throw new Error('Hmmm');
		}
		return raw_data;
	}
);