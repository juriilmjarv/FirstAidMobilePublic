# FirstAidMobilePublic
React Native mobile app

First aid system lets the administrators to register new emergencies which will send the notifications to the cloesest available first aiders mobile application.

See user manual provided for full overview.

This is one of the two developed apps. To test the full system download the web app source code from here: https://github.com/juriilmjarv/FirstAidWebPublic/tree/master/FirstAidWeb

To test this project download the Expo Client app from the App Store or Play Store.

## Installing node modules

In the project directory run:

### `npm install`

## Running the app

To run the project:

### `npm start`

Scan the QR code and the project will open within you Expo Client app.

## API keys and config files

Insert your Firebase credentials into: '/FirstAidWebPublic/src/screens/config.js'.

Make sure you have Realtime Database enabled and your project is on 'pay as you go' (Blaze plan).

Create Google API key containing Directions API. Insert the key into '/FirstAidMobilePublic/src/screens/NewTask.js' on line 77. Insert the same key into '/FirstAidMobilePublic/src/screens/NewTask.js' on line 210.

Using Google Cloud, create unique iOS and Android OAUTH 2.0 Client IDs. Insert them into /FirstAidMobilePublic/src/screens/LoginScreen.js on lines 69 and 71.
