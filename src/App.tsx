import React, { useState } from 'react';
import './App.css';

interface ProfileRequestHeader {
    name: string;
    value: string;
    enabled: boolean;
}
interface Profile {
    name: string;
    requestHeaders: ProfileRequestHeader[];
}

// chrome.webRequest.onBeforeRequest.addListener(
//     (details) => {
//         console.log('HELLO', details);
//     },
//     { urls: ['*://www.google.com'] }
// );

function App() {
    const [globalEnabled, setGlobalEnabled] = useState<boolean>(true);
    const [profiles, setProfiles] = useState<Profile[]>();
    const [selectedProfile, setSelectedProfile] = useState<Profile>();

    const globalEnableClick = () => {
        setGlobalEnabled(!globalEnabled);
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
            <div className="flex justify-center">
                <ul className="bg-white rounded-lg border border-gray-200 w-full text-gray-900">
                    <li className="px-6 py-2 border-b border-gray-200 rounded-t-lg bg-blue-600 text-white">
                        An active item
                    </li>
                    <li className="px-6 py-2 border-b border-gray-200">A second item</li>
                    <li className="px-6 py-2 border-b border-gray-200">A third item</li>
                    <li className="px-6 py-2 border-b border-gray-200">A fourth item</li>
                    <li className="px-6 py-2 rounded-b-lg">And a fifth one</li>
                </ul>
            </div>
        </div>
    );
}

export default App;
