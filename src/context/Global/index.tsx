import React, { Dispatch, useEffect } from 'react';
import { GlobalSettings, Profile } from '../../types';
import { CYCLOPS_SETTINGS_STORAGE_KEY, getRandomId } from '../../utils';

export enum ActionType {
    SET_GLOBAL_ENABLED = 'set_global_enabled',
    SET_SELECTED_PROFILE = 'set_selected_profile',
    SET_PROFILES = 'set_profiles',
    UPDATE_CURRENTLY_SELECTED_PROFILE_FIELDS = 'update_currently_selected_profile_fields',
    SET_CURRENT_PROFILE_REQUEST_HEADERS = 'set_current_profile_request_headers',
    SET_CURRENT_PROFILE_NEW_HEADER = 'set_current_profile_NEW_HEADER',
    SET_CURRENT_PROFILE_DELETE_HEADER = 'set_current_profile_delete_header',
    CREATE_NEW_PROFILE = 'create_new_profile',
    UPDATE_PROFILE_ENABLE = 'update_profile_enable'
}

export type Action = {
    type: ActionType;
    payload?: any;
};

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

const initialState: GlobalSettings = {
    enabled: true,
    profiles: [{ id: getRandomId(), name: '', requestHeaders: [], enabled: true, currentlySelected: true }]
};

const GlobalContext = React.createContext<{ state: GlobalSettings; dispatch: Dispatch<Action> }>({
    state: initialState,
    dispatch: () => null
});

const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = React.useReducer(reducer, initialState);

    useEffect(() => {
        const saveSettingsToStorage = async () => {
            await chrome.storage.local.set({
                [CYCLOPS_SETTINGS_STORAGE_KEY]: state
            });
        };

        const updateRequestRules = async () => {
            // remove rules are run first, so take the easy way out and remove all profiles
            const profileIdsToRemove = state.profiles?.map((x: any) => x.id);
            if (profileIdsToRemove?.length) {
                await chrome.declarativeNetRequest.updateSessionRules({
                    removeRuleIds: profileIdsToRemove
                });
            }

            // check we are enabled globally
            if (state.enabled) {
                // retrieve all profiles that are enabled along with all of the headers that are enabled and valid
                const enabledProfilesAndHeaders = state.profiles.reduce((accumulator: any, profile: Profile) => {
                    if (profile.enabled) {
                        const validHeaders = profile.requestHeaders.filter((x) => x.enabled && x.name && x.value);

                        if (validHeaders?.length) {
                            accumulator.push({
                                id: profile.id,
                                requestHeaders: validHeaders.map((x) => ({
                                    header: x.name,
                                    operation: chrome.declarativeNetRequest.HeaderOperation.SET,
                                    value: x.value
                                }))
                            });
                        }
                    }
                    return accumulator;
                }, []);

                if (enabledProfilesAndHeaders?.length) {
                    await chrome.declarativeNetRequest.updateSessionRules({
                        addRules: enabledProfilesAndHeaders.map((x: any) => ({
                            id: x.id,
                            action: {
                                type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
                                requestHeaders: x.requestHeaders
                            },
                            condition: {
                                resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
                            }
                        }))
                    });
                }
            }
        };

        saveSettingsToStorage();
        updateRequestRules();
    }, [state]);

    return <GlobalContext.Provider value={{ state, dispatch } as any}>{children}</GlobalContext.Provider>;
};

export { GlobalContext, GlobalProvider };
