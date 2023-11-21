// https://groups.google.com/a/chromium.org/g/chromium-extensions/c/hssoAlvluW8/m/g9B-6hv2AAAJ

import { vi, beforeAll } from 'vitest';

beforeAll(() => {
    const chromeMock = {
        tabs: {
            query: vi.fn((_queryInfo, callback) => {
                callback([{ id: 123 }]);
            }),
            create: vi.fn(({ url }: { url: string }) => {})
        },
        sidePanel: {
            open: vi.fn()
        },
        storage: {
            local: {
                get: vi.fn().mockResolvedValue({})
            }
        },
        commands: {
            getAll: vi.fn(() => {
                return [];
            })
        }
    };

    vi.stubGlobal('chrome', chromeMock);
});
