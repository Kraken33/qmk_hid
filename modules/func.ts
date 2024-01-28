import fp from './fp';

enum AsyncQueueStatues {
    paused,
    executing,
}

type AsyncFunctionsQueue = () => ({
    status: AsyncQueueStatues;
    queueStack: Array<Promise<() => void>>;
    add(fn: ()=>Promise<void>): Promise<void>;
    exec(): Promise<void>;
})

export const asyncFunctionsQueue: AsyncFunctionsQueue = () => {
    return {
        status: 0,
        queueStack: [],
        async add(fn: any) {
            this.queueStack.push(fn);
            if (this.status === 0) {
                await this.exec();
            }
        },
        async exec() {
            this.status = 1;
            await fp.arrayAsyncPipe(this.queueStack)();
            this.queueStack = [];
            this.status = 0;
        }
    }
}