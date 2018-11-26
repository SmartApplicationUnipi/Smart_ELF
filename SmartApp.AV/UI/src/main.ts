import { Builder } from './ui/ElfUI';
import { ElfColorfulUI, ElfColorfulUIFactory } from './ui/colorful/ElfColorfulUI';
import { KBEventReader } from './kb/KBEventReader';
import { TTSEventReader } from './tts/TTSEventReader';

// import { TestElfColorfulUIFactory } from './test/testcolorful/TestElfColorfulUI';
import { TestEventReader } from './test/Test'

let elem = document.getElementById("content");

let factory = new ElfColorfulUIFactory(elem, window);

let kbEventReader = new KBEventReader();
let readers = [
	// new TestEventReader(2000),
	// kbEventReader,
	// new TTSEventReader()
];

let ui = new Builder(factory)
	.setEventReaders(readers)
	.build();

readers.forEach(reader => {
	reader.start();
});