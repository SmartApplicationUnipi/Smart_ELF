## Contents

### The directory "lib/open/macos" contains:

- OpenVokaturi statically linkable object files for macOS (.o),
  for 32-bit i686 processors (-mac32.o) and 64-bit x86_64 processors (-mac64.o)
- OpenVokaturi shareable object libraries for macOS (.dylib),
  for 32-bit i686 processors (-mac32.dylib) and 64-bit x86_64 processors (-mac64.dylib)

- a universal archive with both .o-files (-mac.a)
- a universal archive with both .dylib-files (-mac.dylib)

## Use

The easiest way to work with OpenVokaturi in a Mac app is to include the header file (api/Vokaturi.h) as well as the static archive (lib/open/macos/OpenVokaturi-3-0-mac.a) in the Xcode project of your app.

The easiest way to work with OpenVokaturi with Python on Linux is to import the module api/Vokaturi.py in your Python script, as in the example script in the examples folder. After this you should dynamically load the shareable object library, as in the example script; adapt the path to the library file if necessary.

## More information

To see how to use the OpenVokaturi libraries, consult the Vokaturi developer site (https://developers.vokaturi.com).
