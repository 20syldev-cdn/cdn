import * as apiv3 from '../modules/v3.js';
import * as apiv4 from '../modules/v4.js';
import * as apiv5 from '../modules/v5.js';
export interface Endpoint {
    name: string;
    path?: string;
    children?: Record<string, string>;
}
export interface VersionConfig {
    endpoints: {
        get: Endpoint[];
        post: Endpoint[];
        patch?: Endpoint[];
        delete?: Endpoint[];
    };
    modules: typeof apiv3 | typeof apiv4 | typeof apiv5;
}
export declare const versions: Record<string, VersionConfig>;
