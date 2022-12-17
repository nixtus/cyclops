import { Button, Checkbox, TextInput } from 'flowbite-react';
import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { GlobalSettings, Profile } from './types';

const CYCLOPS_SETTINGS_STORAGE_KEY = 'CYCLOPS_SETTINGS';

function getRandomId() {
    return Math.floor(Math.random() * 10000);
}

function App() {
    const [globalEnabled, setGlobalEnabled] = useState<boolean>(true);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [selectedProfile, setSelectedProfile] = useState<Profile>({
        id: getRandomId(),
        name: '',
        requestHeaders: []
    });

    useEffect(() => {
        const getSettingsFromStorage = async () => {
            const settingsResponse = await chrome.storage.local.get(CYCLOPS_SETTINGS_STORAGE_KEY);

            const settings = settingsResponse[CYCLOPS_SETTINGS_STORAGE_KEY] as GlobalSettings;
            console.log('settings', settings);

            if (settings) {
                setGlobalEnabled(settings.enabled);

                if (settings?.selectedProfile) {
                    setSelectedProfile(settings.selectedProfile);
                }

                if (settings?.profiles?.length) {
                    setProfiles(settings.profiles);
                }

                // ensure rules are updated from whats in storage
                updateRequestRules(settings.enabled);
            }
        };
        getSettingsFromStorage();
    }, []);

    console.log('selected profile', selectedProfile, globalEnabled);

    const updateRequestRules = async (enabled: boolean) => {
        // remove rules are run first, so take the easy way out and remove the profile and re-add all the active headers
        await chrome.declarativeNetRequest.updateSessionRules({
            removeRuleIds: [selectedProfile.id]
        });

        // check we are enabled globally
        if (enabled !== undefined && enabled) {
            // logic for using a single rule which maps to a profile and therefore all the headers underneath it
            const filteredHeaders = selectedProfile.requestHeaders.reduce((accumulator, header) => {
                if (header.enabled && header.name && header.value) {
                    console.log('adding header', header);

                    accumulator.push({
                        header: header.name,
                        operation: chrome.declarativeNetRequest.HeaderOperation.SET,
                        value: header.value
                    });
                }

                return accumulator;
            }, [] as any);

            if (filteredHeaders?.length) {
                await chrome.declarativeNetRequest.updateSessionRules({
                    addRules: [
                        {
                            id: selectedProfile.id,
                            action: {
                                type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
                                requestHeaders: filteredHeaders
                            },
                            condition: {
                                resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
                            }
                        }
                    ]
                });
            }
        }
    };

    const saveSettingsToStorage = async (enabled?: boolean) => {
        const profile = {
            ...selectedProfile,
            // don't save any headers that don't have a name and value
            requestHeaders: selectedProfile.requestHeaders.filter((x) => x.name && x.value)
        };

        await chrome.storage.local.set({
            [CYCLOPS_SETTINGS_STORAGE_KEY]: {
                enabled: enabled !== undefined ? enabled : globalEnabled,
                selectedProfile: profile,
                profiles: [...profiles, profile]
            }
        });
    };

    const globalEnableClick = () => {
        const current = !globalEnabled;
        setGlobalEnabled(current);
        saveSettingsToStorage(current);
        updateRequestRules(current);
    };

    const addProfile = () => {
        const newProfile = { id: getRandomId(), name: '', requestHeaders: [] };

        setSelectedProfile(newProfile);
    };

    const selectedProfileChange = (id: number) => {
        const foundProfile = profiles.find((x) => x.id === id);
        if (foundProfile) {
            setSelectedProfile(foundProfile);
        }
    };

    const handleProfileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedProfile({ ...selectedProfile, name: e.target.value });

        saveSettingsToStorage();
        updateRequestRules(globalEnabled);
    };

    const handleRequestHeaderChange = (id: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const current: any = selectedProfile?.requestHeaders.find((x) => x.id === id);
        if (current) {
            current[event.target.name] = event.target.value;

            setSelectedProfile({
                ...selectedProfile,
                requestHeaders: [...(selectedProfile?.requestHeaders || []).filter((x) => x.id !== id), current]
            } as any);

            saveSettingsToStorage();
            updateRequestRules(globalEnabled);
        }
    };

    const handleCheckboxChange = (id: number) => {
        const current: any = selectedProfile?.requestHeaders.find((x) => x.id === id);
        if (current) {
            current.enabled = !current.enabled;

            setSelectedProfile({
                ...selectedProfile,
                requestHeaders: [...(selectedProfile?.requestHeaders || []).filter((x) => x.id !== id), current]
            } as any);

            saveSettingsToStorage();
            updateRequestRules(globalEnabled);
        }
    };

    const addHeaderClick = () => {
        setSelectedProfile((current) => {
            const headers = [
                ...(current?.requestHeaders || []),
                { id: getRandomId(), name: '', value: '', enabled: true }
            ];

            return { ...current, requestHeaders: headers } as any;
        });
    };

    const deleteHeaderClick = (id: number) => {
        setSelectedProfile({
            ...selectedProfile,
            requestHeaders: selectedProfile?.requestHeaders.filter((x) => x.id !== id)
        } as any);

        saveSettingsToStorage();
        updateRequestRules(globalEnabled);
    };

    return (
        <div className="App">
            <Header
                globalEnabled={globalEnabled}
                updateGlobalEnabled={globalEnableClick}
                profiles={profiles}
                addProfileClick={addProfile}
                changeProfileClick={selectedProfileChange}
            />

            <div className={`flex flex-col ${!globalEnabled ? 'bg-gray-200' : ''}`}>
                <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="overflow-x-auto">
                            <TextInput
                                id={`${selectedProfile.id}`}
                                value={selectedProfile.name}
                                onChange={handleProfileNameChange}
                                disabled={!globalEnabled}
                                placeholder="Profile Name..."
                            />
                            <Button size="xs" onClick={addHeaderClick} disabled={!globalEnabled}>
                                Add Header
                            </Button>
                            <table>
                                <thead className="border-b">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                                        >
                                            Enabled
                                        </th>
                                        <th
                                            scope="col"
                                            className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                                        >
                                            Name
                                        </th>
                                        <th
                                            scope="col"
                                            className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                                        >
                                            Value
                                        </th>
                                        <th
                                            scope="col"
                                            className="text-sm font-medium text-gray-900 px-6 py-4 text-left"
                                        ></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedProfile?.requestHeaders?.map((reqHeader) => {
                                        return (
                                            <tr className="border-b" key={reqHeader.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    <Checkbox
                                                        name="enabled"
                                                        id={`${reqHeader.id.toString()}enabled`}
                                                        checked={reqHeader.enabled}
                                                        onChange={() => handleCheckboxChange(reqHeader.id)}
                                                        disabled={!globalEnabled}
                                                    />
                                                </td>
                                                <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                                    <TextInput
                                                        name="name"
                                                        id={`${reqHeader.id.toString()}name`}
                                                        value={reqHeader.name}
                                                        onChange={(e) => handleRequestHeaderChange(reqHeader.id, e)}
                                                        disabled={!globalEnabled}
                                                    />
                                                </td>
                                                <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                                    <TextInput
                                                        name="value"
                                                        id={`${reqHeader.id.toString()}value`}
                                                        value={reqHeader.value}
                                                        onChange={(e) => handleRequestHeaderChange(reqHeader.id, e)}
                                                        disabled={!globalEnabled}
                                                    />
                                                </td>
                                                <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                                    <Button
                                                        size="xs"
                                                        onClick={() => deleteHeaderClick(reqHeader.id)}
                                                        disabled={!globalEnabled}
                                                    >
                                                        Delete
                                                    </Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
