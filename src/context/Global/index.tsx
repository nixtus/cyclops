import React, { Dispatch, useEffect, useRef } from 'react';
import { GlobalSettings, Profile } from '../../types';
import { CYCLOPS_SETTINGS_STORAGE_KEY, getRandomId } from '../../utils';
import { Action } from './actions';
import { reducer } from './reducer';

const initialState: GlobalSettings = {
    enabled: true,
    profiles: [{ id: getRandomId(), name: '', requestHeaders: [], enabled: true, currentlySelected: true }]
};

const GlobalContext = React.createContext<{ state: GlobalSettings; dispatch: Dispatch<Action> }>({
    state: initialState,
    dispatch: () => null
});

function usePrevious(value: any) {
    const ref = useRef();

    useEffect(() => {
        ref.current = value;
    }, [value]);

    return ref.current;
}

const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = React.useReducer(reducer, initialState);

    const previousState: any = usePrevious(state);

    useEffect(() => {
        const saveSettingsToStorage = async () => {
            await chrome.storage.local.set({
                [CYCLOPS_SETTINGS_STORAGE_KEY]: state
            });
        };

        const updateRequestRules = async () => {
            // remove rules are run first, so take the easy way out and remove all profiles
            // we need to store and check the previous state so that we can actually remove the profile
            // that was just deleted
            const profileIdsToRemove = [
                ...state.profiles?.map((x: any) => x.id),
                ...(previousState?.profiles || []).map((x: any) => x.id)
            ];
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
