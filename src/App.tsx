import { Button, Checkbox, TextInput } from 'flowbite-react';
import React, { useContext, useEffect } from 'react';
import { Header } from './components/Header';
import { ActionType, GlobalContext } from './context/Global';
import { GlobalSettings } from './types';
import { CYCLOPS_SETTINGS_STORAGE_KEY } from './utils';

function App() {
    const { state: globalState, dispatch } = useContext(GlobalContext);
    const { enabled: globalEnabled, profiles } = globalState || {};
    const selectedProfile = profiles.find((x) => x.currentlySelected);
    // console.log('global state', globalState);

    useEffect(() => {
        const getSettingsFromStorage = async () => {
            const settingsResponse = await chrome.storage.local.get(CYCLOPS_SETTINGS_STORAGE_KEY);

            console.log('settings', settingsResponse);
            const settings = settingsResponse[CYCLOPS_SETTINGS_STORAGE_KEY] as GlobalSettings;

            if (settings) {
                // setGlobalEnabled(settings.enabled);
                dispatch({
                    type: ActionType.SET_GLOBAL_ENABLED,
                    payload: settings.enabled
                });

                if (settings?.profiles?.length) {
                    // setProfiles(settings.profiles);
                    dispatch({
                        type: ActionType.SET_PROFILES,
                        payload: settings.profiles
                    });
                }
            }
        };
        getSettingsFromStorage();
    }, []);

    const handleProfileNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({
            type: ActionType.UPDATE_CURRENTLY_SELECTED_PROFILE_FIELDS,
            payload: {
                name: 'name',
                value: e.target.value
            }
        });
    };

    const handleRequestHeaderChange = (id: number, event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch({
            type: ActionType.SET_CURRENT_PROFILE_REQUEST_HEADERS,
            payload: {
                id,
                name: event.target.name,
                value: event.target.value
            }
        });
    };

    const handleCheckboxChange = (id: number) => {
        dispatch({
            type: ActionType.SET_CURRENT_PROFILE_REQUEST_HEADERS,
            payload: {
                id,
                name: 'enabled',
                value: !selectedProfile?.requestHeaders.find((x) => x.id === id)?.enabled
            }
        });
    };

    const addHeaderClick = () => {
        dispatch({
            type: ActionType.SET_CURRENT_PROFILE_NEW_HEADER
        });
    };

    const deleteHeaderClick = (id: number) => {
        dispatch({
            type: ActionType.SET_CURRENT_PROFILE_DELETE_HEADER,
            payload: id
        });
    };

    return (
        <div className="App">
            <Header />

            <div className={`flex flex-col ${!globalEnabled && selectedProfile ? 'bg-gray-200' : ''}`}>
                <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="overflow-x-auto">
                            <TextInput
                                id={`${selectedProfile?.id}`}
                                value={selectedProfile?.name}
                                onChange={handleProfileNameChange}
                                disabled={!globalEnabled}
                                placeholder="Profile Name..."
                            />
                            <Button size="xs" onClick={addHeaderClick} disabled={!globalEnabled}>
                                Add Header
                            </Button>
                            <table className="min-w-full text-center">
                                <thead className="border-b">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="text-sm font-medium text-gray-900 px-6 py-2 text-left"
                                        >
                                            Enabled
                                        </th>
                                        <th
                                            scope="col"
                                            className="text-sm font-medium text-gray-900 px-6 py-2 text-left"
                                        >
                                            Name
                                        </th>
                                        <th
                                            scope="col"
                                            className="text-sm font-medium text-gray-900 px-6 py-2 text-left"
                                        >
                                            Value
                                        </th>
                                        <th
                                            scope="col"
                                            className="text-sm font-medium text-gray-900 px-6 py-2 text-left"
                                        ></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedProfile?.requestHeaders
                                        ?.sort((a, b) => {
                                            const nameA = a.name.toUpperCase();
                                            const nameB = b.name.toUpperCase();
                                            if (nameA < nameB) {
                                                return -1;
                                            }
                                            if (nameA > nameB) {
                                                return 1;
                                            }

                                            return 0;
                                        })
                                        .map((reqHeader: any) => {
                                            return (
                                                <tr className="border-b" key={reqHeader.id}>
                                                    <td className="px-6 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                                        <Checkbox
                                                            name="enabled"
                                                            id={`${reqHeader.id.toString()}enabled`}
                                                            checked={reqHeader.enabled}
                                                            onChange={() => handleCheckboxChange(reqHeader.id)}
                                                            disabled={!globalEnabled}
                                                        />
                                                    </td>
                                                    <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                                        <TextInput
                                                            name="name"
                                                            id={`${reqHeader.id.toString()}name`}
                                                            value={reqHeader.name}
                                                            onChange={(e) => handleRequestHeaderChange(reqHeader.id, e)}
                                                            disabled={!globalEnabled}
                                                            sizing="sm"
                                                        />
                                                    </td>
                                                    <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
                                                        <TextInput
                                                            name="value"
                                                            id={`${reqHeader.id.toString()}value`}
                                                            value={reqHeader.value}
                                                            onChange={(e) => handleRequestHeaderChange(reqHeader.id, e)}
                                                            disabled={!globalEnabled}
                                                            sizing="sm"
                                                        />
                                                    </td>
                                                    <td className="text-sm text-gray-900 font-light px-6 py-2 whitespace-nowrap">
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
