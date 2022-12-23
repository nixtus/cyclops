import { z } from 'zod';

export function getRandomId() {
    return Math.floor(Math.random() * 100_000_000);
}

export const CYCLOPS_SETTINGS_STORAGE_KEY = 'CYCLOPS_SETTINGS';

const profileRequestHeaderSchema = z.object({
    id: z.number(),
    name: z.string(),
    value: z.string(),
    enabled: z.boolean()
});

const profileSchema = z.object({
    id: z.number(),
    name: z.string(),
    requestHeaders: z.array(profileRequestHeaderSchema),
    enabled: z.boolean(),
    currentlySelected: z.boolean()
});

const profileArraySchema = z.array(profileSchema);

export function parseImportSettings(profiles: unknown) {
    return profileArraySchema.safeParse(profiles);
}
