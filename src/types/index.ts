export interface ProfileRequestHeader {
    id: number;
    name: string;
    value: string;
    enabled: boolean;
}

export interface Profile {
    id: number;
    name: string;
    requestHeaders: ProfileRequestHeader[];
    enabled: boolean;
    currentlySelected: boolean;
}

export interface GlobalSettings {
    enabled: boolean;
    profiles: Profile[];
}
