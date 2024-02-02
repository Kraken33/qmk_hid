export const asyncPipe = (...fns: any) => {
  return async function (arg?: any) {
    let res = arg;
    for (let fn of fns) {
      res = await fn(res);
    }
    return res;
  }
}

export const memoize = <T extends object = any, R = any>(cb: (p: T) => Promise<R>) => {
  const store: Record<string, any> = {};
  return async (p: T) => {
    const key = JSON.stringify(p);

    if (key in store) {
      return store[key];
    }
    const result = await cb(p);
    store[key] = result;

    return result;
  }
}