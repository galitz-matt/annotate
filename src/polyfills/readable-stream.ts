if (!ReadableStream.prototype[Symbol.asyncIterator]) {
    ReadableStream.prototype[Symbol.asyncIterator] = function <T>(
        this: ReadableStream<T>
    ): AsyncIterableIterator<T> {
        const reader = this.getReader();

        let finished = false;

        const iterator: AsyncIterableIterator<T> = {
            async next(): Promise<IteratorResult<T>> {
                if (finished) {
                    return { done: true, value: undefined };
                }

                try {
                    const result = await reader.read();

                    if (result.done) {
                        finished = true;
                        reader.releaseLock();
                    }

                    return result;
                } catch (error) {
                    finished = true;
                    reader.releaseLock();
                    throw error;
                }
            },

            async return(): Promise<IteratorResult<T>> {
                if (!finished) {
                    finished = true;

                    try {
                        await reader.cancel();
                    } finally {
                        reader.releaseLock();
                    }
                }

                return { done: true, value: undefined };
            },

            [Symbol.asyncIterator](): AsyncIterableIterator<T> {
                return this;
            }
        };

        return iterator;
    };
}
