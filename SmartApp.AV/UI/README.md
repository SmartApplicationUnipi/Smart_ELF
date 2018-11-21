# UI

The UI module is in charge to show all the information that ELF want to show, emotions included.

It can display several types of informations (see below) and provides mechanism to define a single action.

It is connected to the TTS module to receive the audio data to play and with the KB in order to display different kind of informations.

The interaction is event-based: the UI receives an event and react to it.

## Event

An Event represent something interesting that is happened.
It may contains:

- Emotion
- Content
- Position

## Emotion

This is the way that ELF can express emotions. An emotion is defined by Valence and Arousal following the Circumplex Model of Emotions:

![Circumplex Model of Emotions](https://www.researchgate.net/profile/Nelson_Zagalo/publication/221594596/figure/fig1/AS:305496490823684@1449847447790/Circumplex-Model-of-Emotions-15-This-model-contains-already-all-the-emotions-from-our.png)

## Content

The contents that the UI can handle are:

- Speech
- Audio

### Speech

A Speech content represents something that the UI should play and (optionally) show to let ELF talking.
It contains a Base64 representation of the audio to play, the text and the emotion associated.

The JSON format must be:

```json

    {
        "audio": Base64Data,
        "text": String,
        "emotion": {
            "arousal": Int,
            "valence": Int
        }
    }

```

NOTE: this kind of content is received from the TTS module. Other modules should use a different kind of content.

### Audio

An Audio content represents something that the UI should play.
Please, note that this content is used to play generic audio, and is not suitable for speech.

The JSON format must be:

```json

    {
        "audio": Base64Data
    }

```

## Position

A Position content tells the UI the relative position of the user.
This content is used for example, to let the UI follow the user while interacting with him.

The coordinates should be in the range [0-1] and position is relative to ELF, for example:

- (0, 0.42) means that the users is in front of ELF
- (0.37, 0.42) means that the user is on the right side of ELF
- (-0.37, 0.42) means that the user is on the left side of ELF

The JSON format must be:

```json

    {
        "x": Int,
        "y": Int
    }

```

### Action

An Action is defined by the presence of the ACTION_ID field inside the tuple received from the KB. The ACTION_ID field can be any kind of data.

All events that have the same ACTION_ID will be displayed at the same time.

Tuples should provide also the ACTION_COUNT field that specifies how many pieces the bundle is composed.
If ACTION_COUNT field is not defined, the UI starts a timer to collect the data. At the timeout, the collected data are displayed.

## Channels

Channels provide a way to specify a "priority" for a certain event or action.

## Other features

- Support for error reporting and logs

## TODO

- Support for position
- Support for actions
- Support for channels
- Design an awesome UI