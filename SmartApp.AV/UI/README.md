# UI

The UI module is in charge to show all the information that ELF want to show, emotions included.

It can display several types of informations (see below) and provides mechanism to define a single action.

It is connected to the TTS module to receive the audio data to play and with the KB in order to display different kind of informations.

## Content

The UI can handle the following kind of contents:

- Audio

## Audio

An Audio content represent something that the UI should play using an audio output.
It may carries also a description of the audio which will be displayed in sync with the audio and an emotion.

The JSON format must be:

```json

    {
        "audio": BinaryData
        "text": String,
        "emotion": Pair<Int, Int>
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