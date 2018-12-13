# AUDIO VISUAL FEEDBACK group (AV)

Four main tasks are handled in this folder: Speech to text (STT), Speech to emotion (STE), Text to speech with emotion(TTS), Visual feedback.


## Speech to Text
The STT and STE services are in the same submodule and are obtained by running, without specific parameters, the file ``asyncSTT.py``.

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

## Text to Speech with emotion

The TTS service is obtained by running, without specific parameters, the file ``asyncTTS.py``. 

First the service make a subscription on the KB in order to wait the tuple from the ENLP group.
Once the tuple is recived the service will make a request to the MarryTTS service with the text expandend by the emotion in Roussel Model framework (Valency and Arousal), that will give to the answer a greater humanity.



## INSTALL
install merryTTS following the guideline here: [marytts/README.md](https://github.com/marytts/marytts/blob/981a536f64e39c1572d7976bf8a8d123724969ce/README.md)
Other python libraries with the command:

`pip install -r requirements.txt`

## RUN
To run all the components of the modules simply execute, after installing prerequisites, the command

`./gradlew run` for Linux (or `gradlew.bat run` in windows) inside the marrytts folder
`python asyncSTT.py`
`python asyncTTS.py`

## Visual Feedback
All the information are provided into [UI/README.md](https://github.com/SmartApplicationUnipi/Smart_ELF/blob/master/SmartApp.AV/UI/README.md)
