export const createIntervalPool = () => {
    let intervals: Array<{ time: number; cb(): void; instance: any; }> = [];

    return {
        set(cb: ()=>void, time: number) {

            const interval = setInterval(cb, time);
            intervals.push({
                cb,
                time,
                instance: interval,
            });

            return interval;
        },
        pause() {
            intervals = intervals.map(({ instance, cb, time }) => {
                clearInterval(instance);

                return {
                    instance: null,
                    cb,
                    time,
                }
            });
        },
        resume() {
            intervals = intervals.map(({ time, cb }) => {
                const interval = setInterval(cb, time);
                return {
                    time,
                    cb,
                    instance: interval,
                }
            });
        }
    }
}

export const intervals = createIntervalPool();

