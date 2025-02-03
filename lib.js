export class TelegramBotQueue {
    elements = [];

    constructor(bot, limit) {
        this.bot = bot;
        this.limit = limit;
    }

    push(method, parameters, chatId) {
        var element = new Element(method, parameters, this.bot, this, chatId);

        this.elements.push(element);
    
        if (this.elements.length <= this.limit && element.canSend()) {
            element.send();
        }

        return element.getMessage();
    }

    remove(elementToRemove) {
        this.elements = this.elements.filter(element => element !== elementToRemove);
        this.elements.find(element => element.canSend())?.send();
    }
}


class Element {
    sending = false;

    constructor(method, parameters, bot, queue, chatId) {
        this.method = method;
        this.parameters = parameters;
        this.bot = bot;
        this.queue = queue;
        this.chatId = chatId;

        this.message = new Promise((resolve, reject) => {
            this.messageResolve = resolve;
            this.messageReject = reject;
        });
    }

    send() {
        this.sending = true;
        this.bot[this.method](...this.parameters)
            .then(this.messageResolve.bind(this))
            .catch(this.messageReject.bind(this))
            .finally(() => setTimeout(() => this.queue.remove(this), 1000));
    }

    async getMessage() {
        return await this.message;
    }
    
    canSend() {
        var isSending = element => typeof element.chatId != 'undefined' && element.chatId == this.chatId && element.sending;
        var element = this.queue.elements.some(isSending);
        return !this.sending && !element;
    }
}

