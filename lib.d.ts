import TelegramBot from "node-telegram-bot-api";

type Functions<T> = {
    [K in keyof T]: T[K] extends Function ? T[K] : never
};

declare class TelegramBotQueue {
    constructor(bot: TelegramBot, limit: number);
    push<Method extends keyof Functions<TelegramBot>>(
        method: Method,
        args: Parameters<TelegramBot[Method]>,
        chatId?: TelegramBot.ChatId
    ): Promise<ReturnType<TelegramBot[Method]>>;
}
