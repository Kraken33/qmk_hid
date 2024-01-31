enum AsyncQueueStatues {
    paused,
    executing,
}

type AsyncFunction = () => Promise<void>;

type AsyncFunctionsQueue = () => ({
    status: AsyncQueueStatues;
    queueStack: Array<AsyncFunction>;
    add(fn: AsyncFunction): Promise<void>;
    exec(): Promise<void>;
    clear(): void;
})

export const createAsyncQueue: AsyncFunctionsQueue = () => {
    return {
        status: 0,
        queueStack: [],
        async add(fn) {
            this.queueStack.push(fn);
            if (this.status === 0) {
                await this.exec();
            }
        },
        async exec() {
            this.status = 1;
            for (let fn of this.queueStack) {
                if (!this.status) {
                    break;
                }
                await fn().catch((e) => {
                    console.warn(e);
                });
            }
            this.queueStack = [];
            this.status = 0;
        },
        clear() {
            this.status = 0;
            this.queueStack = [];
        }
    }
}

export const asyncQueue = createAsyncQueue();