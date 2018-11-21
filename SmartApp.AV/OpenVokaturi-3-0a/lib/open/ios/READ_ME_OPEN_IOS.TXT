## Contents

This directory contains at least:

- this file: READ_ME_OPEN_IOS.TXT

- OpenVokaturi object files for iOS (iPhone and iPad):

	- for ARMv6 processors (32-bit, from iPhone 3GS of 2009)
	- for ARMv7 processors (32-bit, from iPhone 3GS of 2009)
	- for ARMv7s processors (32-bit, from iPhone 5 of 2012)
	- for ARM64 processors (64-bit, from iPhone 5S of 2013)

- two OpenVokaturi object files for the iPhone/iPad simulator in Xcode:

	- an i686 object file for the iPhone 5 simulator
	- an x86_64 object file for the simulators of newer iPhones

- a combined archive of the above six object files: OpenVokaturi_iphone.a

The easiest way to work with the iOS edition is to include the header file (api/Vokaturi.h) as well as the static archive (lib/open/ios/OpenVokaturi-3-0-ios.a) in the Xcode project of your app. This will allow you to run your app in the iPhone/iPad simulator on your Mac, and it will put the right edition(s) of the OpenVokaturi library into your app when running on an iPhone or iPad.

See the Vokaturi developer site for an explanation of the API and example code.

## Which of the three iOS editions will be included in your app?

If you want your app to run on any iPhone or iPad from 2009 on, you specify "armv7 armv7s arm64" as the architectures of your target. In this case, all three objects will be included in your app.

If you specify "arm64 armv7" as the architectures of your target (at the time of writing, this is the default in Xcode), your app will also run on any iPhone or iPad from 2009 on, but only those two objects will be included in your app.

If you specify "arm64" as the only architecture of your target, your app will contain only the ARM64 edition of VokaturiPlus. This will make your app much smaller than if your include two or three objects, but your app will run only on iPhones or iPad that were built from 2013 on.
