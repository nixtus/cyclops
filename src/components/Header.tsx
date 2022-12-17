import { Button, Dropdown } from 'flowbite-react';
import React from 'react';
import { Profile } from '../types';

interface Props {
    globalEnabled: boolean;
    updateGlobalEnabled: React.MouseEventHandler<HTMLButtonElement>;
    profiles: Profile[];
    addProfileClick: React.MouseEventHandler<HTMLButtonElement>;
    changeProfileClick: (id: number) => void;
}

export function Header({ globalEnabled, updateGlobalEnabled, profiles, addProfileClick, changeProfileClick }: Props) {
    return (
        <nav className="relative w-full flex flex-wrap items-center justify-between py-3 bg-gray-100 text-gray-500 hover:text-gray-700 focus:text-gray-700 shadow-lg">
            <div className="container-fluid w-full flex flex-wrap items-center justify-between px-6">
                <div className="container-fluid">
                    <span className="self-center whitespace-nowrap text-xl text-black">Cyclops</span>
                </div>
                <ul className="navbar-nav flex pl-0 list-style-none mr-auto">
                    <li className="nav-item px-2">
                        <Button size="xs" onClick={updateGlobalEnabled}>
                            {globalEnabled ? 'Stop' : 'Start'}
                        </Button>
                    </li>
                    <li className="nav-item px-2">
                        <Button size="xs" onClick={addProfileClick}>
                            Add Profile
                        </Button>
                    </li>
                    {profiles?.length ? (
                        <Dropdown label="Profiles">
                            {profiles.map((profile, idx) => {
                                return (
                                    <Dropdown.Item key={idx} onClick={() => changeProfileClick(profile.id)}>
                                        {profile.name}
                                    </Dropdown.Item>
                                );
                            })}
                        </Dropdown>
                    ) : null}
                </ul>
            </div>
        </nav>
    );
}
