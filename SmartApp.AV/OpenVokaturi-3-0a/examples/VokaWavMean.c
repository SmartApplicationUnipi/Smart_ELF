/*
	VokaWavMean.c
	public-domain sample code by Vokaturi, 2018-01-13

	A program that calls the Vokaturi API
	to report the average emotion probabilities
    in a prerecorded WAV file.
*/

#include <math.h>
#include "VokaWav.h"

int main (int argc, const char * argv[]) {
	if (argc < 2) {
		printf ("**********\nWAV files analyzed with:\n%s\n**********\n",
			Vokaturi_versionAndLicense ());
		printf ("Usage: %s [soundfilename.wav ...]\n", argv [0]);
		exit (1);
	}
	for (int ifile = 1; ifile < argc; ifile ++) {
		const char *fileName = argv [ifile];

		printf ("\nEmotion analysis of WAV file %s:\n", fileName);
		VokaWav wavFile;
		VokaWav_open (fileName, & wavFile);
		if (! VokaWav_valid (& wavFile)) {
			fprintf (stderr, "Error: WAV file not analyzed.\n");
			exit (1);
		}

		VokaturiVoice voice = VokaturiVoice_create (
			wavFile.samplingFrequency,
			wavFile.numberOfSamples
		);

		VokaWav_fillVoice (& wavFile, voice,
			0,   // the only or left channel
			0,   // starting from the first sample
			wavFile.numberOfSamples   // all samples
		);

		VokaturiQuality quality;
		VokaturiEmotionProbabilities emotionProbabilities;
		VokaturiVoice_extract (voice, & quality, & emotionProbabilities);

		if (quality.valid) {
			printf ("Neutrality %f\n", emotionProbabilities.neutrality);
			printf ("Happiness %f\n", emotionProbabilities.happiness);
			printf ("Sadness %f\n", emotionProbabilities.sadness);
			printf ("Anger %f\n", emotionProbabilities.anger);
			printf ("Fear %f\n", emotionProbabilities.fear);
		} else {
			printf ("Not enough sonorancy to determine emotions\n");
		}

		VokaturiVoice_destroy (voice);
		VokaWav_clear (& wavFile);
	}
}
