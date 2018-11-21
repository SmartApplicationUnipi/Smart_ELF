# Emotional NLP group

The code contained in this folder addresses two main tasks.

Running the file enlp_app.py will start two sevices: text to emotion and emotion to text (described below).
Each service runs in its own thread.


## Text to Emotion
When the user talks with ELF he produces a sentence, often a query. The user sentence published on the KB awakes the module `EttService_c.py`  that in turn calls functions contained in `tte.py`. This module associates an emotion to the sentence and publishes in the KB a tuple made like this:

```
tuple = {
  "TIME_STAMP": int,
  "VALENCE": float,
  "AROUSAL": float,
  "TAG": "ENLP_USER_EMOTION"
}
```
The `TAG` field has to be used to query for this kind of information. Emotion is given following Russell's circumplex model of affect.

## Emotion to Text
When ELF reply to the user he has to do so in a human-like way. In order to accomplish this task the module `EttService_c.py` is awakened every time an answer that has to be provided to the user is published to the KB. The module calls in turn functions contained in `ett.py` in order to:
1. Assess ELF internal emotional state based on information taken from the KB
2. Elaborate a modified version of the default answer taken from the KB. This new version has some emotional content that follows ELF's internal emotional state.

The module publishes in the KB 2 different tuples.
1. The first one is made like this:
```
tuple1 = {
  "TIME_STAMP": int,
  "text" : colored_answer,
  "VALENCE" : float,
  "AROUSAL" : float,
  "TAG": "ENLP_EMOTIVE_ANSWER"
}
```
where `valence` and `arousal` coordinates identify the emotion with which the answer has to be given to the user and `text` provides the text of the answer augmented with emotional content.

2. The second one is made like this:
```
tuple2 = {
  "TIME_STAMP" : int,
  "VALENCE" : float,
  "AROUSAL" : float,
  "TAG": "ENLP_ELF_EMOTION"
}
```
where `valence` and `arousal` coordinates identify the ELF's internal emotional state.

## Tags of other modules
1. We use `"text_f_audio"` as the tag to identify the user sentence transcript tuple and the field `"text"` to retrieve the actual transcript.

1. We use `"NLP_Answer"` as the tag to identify the tuple containing the text of the reply to be given to the user. The text is directly contained in the value of the tag field.

## TODO
 - Switch to multiprocess library due to python GIL. 
