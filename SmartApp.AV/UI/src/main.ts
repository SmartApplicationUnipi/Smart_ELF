import { Builder } from './ui/ElfUI';
import { ElfColorfulUIFactory } from './ui/colorful/ElfColorfulUI';
import { KBEventReader } from './kb/KBEventReader';
import { TTSEventReader } from './tts/TTSEventReader';

import { TestEventReader } from './test/Test'
import * as Logger from './log/Logger';

// Load config files
const config = require('./elfconfig.json');
let kbUrl = config['KB_URL'], tts_url = config['TTS_URL'];

if (kbUrl && tts_url) {
	let elem = document.getElementById("content");

	Logger.getInstance().enable(true);

	let factory = new ElfColorfulUIFactory(elem, window);

	let kbEventReader = new KBEventReader(kbUrl);
	let readers = [
		// new TestEventReader(2000),
		kbEventReader,
		//new TTSEventReader(tts_url)
	];

	let ui = new Builder(factory)
		.setEventReaders(readers)
		.build();

	readers.forEach(reader => {
		reader.start();
	});
} else {
	console.error("Invalid config file.", config);
}