import React, { useEffect, useState } from 'react';
import './App.css';

interface ProfileRequestHeader {
    id: number;
    name: string;
    value: string;
    enabled: boolean;
}
interface Profile {
    id: number;
    name: string;
    requestHeaders: ProfileRequestHeader[];
}

interface GlobalSettings {}

const CURRENT_PROFILE_KEY = 'currentProfile';

function getRandomId() {
    return Math.floor(Math.random() * 1000);
}

function App() {
    const [globalEnabled, setGlobalEnabled] = useState<boolean>(true);
    // const [profiles, setProfiles] = useState<Profile[]>();
    const [selectedProfile, setSelectedProfile] = useState<Profile>({
        id: getRandomId(),
        name: '',
        requestHeaders: []
    });

    useEffect(() => {
        const getProfileFromStorage = async () => {
            const profile = await chrome.storage.local.get(CURRENT_PROFILE_KEY);
            if (profile?.currentProfile) {
                console.log('GOT PROFILE from storage', profile);

                setSelectedProfile(profile.currentProfile);
            }
        };
        getProfileFromStorage();
    }, []);

    console.log('selected profile', selectedProfile);

    const updateRequestRules = async () => {
        // remove rules are run first, so take the easy way out and remove the profile and re-add all the active headers
        await chrome.declarativeNetRequest.updateSessionRules({
            removeRuleIds: [selectedProfile.id]
        });

        // logic for using a single rule which maps to a profile and therefore all the headers underneath it
        await chrome.declarativeNetRequest.updateSessionRules({
            addRules: [
                {
                    id: selectedProfile.id,
                    action: {
                        type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
                        requestHeaders: selectedProfile.requestHeaders.reduce((accumulator, header) => {
                            if (header.enabled) {
                                accumulator.push({
                                    header: header.name,
                                    operation: chrome.declarativeNetRequest.HeaderOperation.SET,
                                    value: header.value
                                });
                            }

                            return accumulator;
                        }, [] as any)
                    },
                    condition: {
                        resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
                    }
                }
            ]
        });

        // logic for setting every request header as its own rule
        // await chrome.declarativeNetRequest.updateSessionRules({
        //     addRules: selectedProfile?.requestHeaders.map((header) => {
        //         return {
        //             id: header.id,
        //             action: {
        //                 type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
        //                 requestHeaders: [
        //                     {
        //                         header: header.name,
        //                         operation: chrome.declarativeNetRequest.HeaderOperation.SET,
        //                         value: header.value
        //                     }
        //                 ]
        //             },
        //             condition: {
        //                 resourceTypes: [chrome.declarativeNetRequest.ResourceType.MAIN_FRAME]
        //             }
        //         };
        //     })
        // });
    };

    const saveSelectedProfileToStorage = async () => {
        if (selectedProfile) {
            await chrome.storage.local.set({ [CURRENT_PROFILE_KEY]: selectedProfile });
        }
    };

    const globalEnableClick = () => {
        setGlobalEnabled(!globalEnabled);
    };

    const handleChange = (id: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const current: any = selectedProfile?.requestHeaders.find((x) => x.id === id);
        if (current) {
            current[event.target.name] = event.target.value;

            setSelectedProfile({
                ...selectedProfile,
                requestHeaders: [...(selectedProfile?.requestHeaders || []).filter((x) => x.id !== id), current]
            } as any);

            saveSelectedProfileToStorage();
            updateRequestRules();
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

            saveSelectedProfileToStorage();
            updateRequestRules();
        }
    };

    const addHeaderClick = () => {
        const headers = [
            ...(selectedProfile?.requestHeaders || []),
            { id: Math.floor(Math.random() * 1000), name: '', value: '', enabled: true }
        ];
        setSelectedProfile({ ...selectedProfile, requestHeaders: headers } as any);
    };

    const deleteHeaderClick = (id: number) => {
        setSelectedProfile({
            ...selectedProfile,
            requestHeaders: selectedProfile?.requestHeaders.filter((x) => x.id !== id)
        } as any);

        saveSelectedProfileToStorage();
        updateRequestRules();
    };

    return (
        <div className="App">
            <nav className="relative w-full flex flex-wrap items-center justify-between py-3 bg-gray-100 text-gray-500 hover:text-gray-700 focus:text-gray-700 shadow-lg">
                <div className="container-fluid w-full flex flex-wrap items-center justify-between px-6">
                    <div className="container-fluid">
                        <a className="text-xl text-black" href="#">
                            Navbar
                        </a>
                    </div>
                    <ul className="navbar-nav flex flex-col pl-0 list-style-none mr-auto">
                        <li className="nav-item px-2">
                            <button onClick={globalEnableClick}>{globalEnabled ? 'Stop' : 'Start'}</button>
                        </li>
                    </ul>
                </div>
            </nav>
            <div className="flex flex-col">
                <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="py-2 inline-block min-w-full sm:px-6 lg:px-8">
                        <div className="overflow-x-auto">
                            <button
                                type="button"
                                className="inline-block px-4 py-1.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
                                onClick={addHeaderClick}
                            >
                                Add Header
                            </button>
                            <table className="min-w-full">
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
                                                    <input
                                                        type="checkbox"
                                                        name="enabled"
                                                        id={`${reqHeader.id.toString()}enabled`}
                                                        checked={reqHeader.enabled}
                                                        onChange={() => handleCheckboxChange(reqHeader.id)}
                                                    />
                                                </td>
                                                <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        className="form-control block w-full px-2 py-1 text-sm font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                                                        type="text"
                                                        name="name"
                                                        id={`${reqHeader.id.toString()}name`}
                                                        value={reqHeader.name}
                                                        onChange={(e) => handleChange(reqHeader.id, e)}
                                                    />
                                                </td>
                                                <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                                    <input
                                                        className="form-control block w-full px-2 py-1 text-sm font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none"
                                                        type="text"
                                                        name="value"
                                                        id={`${reqHeader.id.toString()}value`}
                                                        value={reqHeader.value}
                                                        onChange={(e) => handleChange(reqHeader.id, e)}
                                                    />
                                                </td>
                                                <td className="text-sm text-gray-900 font-light px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        type="button"
                                                        className="inline-block px-4 py-1.5 bg-blue-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out"
                                                        onClick={() => deleteHeaderClick(reqHeader.id)}
                                                    >
                                                        Delete
                                                    </button>
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
