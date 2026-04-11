import { DOCS_URL, STATUS_MESSAGES } from '../constants.js';
export function error(res, status, message, docPath) {
    res.status(status).jsonResponse({
        message: STATUS_MESSAGES[status] ?? 'Error',
        error: message,
        documentation: docPath ? `${DOCS_URL}/${docPath}` : DOCS_URL,
        status: String(status),
    });
}
//# sourceMappingURL=response.js.map