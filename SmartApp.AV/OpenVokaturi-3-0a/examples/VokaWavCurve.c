/*
	VokaWavCurve.c
	public-domain sample code by Vokaturi, 2018-01-13

	A program that calls the Vokaturi API
	to report the development of the emotion probabilities
    in a prerecorded WAV file.
*/

#include <math.h>
#include "VokaWav.h"

int main (int argc, const char * argv[]) {
	if (argc < 2) {
		Vokaturi_versionAndLicense ();
		printf ("Usage: %s [soundfilename.wav ...]\n", argv [0]);
		exit (1);
	}
	for (int ifile = 1; ifile < argc; ifile ++) {
		const char *fileName = argv [ifile];

		VokaWav wavFile;
		VokaWav_open (fileName, & wavFile);
		if (! VokaWav_valid (& wavFile)) {
			fprintf (stderr, "Error: WAV file not analyzed.\n");
			exit (1);
		}

		const double timeStep = 1.0;
		const double bufferSafetyTime = 10.0;   // one second is more than enough
		const double bufferDuration = timeStep + bufferSafetyTime;
		const int bufferLength = wavFile.samplingFrequency * bufferDuration;

		VokaturiVoice voice = VokaturiVoice_create (
			wavFile.samplingFrequency,
			bufferLength
		);
		printf ("File\tStart(s)\tEnd(s)\tNeutrality\tHappiness\tSadness\tAnger\tFear\n");
		const double duration = wavFile.numberOfSamples / wavFile.samplingFrequency;
		const int numberOfSteps = duration / timeStep;   // round down
		for (int istep = 0; istep < numberOfSteps; istep ++) {
			const double startingTime = istep * timeStep;
			const double endTime = (istep + 1) * timeStep;
			int startingSample = startingTime * wavFile.samplingFrequency;
			int endSample = endTime * wavFile.samplingFrequency;
			if (endSample > wavFile.numberOfSamples)
				endSample = wavFile.numberOfSamples;
			VokaWav_fillVoice (& wavFile, voice,
				0,   // the only or left channel
				startingSample,
				endSample - startingSample   // number of samples
			);
			VokaturiQuality quality;
			VokaturiEmotionProbabilities emotionProbabilities;
			VokaturiVoice_extract (voice, & quality, & emotionProbabilities);

			if (quality.valid) {
				printf ("%s\t%.3f\t%.3f\t%.6f\t%.6f\t%.6f\t%.6f\t%.6f\n",
					fileName,
					startingTime, endTime,
					emotionProbabilities.neutrality,
					emotionProbabilities.happiness,
					emotionProbabilities.sadness,
					emotionProbabilities.anger,
					emotionProbabilities.fear);
			} else {
				//printf ("%.3f %.3f no valid emotions\n", startingTime, endTime);
			}
		}
		VokaturiVoice_destroy (voice);
		VokaWav_clear (& wavFile);
	}
}
