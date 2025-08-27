import { vi } from "vitest";
import { Context } from "../../src/types";
import { HubMessageCollectorMode, PrivateChatCollectorMode } from "../../src/settings";

const DefaultSettings = {
  // Transport
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  user: 'user',
  pass: 'password',
  from: '"AirDC++" <example@example.com>',
  to: 'to@example.com',

  // Collector
  flush_interval: 100,
  hub_message_mode: HubMessageCollectorMode.ALL,
  private_chat_message_mode: PrivateChatCollectorMode.ALL,
};

const MockSettingManager = (settingOverrides: Partial<typeof DefaultSettings> = {}) => {
  const settings = {
    ...DefaultSettings,
    ...settingOverrides,
  };
  return (key: string) => settings[key as keyof typeof settings];
};

interface MockContextOptions {
  apiOverrides?: Partial<Context['api']>;
  settingOverrides?: Partial<typeof DefaultSettings>;
}

export const createMockContext = ({ apiOverrides, settingOverrides }: MockContextOptions = {}) => {
  const context: Context = {
    api: {
      postEvent: vi.fn(),
      getPrivateChatSession: vi.fn(),
      getHubSession: vi.fn(),
      ...apiOverrides,
    },
    logger: {
      error: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      verbose: vi.fn(),
    },
    getExtSetting: MockSettingManager(settingOverrides),
    extension: {
      name: 'test-extension',
    },
  };
  return context;
};
