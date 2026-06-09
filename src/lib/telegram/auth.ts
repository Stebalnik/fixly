import crypto from "crypto";

export type TelegramMiniAppUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
};

const INIT_DATA_MAX_AGE_SECONDS = 24 * 60 * 60;

function getBotToken() {
  return process.env.TELEGRAM_BOT_TOKEN ?? "";
}

function getAllowedUserIds() {
  return new Set(
    (process.env.TELEGRAM_ALLOWED_USER_IDS ?? "")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
  );
}

function timingSafeEqualHex(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");

  return (
    leftBuffer.length === rightBuffer.length &&
    crypto.timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function buildDataCheckString(params: URLSearchParams, excludeSignature: boolean) {
  return Array.from(params.entries())
    .filter(([key]) => key !== "hash" && (!excludeSignature || key !== "signature"))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");
}

function getExpectedHash(dataCheckString: string) {
  const secretKey = crypto
    .createHmac("sha256", "WebAppData")
    .update(getBotToken())
    .digest();

  return crypto
    .createHmac("sha256", secretKey)
    .update(dataCheckString)
    .digest("hex");
}

export function validateTelegramMiniAppInitData(initData: string) {
  const botToken = getBotToken();

  if (!botToken) {
    return {
      ok: false as const,
      reason: "telegram_bot_token_missing",
    };
  }

  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  const authDate = Number(params.get("auth_date"));
  const userJson = params.get("user");

  if (!hash || !Number.isFinite(authDate) || !userJson) {
    return {
      ok: false as const,
      reason: "telegram_init_data_incomplete",
    };
  }

  const ageSeconds = Math.floor(Date.now() / 1000) - authDate;

  if (ageSeconds > INIT_DATA_MAX_AGE_SECONDS) {
    return {
      ok: false as const,
      reason: "telegram_init_data_expired",
    };
  }

  const expectedHashes = [
    getExpectedHash(buildDataCheckString(params, false)),
    getExpectedHash(buildDataCheckString(params, true)),
  ];

  if (!expectedHashes.some((expected) => timingSafeEqualHex(expected, hash))) {
    return {
      ok: false as const,
      reason: "telegram_init_data_invalid_hash",
    };
  }

  const user = JSON.parse(userJson) as TelegramMiniAppUser;

  if (!user.id) {
    return {
      ok: false as const,
      reason: "telegram_user_missing",
    };
  }

  return {
    ok: true as const,
    user,
  };
}

export function isAllowedTelegramUser(userId: number) {
  return getAllowedUserIds().has(String(userId));
}

export function assertTelegramMiniAppOwner(initData: string) {
  const validated = validateTelegramMiniAppInitData(initData);

  if (!validated.ok) {
    return validated;
  }

  if (!isAllowedTelegramUser(validated.user.id)) {
    return {
      ok: false as const,
      reason: "telegram_user_not_allowed",
      user: validated.user,
    };
  }

  return validated;
}
