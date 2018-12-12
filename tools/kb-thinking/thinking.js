const KBClient = require("../kb-analytics/src/KBClient.js");

(async () => {
  const kb = await KBClient.connect(
    "ws://localhost:5666",
    "smartapp1819"
  );
  const id = await kb.register();
  await kb.registerTags({
    idSource: id,
    tagsList: { ELF_UI_BEHAVIOUR: { desc: "", doc: "" } }
  });
  await kb.subscribe(id, { _meta: { tag: "USER_ENGAGED" } }, (err, data) => {
    console.log("USER_ENGAGED received:");
    const value = data[0].object._data.value;
    kb.addFact({
      idSource: id,
      tag: "ELF_UI_BEHAVIOUR",
      TTL: 1,
      reliability: 100,
      jsonFact: {
        thinking: value
      }
    }).then(
      () => console.log("Thinking:", value),
      e => console.error("Error adding fact to KB:", e.stack)
    );
  });
})();
setInterval(() => {}, 100000);
