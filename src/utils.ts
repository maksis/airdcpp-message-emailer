import { DEFAULT_TO } from "./settings/SettingDefinitions";
import { SettingGetter } from "./types";

export const hasConfig = (getExtSetting: SettingGetter) => getExtSetting('to') !== DEFAULT_TO;