import { GlobalSettings } from '../../types';
import { getRandomId } from '../../utils';
import { Action, ActionType } from './actions';

export const reducer = (state: GlobalSettings, action: Action) => {
    switch (action.type) {
        case ActionType.SET_GLOBAL_ENABLED:
            return {
                ...state,
                enabled: action.payload
            };
        case ActionType.SET_SELECTED_PROFILE: {
            const newSelectedProfile = state.profiles.find((x) => x.id === action.payload);

            return {
                ...state,
                profiles: [
                    ...state.profiles.reduce((accumulator, profile) => {
                        if (profile.id !== newSelectedProfile?.id) {
                            accumulator.push({ ...profile, currentlySelected: false });
                        }
                        return accumulator;
                    }, [] as any),
                    { ...newSelectedProfile, currentlySelected: true }
                ]
            };
        }
        case ActionType.SET_PROFILES:
            return {
                ...state,
                profiles: action.payload
            };
        case ActionType.APPEND_TO_PROFILES:
            return {
                ...state,
                profiles: [...state.profiles, ...action.payload]
            };
        case ActionType.UPDATE_PROFILE_ENABLE: {
            const profile = state.profiles.find((x) => x.id === action.payload);

            return {
                ...state,
                profiles: [
                    ...state.profiles.filter((x) => x.id !== profile?.id),
                    { ...profile, enabled: !profile?.enabled }
                ]
            };
        }
        case ActionType.CREATE_NEW_PROFILE: {
            const newProfile = {
                id: getRandomId(),
                name: '',
                requestHeaders: [],
                enabled: true,
                currentlySelected: true
            };

            return {
                ...state,
                profiles: [
                    ...state.profiles.reduce((accumulator, profile) => {
                        if (profile.id !== newProfile.id) {
                            accumulator.push({ ...profile, currentlySelected: false });
                        }
                        return accumulator;
                    }, [] as any),
                    newProfile
                ]
            };
        }
        case ActionType.DELETE_CURRENT_PROFILE: {
            const current = state.profiles.find((x) => x.currentlySelected);
            const newCurrent = state.profiles.find((x) => !x.currentlySelected);

            return {
                ...state,
                profiles: [
                    ...state.profiles.reduce((accumulator, profile) => {
                        if (profile.id !== current?.id && profile.id !== newCurrent?.id) {
                            accumulator.push({ ...profile, currentlySelected: false });
                        }
                        return accumulator;
                    }, [] as any),
                    { ...newCurrent, currentlySelected: true }
                ]
            };
        }
        case ActionType.DUPLICATE_CURRENT_PROFILE: {
            const current: any = state.profiles.find((x) => x.currentlySelected) || {};

            const copy = Object.keys(current).reduce((accumulator, key) => {
                if (key === 'id') {
                    accumulator[key] = getRandomId();
                } else if (key === 'requestHeadaers') {
                    accumulator[key] = current[key].map((header: any) => ({
                        ...header,
                        id: getRandomId()
                    }));
                } else if (key === 'name') {
                    accumulator[key] = `${current[key]} - Copy ${getRandomId()}`;
                } else {
                    accumulator[key] = current[key];
                }

                return accumulator;
            }, {} as any);

            return {
                ...state,
                profiles: [
                    ...state.profiles.reduce((accumulator, profile) => {
                        if (profile.id !== copy.id) {
                            accumulator.push({ ...profile, currentlySelected: false });
                        }
                        return accumulator;
                    }, [] as any),
                    copy
                ]
            };
        }
        case ActionType.UPDATE_CURRENTLY_SELECTED_PROFILE_FIELDS: {
            const selectedProfile = state.profiles.find((x) => x.currentlySelected);

            return {
                ...state,
                profiles: [
                    ...state.profiles.filter((x) => x.id !== selectedProfile?.id),
                    { ...selectedProfile, [action.payload.name]: action.payload.value }
                ]
            };
        }
        case ActionType.SET_CURRENT_PROFILE_REQUEST_HEADERS: {
            const selectedProfile = state.profiles.find((x) => x.currentlySelected);
            const currentRequestHeader: any = selectedProfile?.requestHeaders.find((x) => x.id === action.payload.id);

            return {
                ...state,
                profiles: [
                    ...state.profiles.filter((x) => x.id !== selectedProfile?.id),
                    {
                        ...selectedProfile,
                        requestHeaders: [
                            ...(selectedProfile?.requestHeaders || []).filter((x) => x.id !== currentRequestHeader.id),
                            { ...currentRequestHeader, [action.payload.name]: action.payload.value }
                        ]
                    }
                ]
            };
        }
        case ActionType.SET_CURRENT_PROFILE_NEW_HEADER: {
            const selectedProfile = state.profiles.find((x) => x.currentlySelected);

            return {
                ...state,
                profiles: [
                    ...state.profiles.filter((x) => x.id !== selectedProfile?.id),
                    {
                        ...selectedProfile,
                        requestHeaders: [
                            ...(selectedProfile?.requestHeaders || []),
                            { id: getRandomId(), name: '', value: '', enabled: true }
                        ]
                    }
                ]
            };
        }

        case ActionType.SET_CURRENT_PROFILE_DELETE_HEADER: {
            const selectedProfile = state.profiles.find((x) => x.currentlySelected);

            return {
                ...state,
                profiles: [
                    ...state.profiles.filter((x) => x.id !== selectedProfile?.id),
                    {
                        ...selectedProfile,
                        requestHeaders: [
                            ...(selectedProfile?.requestHeaders || []).filter((x) => x.id !== action.payload)
                        ]
                    }
                ]
            };
        }
        default:
            return state;
    }
};
