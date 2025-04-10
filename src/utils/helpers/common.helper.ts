import dayjs from 'dayjs';
import { config } from '../../config/app.config';
import { VerifyCodeEnum } from '../enum';
import { REGEX } from '../constants';

const { nodeEnv = '' } = config;

export const isProdEnv = (env = nodeEnv) => 'production' === env;

export const isDeployEnv = (env = nodeEnv) => {
  const deployEnvironments = ['development', 'staging', 'production'];
  return deployEnvironments.includes(env);
};

export const replaceQuerySearch = (search: string) => {
  return search.replace(REGEX.ESCAPE_SPECIAL_CHARS, '\\$&');
};

export const generateVerifyAccountInfo = (type: VerifyCodeEnum) => {
  const verifyAccount = {
    valid: true,
    code: Math.floor(100000 + Math.random() * 900000).toString(),
    codeExpires: dayjs().add(15, 'minutes').toDate(),
    type: type,
  };

  return verifyAccount;
};

export function splitFullName(fullName: string): {
  firstName: string;
  lastName: string;
} {
  const parts = fullName.trim().split(/\s+/); // tách theo khoảng trắng
  const lastName = parts[0]; // Họ
  const firstName = parts.slice(1).join(' '); // Tên + tên đệm

  return { firstName, lastName };
}

export function joinFullName(lastName: string, firstName: string): string {
  return `${lastName} ${firstName}`.trim();
}
