This directory contains example Python scripts and C programs to measure the average emotion probabilities in an existing WAV file.

The Python script can be called like this:

   python3 OpenVokaWavMean-mac64.py path_to_sound_file.wav

The directory also contains the sound file hello.wav.
For this sound file, the result of the above commands with OpenVokaturi should be:

	Neutral: 0.760
	Happy: 0.000
	Sad: 0.238
	Angry: 0.001
	Fear: 0.000

A stand-alone C console program that measures the same as above can be created on the Mac with

cc -arch x86_64 -std=gnu99 -O3 -isysroot /Applications/Xcode.app/Contents/Developer/Platforms/MacOSX.platform/Developer/SDKs/MacOSX.sdk -mmacosx-version-min=10.5 VokaWavMean.c ../lib/open/macos/OpenVokaturi-3-0-mac64.o -o ../bin/OpenVokaWavMean-3-0-mac64

After this, you can run the resulting program on the example sound like this:

   ../bin/OpenVokaWavMean-3-0-mac64 hello.wav

and the result should be

   Neutrality 0.760
   Happiness 0.000
   Sadness 0.238
   Anger 0.001
   Fear 0.000

which is the same as with the Python script.

The text of the example scripts and example programs is in the public domain. You can freely use this code to create your own scripts and programs that call or link with the OpenVokaturi libraries, which themselves are distributed under the General Public License.