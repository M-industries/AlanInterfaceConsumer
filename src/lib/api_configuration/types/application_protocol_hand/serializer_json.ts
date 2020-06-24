import * as read_api from "./alan_api";
export var serialize = (
	function ($:read_api.Capplication_protocol_hand) { 
		let $_application_protocol_hand= $;
		var raw_data:{[key:string]:any} = {};
		raw_data["interface version"] = $_application_protocol_hand.properties.interface_version;
		switch ($_application_protocol_hand.properties.subscribe.state.name) {
			case 'no':
				raw_data["subscribe"] = [$_application_protocol_hand.properties.subscribe.state.name, (
					function ($:read_api.Cno) { 
						let $_no= $;
						var raw_data:{[key:string]:any} = {};
						return raw_data;
					}
				(<any>$_application_protocol_hand.properties.subscribe.state.node))];
				break;
			case 'yes':
				raw_data["subscribe"] = [$_application_protocol_hand.properties.subscribe.state.name, (
					function ($:read_api.Cyes) { 
						let $_yes= $;
						var raw_data:{[key:string]:any} = {};
						raw_data["subscription"] = $_yes.properties.subscription;
						return raw_data;
					}
				(<any>$_application_protocol_hand.properties.subscribe.state.node))];
				break;
			default:
				throw new Error('Hmmm');
		}
		return raw_data;
	}
);