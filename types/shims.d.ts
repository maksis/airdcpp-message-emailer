declare const EXTENSION_NAME: string;
declare const EXTENSION_VERSION: string;
declare const EXTENSION_BUILD_TIME: string | number;

declare module 'airdcpp-extension' {
  export const ManagedExtension: any;
}

declare module 'airdcpp-extension-settings' {
  const SettingsManager: any;
  export = SettingsManager;
}
