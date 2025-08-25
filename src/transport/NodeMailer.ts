import nodemailer from 'nodemailer';

import { Context, SeverityEnum } from '../types';
import { hasConfig } from '../utils';

export const NodeMailer = (context: Context) => {
  const { api, logger, getExtSetting, extension } = context;

  let hostname: string;
  let transporter: nodemailer.Transporter | undefined;

  const constructSmtpSettings = () => {
    const ret = {
      host: getExtSetting('smtp_host'),
      port: getExtSetting('smtp_port'),
      secure: getExtSetting('smtp_secure'),
    };

    const user = getExtSetting('smtp_user');
    const pass = getExtSetting('smtp_password');
    if (user && pass) {
      ret['auth'] = {
        user,
        pass,
      };
    }

    return ret;
  };

  const constructMail = (text: string) => {
    const mailOptions: nodemailer.SendMailOptions = {
      from: getExtSetting('from'),
      to: getExtSetting('to'),
      subject: `Chat summary from AirDC++ (${hostname})`,
      text,
    };

    return mailOptions;
  };

  const createTransporter = () => {
    const smtpSettings = constructSmtpSettings();
    return nodemailer.createTransport(smtpSettings);
  };

  const sendMail = (messageSummary: string) => {
    transporter!.sendMail(constructMail(messageSummary), (error: any, info: any) => {
      if (error) {
        logger.error(`Failed to send email: ${error}`);
        api.postEvent(`${extension.name}: failed to email message summary (see the extension error log for more information)`, SeverityEnum.ERROR);
      } else {
        logger.info(`Message ${info.messageId} sent: ${info.response}`);
      }
    });
  }

  
  const reset = (newHostName: string) => {
    hostname = newHostName;

    logger.verbose('Creating mailer interface');
    try {
      transporter = nodemailer.createTransport(constructSmtpSettings());
    } catch (e) {
      logger.error(`Failed to initialize mailer interface: ${e}`);
      process.exit(1);
    }

    if (hasConfig(getExtSetting)) {
      transporter.verify((error: any, _success: boolean) => {
        logger.verbose('Verifying settings');
        if (error) {
          api.postEvent(`${extension.name}: SMTP setting validation failed (${error})`, SeverityEnum.ERROR);
        } else {
          logger.verbose('Setting validation succeeded');
        }
      });
    }
  }

  return {
    createTransporter,
    sendMail,
    reset,
  };
};

export type Transporter = ReturnType<typeof NodeMailer>;
