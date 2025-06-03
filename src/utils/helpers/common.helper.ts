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

export function generateOrderCode(
  userId: number,
  createdAt: Date,
  code: string,
): string {
  const timestamp = createdAt
    .toISOString()
    .replace(/[-:TZ.]/g, '')
    .slice(0, 14);

  return `FS${timestamp}${userId.toString()}${code}`;
}

export function generateRandomCode(length: number = 6): string {
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

export function decodeOrderCode(orderCode: string) {
  // Lấy phần bắt đầu bằng 'FS' (nếu có thêm phần khác sau dấu cách thì bỏ)
  const match = orderCode.match(/FS\w+/);
  if (!match) {
    throw new Error('Invalid order code format');
  }

  const cleanCode = match[0];

  // Kiểm tra mã có đúng định dạng hay không
  if (!cleanCode.startsWith('FS')) {
    throw new Error('Invalid order code format');
  }

  // Lấy timestamp từ chuỗi (14 ký tự sau 'FS')
  const timestamp = cleanCode.slice(2, 16);

  // Lấy phần còn lại, tách userId và code
  const remainingCode = cleanCode.slice(16);

  // Giả sử code luôn có 6 ký tự cuối
  const userIdLength = remainingCode.length - 6;
  const userId = parseInt(remainingCode.slice(0, userIdLength), 10);
  const code = remainingCode.slice(userIdLength);

  return {
    createdAt: parseTimestampISO(timestamp).toISOString(),
    userId,
    code,
  };
}

export function parseTimestampISO(ts: string): Date {
  if (!/^\d{14}$/.test(ts)) {
    throw new Error(`Invalid timestamp format: ${ts}`);
  }
  // Turn "YYYYMMDDhhmmss" → "YYYY-MM-DDThh:mm:ssZ"
  const iso = ts.replace(
    /^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/,
    '$1-$2-$3T$4:$5:$6Z',
  );

  return new Date(iso);
}
