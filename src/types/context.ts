import { Logger } from 'airdcpp-apisocket';
import { APIType } from '../api';
import { ExtensionEntryData } from 'airdcpp-extension';


export type SettingGetter = (key: string) => any;

export interface Context {
  api: APIType;
  logger: Logger;
  extension: Pick<ExtensionEntryData, 'name'>;
  getExtSetting: SettingGetter;
}
