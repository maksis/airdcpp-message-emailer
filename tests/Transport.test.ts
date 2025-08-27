import { describe, test, expect, vi } from 'vitest';

import { Mailer, NodeMailer } from '../src/transport/NodeMailer';
import { createMockContext } from './mocks/mock-context';


describe('Transport', () => {

  test('should send email', async () => {
    const transport: Mailer = {
      sendMail: vi.fn(),
      verify: vi.fn(),
    };

    const createTransport = vi.fn(() => transport);

    const context = createMockContext();
    const { sendMail, reset } = NodeMailer(context, createTransport);

    reset('mock hostname');

    expect(transport.verify).toHaveBeenCalled();

    sendMail('Test message summary');
    expect(transport.sendMail).toMatchSnapshot();
  });
});
