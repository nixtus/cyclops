import { Textarea, Button, Checkbox, Dropdown, Navbar, Modal, Alert } from 'flowbite-react';
import React, { useContext, useState } from 'react';
import { GlobalContext } from '../context/Global';
import { ActionType } from '../context/Global/actions';
import { parseImportSettings } from '../utils';

export function Header() {
    const { state: globalState, dispatch } = useContext(GlobalContext);
    const { enabled: globalEnabled, profiles } = globalState || {};
    const [showModal, setShowModal] = useState(false);
    const [profileData, setProfileData] = useState<any>();
    const [showError, setShowError] = useState(false);

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

    const exportProfiles = () => {
        const profilesBlob = new Blob([JSON.stringify(globalState.profiles)], { type: 'application/json' });
        const url = URL.createObjectURL(profilesBlob);

        chrome.downloads.download({
            url,
            saveAs: true
        });
    };

    const importProfiles = () => {
        try {
            const data = JSON.parse(profileData);
            const result = parseImportSettings(data);

            if (result.success) {
                const updatedProfiles = [];

                for (const currentProfile of profiles) {
                    const found = result.data.find((x) => x.id === currentProfile.id);

                    if (found) {
                        updatedProfiles.push({
                            ...currentProfile,
                            ...found,
                            currentlySelected: false
                        });
                    } else {
                        updatedProfiles.push({ ...currentProfile, currentlySelected: false });
                    }
                }

                for (const importProfile of result.data) {
                    const found = updatedProfiles.find((x) => x.id === importProfile.id);
                    if (!found) {
                        updatedProfiles.push({ ...importProfile, currentlySelected: false });
                    }
                }
                updatedProfiles[0].currentlySelected = true;

                dispatch({
                    type: ActionType.SET_PROFILES,
                    payload: updatedProfiles
                });

                setShowError(false);
                setShowModal(false);
            } else {
                setShowError(true);
            }
        } catch (error) {
            setShowError(true);
        }
    };

    const toggleModal = () => {
        setShowModal(!showModal);
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
                            {profiles?.length ? (
                                <Dropdown label="Profiles" size="xs" gradientMonochrome="info">
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
                                                <div key={idx} className="flex flex-wrap items-center">
                                                    <Checkbox
                                                        name="enabled"
                                                        id={`${idx}enabled`}
                                                        checked={profile.enabled}
                                                        onChange={() => handleProfileEnableChange(profile.id)}
                                                        disabled={!globalEnabled}
                                                    />
                                                    <Dropdown.Item onClick={() => handleSetProfile(profile.id)}>
                                                        {profile.name}
                                                    </Dropdown.Item>
                                                </div>
                                            );
                                        })}
                                </Dropdown>
                            ) : null}
                            <Button
                                size="xs"
                                disabled={!globalEnabled}
                                gradientMonochrome="info"
                                onClick={handleAddProfile}
                            >
                                Add
                            </Button>
                            <Button
                                size="xs"
                                onClick={duplicateProfileClick}
                                disabled={!globalEnabled}
                                gradientMonochrome="info"
                            >
                                Duplicate
                            </Button>
                            <Button
                                size="xs"
                                onClick={deleteProfileClick}
                                disabled={!globalEnabled}
                                gradientMonochrome="info"
                            >
                                Delete
                            </Button>
                        </Button.Group>
                    </li>
                    <li className="nav-item px-2">
                        <Button.Group>
                            <Button
                                size="xs"
                                onClick={exportProfiles}
                                disabled={!globalEnabled}
                                gradientMonochrome="info"
                            >
                                Export
                            </Button>
                            <Button size="xs" onClick={toggleModal} disabled={!globalEnabled} gradientMonochrome="info">
                                Import
                            </Button>
                        </Button.Group>
                    </li>
                </ul>
                <Modal show={showModal} onClose={toggleModal}>
                    <Modal.Header>Import Profiles</Modal.Header>
                    {showError ? (
                        <Alert color="failure" onDismiss={() => setShowError(false)}>
                            <span>
                                <span className="font-medium">Invalid Input</span>
                                The profile information you entered is not in the correct format
                            </span>
                        </Alert>
                    ) : null}
                    <Modal.Body>
                        <div className="space-y-6">
                            <Textarea
                                value={profileData}
                                onChange={(e) => setProfileData(e.target.value as any)}
                                id="profiles"
                                placeholder="Paste in profiles json..."
                                required={true}
                                rows={6}
                            />
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={importProfiles}>Import</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </nav>
    );
}
