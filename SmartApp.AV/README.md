# AUDIO VISUAL FEEDBACK group (AV)

Three main tasks are handled in this folder Speech to text (STT), Speech to emotion (STE), Text (and emotion) to speech(TTS), Visual feedback.


## Speech to Text (TTE)
The STT and STE are in the same submodule and running the file asyncSTT.py with no parameters the service will start.

Once the service is running it works in this way:

When we receive a Audio sample from the HAL group the start 4 asynchronous process at the same time:
* Google Cloud Speech Recognition 
* Google Speech Recognition
* CMU Sphinx
* PyAudioAnalysis

We always collect the result from PyAudioAnalysis since is offline and fast, then we also collect the audio transcription in this order: Google Cloud Speech Recognition ->  Google Speech Recognition ->  CMU Sphinx that are in order of accuracy and throughput. 
After we get the result we write a tuple on the KB with the transcription and the emotion found with the following format:

```
tuple = {
  "tag": 'AV_IN_TRANSC_EMOTION',
  "timestamp": int,
  "ID": int,
  "text": string,
  "language": string,
  "valence": float,
  "arousal": float
}
```

## Text (and emotion) to Speech (TTS)

The TTS and TTE are in the same submodule and running the file asyncTTS.py with no parameters the service will start.

First the service make a subscription on the KB in order to wait the tuple from the ENLP group to process.
One the tuple is revived the service will make a request to the MarryTTS service with the text to process with in addition the emotion in Roussel Model framework (Valency and Arousal) that will give to the answer an humans emotion



## INSTALL
install merryTTS following the guideline here: marytts/README.md
`pip install -r requirements.txt`

## RUN
To run all the components of the modules simply execute, after installing prerequisites, the command

`./gradlew run` for Linux (or `gradlew.bat run` in windows) inside the marrytts folder
`python asyncSTT.py`
`python asyncTTS.py`
