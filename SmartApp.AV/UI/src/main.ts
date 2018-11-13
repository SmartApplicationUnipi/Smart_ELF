import * as ElfUI from './ui/ElfUI';
import * as ElfColorfulUI from './ui/colorful/ElfColorfulUI';
import * as Message from './kb/Message';
import * as KBEventReader from './kb/KBEventReader';
import * as TTSEventReader from './audio/TTSEventReader';
import * as Test from './test/Test';

const DEBUG = true;

let elem = document.getElementById("content");

let factory = new ElfColorfulUI.ElfColorfulUIFactory(elem);

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

if (DEBUG) {
	// DEBUG: Add some facts..
	let builder = new Message.MessageBuilder()
		.setMethod(KBEventReader.KB_OP.ADD_FACT)
		.addParam(KBEventReader.PARAMS.INFO_SUM, 'rdf')
		.addParam(KBEventReader.PARAMS.TTL, 3)
		.addParam(KBEventReader.PARAMS.RELIABILITY, 90)
		.addParam(KBEventReader.PARAMS.REVISIONING, false);

	let m1 = builder.addParam(KBEventReader.PARAMS.JSON_FACT, { relation: 'teaches', subject: 'Gervasi', object: 'SmartApplication' }).build();
	let m2 = builder.addParam(KBEventReader.PARAMS.JSON_FACT, { relation: 'teaches', subject: 'Gervasi', object: 'SAM' }).build();
	let m3 = builder.addParam(KBEventReader.PARAMS.JSON_FACT, { relation: 'teaches', subject: 'Bruni', object: 'PSC' }).build();

	console.log(m1);

	kbEventReader.addFactKB(m1);
	kbEventReader.addFactKB(m2);
	kbEventReader.addFactKB(m3);
}