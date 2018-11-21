# UI

The UI module is in charge to show all the information that ELF want to show, emotions included.

It can display several types of informations (see below) and provides mechanism to define a single action.

It is connected to the TTS module to receive the audio data to play and with the KB in order to display different kind of informations.

## Content

The UI can handle the following kind of contents:

- Speech
- Audio
- Position

## Speech

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

## Audio

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

- Support for actions
- Support for channels
- Design an awesome UI