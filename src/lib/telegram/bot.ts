type TelegramInlineKeyboardButton = {
  text: string;
  url?: string;
  web_app?: {
    url: string;
  };
};

type TelegramReplyMarkup = {
  inline_keyboard: TelegramInlineKeyboardButton[][];
};

function getBotToken() {
  return process.env.TELEGRAM_BOT_TOKEN ?? "";
}

export function getTelegramMiniAppUrl() {
  return (
    process.env.TELEGRAM_MINI_APP_URL ??
    `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://fixly.work"}/telegram/leads`
  );
}

export async function callTelegramBotApi<T>(
  method: string,
  payload: Record<string, unknown>
) {
  const token = getBotToken();

  if (!token) {
    return {
      ok: false as const,
      error: "telegram_bot_token_missing",
    };
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as
    | { ok: true; result: T }
    | { ok: false; description?: string };

  if (!response.ok || !data.ok) {
    return {
      ok: false as const,
      error: data.ok ? response.statusText : data.description ?? "telegram_api_error",
    };
  }

  return {
    ok: true as const,
    result: data.result,
  };
}

export function sendTelegramMessage(args: {
  chatId: string | number;
  text: string;
  replyMarkup?: TelegramReplyMarkup;
}) {
  return callTelegramBotApi("sendMessage", {
    chat_id: args.chatId,
    text: args.text,
    parse_mode: "HTML",
    disable_web_page_preview: true,
    ...(args.replyMarkup ? { reply_markup: args.replyMarkup } : {}),
  });
}

export async function sendTelegramLeadNotification(args: {
  publicSlug: string;
  categoryLabel: string;
  subcategoryLabel?: string | null;
  city: string;
  state: string;
  countryCode: string;
  description: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
}) {
  const chatId = process.env.TELEGRAM_LEADS_CHAT_ID;

  if (!chatId) {
    return {
      ok: false as const,
      error: "telegram_leads_chat_id_missing",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fixly.work";
  const serviceLabel = args.subcategoryLabel ?? args.categoryLabel;
  const text = [
    "<b>New Fixly request</b>",
    `${escapeHtml(serviceLabel)} in ${escapeHtml(args.city)}, ${escapeHtml(args.state)}`,
    `Category: ${escapeHtml(args.categoryLabel)}`,
    `Location: ${escapeHtml(args.city)}, ${escapeHtml(args.state)} (${escapeHtml(
      args.countryCode.toUpperCase()
    )})`,
    args.contactName ? `Name: ${escapeHtml(args.contactName)}` : null,
    args.phone ? `Phone: ${escapeHtml(args.phone)}` : null,
    args.email ? `Email: ${escapeHtml(args.email)}` : null,
    "",
    escapeHtml(trimText(args.description, 320)),
    "",
    `${siteUrl}/requests/${args.publicSlug}`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  return sendTelegramMessage({
    chatId,
    text,
    replyMarkup: {
      inline_keyboard: [
        [
          {
            text: "Open mini app",
            web_app: {
              url: getTelegramMiniAppUrl(),
            },
          },
        ],
        [
          {
            text: "Open request",
            url: `${siteUrl}/requests/${args.publicSlug}`,
          },
        ],
      ],
    },
  });
}

function trimText(value: string, maxLength: number) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength).trim()}...`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
