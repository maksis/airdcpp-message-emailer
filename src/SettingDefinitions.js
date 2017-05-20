export const DEFAULT_TO = 'disabled@example.com';

export const SettingDefinitions = [
	{
		key: 'send_private_logs',
		title: 'Email private message logs',
		default_value: true,
		type: 'boolean',
		help: 'Extension must be restarted for the changes to take effect'
	}, {
		key: 'send_hub_logs',
		title: 'Email hub message logs',
		default_value: false,
		type: 'boolean',
		help: 'Extension must be restarted for the changes to take effect'
	}, {
		key: 'flush_interval',
		title: 'Message summary send interval (minutes)',
		default_value: 15,
		type: 'number'
	}, {
		key: 'from',
		title: 'Sender',
		default_value: '"AirDC++" <example@example.com>',
		type: 'string'
	}, {
		key: 'to',
		title: 'Recipient(s)',
		default_value: DEFAULT_TO,
		type: 'string',
		help: 'You may add multiple addresses separated with commas'
	}, {
		key: 'smtp_host',
		title: 'SMTP server address',
		default_value: 'localhost',
		type: 'string'
	}, {
		key: 'smtp_port',
		title: 'SMTP server port',
		default_value: 25,
		type: 'number',
		help: "If you are running the application on home connection, it's often easiest to use the SMTP server of your internet provider"
	}, {
		key: 'smtp_secure',
		title: 'Enable SMTP SSL encryption',
		default_value: false,
		type: 'boolean'
	}, {
		key: 'smtp_user',
		title: 'SMTP user',
		optional: true,
		type: 'string'
	}, {
		key: 'smtp_password',
		title: 'SMTP password',
		optional: true,
		type: 'string'
	}
];