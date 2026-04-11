import { error } from '../utils/response.js';
export function errorHandler(err, _req, res, _next) {
    console.error(err.stack);
    error(res, 500, err.message);
}
//# sourceMappingURL=error.js.map