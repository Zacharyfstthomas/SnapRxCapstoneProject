# SnapRx: Applied Machine Learning for Prescription Medicine Identification
The SnapRx team will develop a computer vision classification model and corresponding mobile application that will allow users to scan images of prescription pills and generate a list of predicted prescription medications corresponding to the scanned pill. The app will then collect price data, active and inactive ingredients, and additional notable details from different manufacturers to be displayed to the user. The app will be developed for iOS and Android using React Native for the front-end and the Flask and Flask-RESTful Python frameworks for the server and API code, respectively.  The team will utilize the existing Google vision API in the development of a prescription medicine classifier. The classification model will be trained on a dataset consisting of prescription medications up to 2021, so the app will be compatible with medications produced prior to 2021. Computer vision has been capable of object detection but applications in image recognition for medications are limited. The SnapRx team hopes that this computer vision classification model and mobile app will provide substantial improvements in accuracy and efficiency over existing methods for identifying prescription medicines.


## Project organization
- <b>/api</b>: contains Flask REST API code and database scripts
- <b>/SnapRx</b>: contains React front-end code
- <b>/model</b>: contains Keras model for image classification


## External Requirements


### Setup to Run Android Application:

 This project requires Android Studio to run, which can be found at 
 https://developer.android.com/studio/. 

 Once installed, navigate to "More Actions" and select "SDK Manager"

 Under the "SDK Platforms" tab, select "Show Package Details" and select the following (if not already installed):

  - Under Android API 33
    - Android SDK Platform 33
    - Sources for Android 33
  - Under Android 12.0 (S)
    - Android SDK Platform 31
    - Intel x86 Atom_64 System Image
    - Google APIs Intel x86 Atom_64 System Image

  Under the "SDK Tools" tab, select "Show Package Details" and select the following (if not already installed):

  - Under "Android SDK Build-Tools 33"
    - 33.0.0
    - 31.0.0 (Neccessary)
  - Scroll to the bottom and select:
    - Android Emulator
    - Android SDK Platform-Tools

  Click Apply and OK to install
  
  Configure the ANDROID_SDK_ROOT enviroment Variable:
  
  Add the following lines to your $HOME/.bash_profile or $HOME/.bashrc (if you are using "zsh" then ~/.zprofile or ~/.zshrc) config file:
  ```
  export ANDROID_SDK_ROOT=$HOME/Library/Android/sdk
  export PATH=$PATH:$ANDROID_SDK_ROOT/emulator
  export PATH=$PATH:$ANDROID_SDK_ROOT/platform-tools
  ```
    Note: Replace $ANDROID_SDK_ROOT with the path to your Android sdk

  Once the above packages are installed and the config file is fixed, nagivate to "More Actions" and select "Virtual Device Manager"
  
  - Select "Create Device"
    - In "Phone" tab, select a "Pixel 5" or "Pixel XL" and click "next"
    - Select "S" under "Release Name" tab. Will have "API Level" of 31.
    - Click Finish
  

 This project also requires Node.js, which is found at https://nodejs.org/en/.


### Setup to Run IOS Application (only on MacOS):
 
 Download "Xcode" from the Mac App Store (Version 10 or newer)
 
 In Xcode Preferences:
  - select the most recent version of "Command Line Tools"
  
  Install Ios Simulator (While still in Xcode Preferences):
   - Select "Components" Tab
   - Select the simulator with the newest Ios version
 
 Install Cocoapods:
  
  For Intel Processor:
   ```
   sudo gem install cocoapods
   ```
  For M1 Processor:
  ```
  sudo arch -x86_64 gem install ffi
  ```
  ```
  arch -x86_64 pod install
  ```
  
  Then run in SnapRx directory:
  ```
  pod install
  ```

### For Setup Issues
 
 Refer to the following link, select "React Native CLI QuickStart" select your Operating System, and your Target OS.
 Follow the link below:
 https://reactnative.dev/docs/environment-setup

## Set up
### REST API server
**No longer necessary - server is hosted remotely at http://ec2-54-161-200-70.compute-1.amazonaws.com:8080**

Initialize MySQL database:
```bash
cd api
python dbinit.py [-dummydata]
python getdbdata.py -path ./pillboxdata.csv
```
Run api.py file:
```bash
python apis.py [-prod]
```

## API Documentation
After starting the server, the full swagger UI API documentation can be viewed at `localhost:5000/docs`

Production documentation viewable at: http://ec2-54-161-200-70.compute-1.amazonaws.com:8080/docs

## Running
### Application

1. Clone the localhost repository

2. cd into the SnapRx directory

3. run the following commands
 ```
 yarn install
 ```
 ```
 yarn add expo
 ```
 ```
 npm install
 ```
### To Run Ios (only on MacOS)
  ```
  npm run ios
  ```
or
  ```
  yarn start
  ```
  then press
  ```
  i
  ```

### To Run Android
You can start your virtual device first to speed up the process.
 - just navigate to "Virtual Device Manager" in android studio and press the "play" triange button on the device you created previously
 
  ```
  npm run android
  ```
or
  ```
  yarn start
  ```
  then press
  ```
  a
  ```

If program crashes on first start up for android or Ios, this is a timeout error and it is due to the simulator talking to long to start.
This is normal, when running the simulator for the first time on your machine.
All you need to do is run the application again with the same commands above.

## Testing
### Back-end tests
The Back-end unit and behavioral tests, containing the bulk of the logic for the application, are located at `api/apitest.py`.

To run API tests, run the following commands:
```bash
cd api
```
```bash
python -m unittest apitest.py
```

### Front-end tests
The unit tests are in '/test/unit'.

The behavioral test are in '/test/casper/'.

The front end unit tests are in the test folder in SnapRx 

To run the test, follow the steps:

  ```
  cd SnapRX
  ```

  ```
  npm install jest
  ```

  ```
  npx expo install jest-expo jest
  ```

  ```
  yarn add enzyme
  ```

  ```
  yarn add react-dom enzyme-adapter-react-16
  ```

  ```
  yarn add --dev react-test-renderer
  ```

  ```
  npm run test 
  ```

  or 

  ```
  yarn jest
  ```

## Authors 
Andrew Eldridge
Email: eldridgedev@gmail.com

Zachary St. Thomas
Email: zacharyfstthomas@gmail.com

Manish Chaudhary
Email:manishchaudhary408@gmail.com

Linh Nguyen
Email:linhhng211@gmail.com

## Styling guides
The code in this repository follows the Google JavaScript Style Guide (https://google.github.io/styleguide/jsguide.html) and PEP-8 style guide for Python (https://peps.python.org/pep-0008/).

