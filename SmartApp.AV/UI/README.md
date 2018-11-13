# UI

The UI module is in charge to show all the information that ELF want to show.

It can display several types of informations (see below) and provides mechanism to define a single action.

## Type of data
The UI can display only a limited set of data:

- Speech: that has to be analyzed and output by the interface
- Text: string that can be displayed

## Speech
The UI wait for the audio data from the TTS module and play it as soon as possible.

## Text
The text contained in the tuple is immediately displayed.

## Event
When the UI receives a tuple that match one of the supported types of data, it immediately display the data in a proper way.

### Action
An Action is defined by the presence of the ACTION_ID field inside the tuple received from the KB. The ACTION_ID field can be any kind of data.

All events that have the same ACTION_ID will be displayed at the same time.

Tuples should provide also the ACTION_COUNT field that specifies how many pieces the bundle is composed.
If ACTION_COUNT field is not defined, the UI starts a timer to collect the data. At the timeout, the collected data is displayed.

## Channels (TBD)
Channels provide a way to specify a "priority" for a certain event or action.