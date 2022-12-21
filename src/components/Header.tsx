import { Button, Checkbox, Dropdown } from 'flowbite-react';
import React, { useContext } from 'react';
import { ActionType, GlobalContext } from '../context/Global';

export function Header() {
    const { state: globalState, dispatch } = useContext(GlobalContext);
    const { enabled: globalEnabled, profiles } = globalState || {};

    const handleGlobalEnable = () => {
        dispatch({
            type: ActionType.SET_GLOBAL_ENABLED,
            payload: !globalState.enabled
        });
    };

    const handleAddProfile = () => {
        dispatch({
            type: ActionType.CREATE_NEW_PROFILE
        });
    };

    const handleSetProfile = (profileId: Number) => {
        dispatch({
            type: ActionType.SET_SELECTED_PROFILE,
            payload: profileId
        });
    };

    const handleProfileEnableChange = (profileId: Number) => {
        dispatch({
            type: ActionType.UPDATE_PROFILE_ENABLE,
            payload: profileId
        });
    };

    return (
        <nav className="relative w-full flex flex-wrap items-center justify-between py-3 bg-gray-100 text-gray-500 hover:text-gray-700 focus:text-gray-700 shadow-lg">
            <div className="container-fluid w-full flex flex-wrap items-center justify-between px-6">
                <div className="container-fluid">
                    <span className="self-center whitespace-nowrap text-xl text-black">Cyclops</span>
                </div>
                <ul className="navbar-nav flex pl-0 list-style-none mr-auto">
                    <li className="nav-item px-2">
                        <Button size="xs" onClick={handleGlobalEnable}>
                            {globalEnabled ? 'Stop' : 'Start'}
                        </Button>
                    </li>
                    <li className="nav-item px-2">
                        <Button size="xs" onClick={handleAddProfile}>
                            Add Profile
                        </Button>
                    </li>
                    {profiles?.length ? (
                        <li className="nav-item px-2">
                            <Dropdown label="Profiles" size="xs">
                                {profiles
                                    .sort((a, b) => {
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
                                    .map((profile, idx) => {
                                        return (
                                            <div className="flex flex-wrap items-center">
                                                <Checkbox
                                                    name="enabled"
                                                    id={`${idx}enabled`}
                                                    checked={profile.enabled}
                                                    onChange={() => handleProfileEnableChange(profile.id)}
                                                    disabled={!globalEnabled}
                                                />
                                                <Dropdown.Item key={idx} onClick={() => handleSetProfile(profile.id)}>
                                                    {profile.name}
                                                </Dropdown.Item>
                                            </div>
                                        );
                                    })}
                            </Dropdown>
                        </li>
                    ) : null}
                </ul>
            </div>
        </nav>
    );
}
