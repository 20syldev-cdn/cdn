export function createEventBus() {
    const listeners = new Map();
    function on(event, callback) {
        if (!listeners.has(event))
            listeners.set(event, []);
        listeners.get(event).push(callback);
    }
    function off(event, callback) {
        if (!listeners.has(event))
            return;
        const cbs = listeners.get(event).filter((cb) => cb !== callback);
        listeners.set(event, cbs);
    }
    function emit(event, data) {
        if (!listeners.has(event))
            return;
        for (const cb of listeners.get(event)) {
            cb(data);
        }
    }
    return { on, off, emit };
}
