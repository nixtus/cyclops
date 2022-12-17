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
}

export interface GlobalSettings {
    enabled: boolean;
    selectedProfile: Profile;
    profiles: Profile[];
}
