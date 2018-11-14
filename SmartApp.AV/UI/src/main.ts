import * as ElfUI from './ui/ElfUI';
import * as ElfColorfulUI from './ui/colorful/ElfColorfulUI';
import * as KBEventReader from './kb/KBEventReader';
import * as TTSEventReader from './tts/TTSEventReader';

let elem = document.getElementById("content");

let factory = new ElfColorfulUI.ElfColorfulUIFactory(elem, window);

let kbEventReader = new KBEventReader.KBEventReader();
let readers = [
	// new Test.TestEventReader(1000),
	// new KBEventReader.KBEventReader(),
	kbEventReader,
	new TTSEventReader.TTSEventReader()
];

let ui = new ElfUI.Builder(factory)
	.setEventReaders(readers)
	.build();

readers.forEach(reader => {
	reader.start();
});