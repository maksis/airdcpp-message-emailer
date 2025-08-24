const fs = require('fs');
const path = require('path');

const RemoteExtension = require('airdcpp-extension').RemoteExtension;

const extensionConfig = {
	packageInfo: JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8')),
	dataPath: __dirname,
	nameSuffix: '-dev',
};

// See https://github.com/airdcpp-web/airdcpp-extension-js for usage information

const targetModulePath = path.resolve(__dirname, process.argv[2] || '../dist/main.cjs');

function waitForModule(modulePath, { retries = 50, delayMs = 100 } = {}) {
	return new Promise((resolve, reject) => {
		let attempts = 0;
		const tryLoad = () => {
			try {
				const mod = require(modulePath);
				return resolve(mod);
			} catch (e) {
				// Ignore the initial transient error when the dev bundle isn't ready yet
				if (attempts < retries) {
					attempts += 1;
					setTimeout(tryLoad, delayMs);
					return;
				}
				return reject(e);
			}
		};
		tryLoad();
	});
}

waitForModule(targetModulePath)
	.then((bundle) => {
		RemoteExtension(
			bundle,
			require('./settings.cjs'),
			extensionConfig,
		);
	})
	.catch((err) => {
		console.error(err);
		process.exit(1);
	});
