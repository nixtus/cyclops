import { Button, Checkbox, Dropdown, Navbar } from 'flowbite-react';
import React, { useContext } from 'react';
import { GlobalContext } from '../context/Global';
import { ActionType } from '../context/Global/actions';

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

    const duplicateProfileClick = () => {
        dispatch({
            type: ActionType.DUPLICATE_CURRENT_PROFILE
        });
    };

    const deleteProfileClick = () => {
        dispatch({
            type: ActionType.DELETE_CURRENT_PROFILE
        });
    };
    return (
        <nav className="relative w-full flex flex-wrap items-center justify-between py-3 bg-gray-100 text-gray-500 hover:text-gray-700 focus:text-gray-700 shadow-lg">
            <div className="container-fluid w-full flex flex-wrap items-center justify-between px-6">
                <div className="container-fluid">
                    <Navbar.Brand>
                        <img src="logo192.png" className="mr-3 h-6 sm:h-9" alt="Cyclops Logo" />
                        <span className="self-center whitespace-nowrap text-xl text-black">Cyclops</span>
                    </Navbar.Brand>
                </div>
                <ul className="navbar-nav flex pl-0 list-style-none mr-auto">
                    <li className="nav-item px-2">
                        <Button size="xs" onClick={handleGlobalEnable}>
                            {globalEnabled ? 'Stop' : 'Start'}
                        </Button>
                    </li>
                    <li className="nav-item px-2">
                        <Button.Group>
                            <Button
                                size="xs"
                                disabled={!globalEnabled}
                                gradientMonochrome="info"
                                onClick={handleAddProfile}
                            >
                                Add Profile
                            </Button>
                            <Button
                                size="xs"
                                onClick={duplicateProfileClick}
                                disabled={!globalEnabled}
                                gradientMonochrome="info"
                            >
                                Duplicate Profile
                            </Button>
                            <Button
                                size="xs"
                                onClick={deleteProfileClick}
                                disabled={!globalEnabled}
                                gradientMonochrome="info"
                            >
                                Delete Profile
                            </Button>
                        </Button.Group>
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
