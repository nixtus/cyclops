# Cyclops

Cyclops is a simple, straightforward and 100% FOSS Chrome extension for adding HTTP request headers

### Why??

You may be thinking that doesn't something like this already exist and the answer is YES it does. There are many extensions out there and I have used most of them, but what ends up happening is they become popular and the authors/companies behind them try to monetize their creations. They put in paywalls limiting functionality and making you pay to get that functionality back. So, if you don't like that, try out Cyclops.

## Installation

Currently, this extension isn't published to the chrome web store, so you must build it manually using the steps below

### Prerequisites:

-   NodeJS

### Build and Install

1. Clone the repository `git clone https://github.com/nixtus/cyclops.git`
2. `cd cyclops`
3. Install deps `npm i`
4. Build `npm run build`
5. In your chrome or brave browser navigate to `{chrome/brave}://extensions`
6. Ensure you have `Developer Mode` enabled
7. Click `Load unpacked`
8. Select the `build` folder that was produced in step `4`
9. Now, if you click the extensions button, you should see the `Cyclops` extension displayed

## Development

-   Install deps `npm install`
-   Start watch mode `npm run watch`
-   Go into chrome/brave `brave://extensions`
-   Click `Load Unpacked`
-   Select the `build` directory that was produced from the watch command
-   The extension will now be accessible in the menu bar
