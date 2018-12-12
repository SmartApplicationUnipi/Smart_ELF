# UI

The UI module is in charge to show all the information that ELF want to show, emotions included.

It can display several types of informations (see below) and provides mechanism to define a single action.

It is connected to the TTS module to receive the audio data to play and with the KB in order to display different kind of informations. If the connection goes down, the system will  try to reconnect after a certain amount of time (default: 10s).

The interaction is event-based: the UI receives an event and reacts to it.

## KB Interaction

The UI is subscribed to the KB for the following tuples:

- { "TAG": "UI_ELF_EMOTION", "valence": "\$v", "arousal": "\$a" }: This tuple can be used to trigger an emotion change of the face.
- { "TAG": "VISION_FACE_ANALYSIS", "is_interlocutor": "True", "look_at": { "pinch": "\$a", "yaw": "\$b" } }: This tuple can be used to let the face pointing the user
- { "TAG": "ENLP_ELF_EMOTION", "valence": "\$v", "arousal": "\$a" }: This tuple is used to get the internal emotion of ELF. It is similar to UI_ELF_EMOTION but is triggered only by the ENLP group.

Other modules can request a specific emotion, represented by the pair <valence, arousal> with adding a tuple in the KB of the form {"TAG": "UI_ELF_EMOTION", "valence", "\$v", "arousal": "\$a"}.

## Behaviors

There are defined some custom behaviors that allow ELF to modify not ontly the expression of the UI but also other properties:

- Defensive: This property indicates how much the UI should show a defensive behavior to the user. It's value is in the range [0-1]. Currently is defined by the KB rule { "TAG": "UI_ELF_BEHAVIOR", 'defensive': '\$x' } <- { 'z_index': '\$x' } that simply use the distance of the user form ELF.

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

## Configuration

In order to run properly, the system needs a configuration JSON file named "elfconfig.json" in the main folder. This will be packed into the final bundle by Webpack.

This file contains a JSON object with:

- KB_URL: The address of the KB module
- TTS_URL: The address of the TTS module

## TODO

- Support for actions
- Support for channels
- Design an awesome UI
- Improve the expression engine
- Change the expression implementation to support auto-generation of expressions from the KB