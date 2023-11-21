import { describe } from 'vitest';
import { parseImportSettings } from '.';

describe('Parsing Settings', () => {
    describe('parseImportSettings', () => {
        it('should safely parse app settings successfully', () => {
            const settings = [
                {
                    id: 1,
                    name: 'test',
                    enabled: false,
                    currentlySelected: false,
                    requestHeaders: [
                        {
                            id: 11,
                            name: 'header1',
                            value: 'headerval1',
                            enabled: true
                        }
                    ]
                }
            ];

            const result = parseImportSettings(settings);

            expect(result.success).toBe(true);
            expect((result as any).data.length).toBe(1);
            expect(result).not.toHaveProperty('error');
        });

        it('should safely parse app settings, even when parsing fails', () => {
            const settings = [
                {
                    id: 1,
                    name: 'test',
                    requestHeaders: [
                        {
                            id: 11,
                            name: 'header1',
                            value: 'headerval1',
                            enabled: true
                        }
                    ]
                }
            ];

            const result = parseImportSettings(settings);

            expect(result.success).toBe(false);
            expect(result).toHaveProperty('error');
            expect(result).not.toHaveProperty('data');
        });
    });
});
