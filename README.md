# CloudAtCostApp
An unofficial app to manage your CloudAtCost Account. CloudAtCostApp is built using the [CloudAtCost API](https://github.com/cloudatcost/api) and [Ionic](http://ionicframework.com/).
Ionic is a front-end SDK based on Cordova/PhoneGap for developing hybrid mobile apps with HTML 5. You can download the App from Google's Play Store or Apple's App Store:

[![Download on the App Store](https://devimages.apple.com.edgekey.net/app-store/marketing/guidelines/images/badge-download-on-the-app-store.svg)](https://itunes.apple.com/en/app/cloudatcost/id975360892)[![Get it on Google Play](https://developer.android.com/images/brand/en_generic_rgb_wo_45.png)](https://play.google.com/store/apps/details?id=com.cloudatcostapp.app)

If you have any suggestions or want to get in touch with us, you can chat with us on Gitter or tweet us at [@CloudAtCostApp](https://twitter.com/cloudatcostapp).

[![Join the chat at https://gitter.im/AndreasGassmann/cloudatcostapp](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/AndreasGassmann/cloudatcostapp?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

### How to run the app

To get started, check out [Getting Started with Ionic](http://ionicframework.com/getting-started/). Here is a quick overview:

First, clone this git repository and change 
````shell
$ git clone https://github.com/AndreasGassmann/cloudatcostapp.git cloudatcostapp
````
Then download all dependencies using npm and bower
````shell
$ npm install -g cordova ionic ios-sim
$ npm install
$ bower install
````
Now you can preview the app in your browser. Using the --lab flag, you will see the iOS and android version side by side
````
$ ionic serve --lab
````
Now specify the platform to run your project on. Note: To run on iOS, you need a Mac.
````shell
$ ionic platform add ios
$ ionic platform add android
````
Now you can run the app in your emulator
````shell
$ ionic emulate ios
$ ionic emulate android
````

### Changelog

#### 1.2.0
Features:
- Loading indicators when creating a new server
- Copy server fields by tapping and holding them

Fixes:
- Templates are displayed correctly
- Special characters in email addresses should now work

Changes:
- Updated dependencies

#### 1.1.0
Features:
- Support for CloudPRO resources
 - View available resources and build or delete new servers right from within the app
- Change runmode of a server
- Search for a server

Changes:
- Added icons for docker and FreeBSD templates
- Improved the design of the pie-charts

Fixes:
- The charts on the dashboard were sometimes not displayed properly
- Performance improvements

#### 1.0.2
Rename Servers
Modify reverse DNS

#### 1.0.1
Added QR-Scanner

#### 1.0.0
Initial release