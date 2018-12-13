const KBClient = require("../kb-analytics/src/KBClient.js");

(async () => {
  const kb = await KBClient.connect(
    "ws://localhost:5666",
    "smartapp1819"
  );
  const id = await kb.register();

  await kb.registerTags({
    idSource: id,
    tagsList: { UI_ELF_BEHAVIOR: { desc: "", doc: "" } }
  });

  await kb.subscribe(id, { _meta: { tag: "USER_ENGAGED" } }, (err, data) => {
    if (data === undefined) {
      console.log("USER_ENGAGED undefined, err: ", err);
      return;
    }
    console.log("USER_ENGAGED received: ", data);
    if (data[0].object._data.value) {
      kb.addFact({
        idSource: id,
        tag: "UI_ELF_BEHAVIOR",
        TTL: 1,
        reliability: 100,
        jsonFact: {
          thinking: true
        }
      }).then(
        () => console.log("Thinking:", value),
        e => console.error("Error adding fact to KB:", e.stack)
      );
    }
  });

  await kb.subscribe(
    id,
    { _meta: { tag: "ENLP_EMOTIVE_ANSWER" } },
    (err, data) => {
      if (data === undefined) {
        console.log("ENLP_EMOTIVE_ANSWER undefined, err: ", err);
        return;
      }
      console.log("ENLP_EMOTIVE_ANSWER received: ", data);
      kb.addFact({
        idSource: id,
        tag: "UI_ELF_BEHAVIOR",
        TTL: 1,
        reliability: 100,
        jsonFact: {
          thinking: false
        }
      }).then(
        () => console.log("Thinking:", value),
        e => console.error("Error adding fact to KB:", e.stack)
      );
    }
  );
})();

setInterval(() => {}, 100000);
