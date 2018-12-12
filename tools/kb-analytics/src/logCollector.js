const debug = require('debug')('kb-analytics:log-collector');

let currentInteraction;
const interactions = [];

class Interaction {
    constructor(kb, interactionName, beginTimestamp) {
        this._kb = kb;
        this.id = beginTimestamp.getTime();
        this.interactionName = interactionName;
        this.beginTimestamp = beginTimestamp;
        this.endTimestamp = 0;
    }

    async getDetails() {
        // Retrive all the facts between the begin and end timestamps
        const facts = await this._kb.query({ jsonReq: {
            _meta: { creationTime: '$date' },
            _predicates: [
                ['isAfterEqualDate', [ this.beginTimestamp.toISOString(), '$date' ] ],
                ['isBeforeEqualDate', [ this.endTimestamp.toISOString(), '$date' ] ]
            ]
        } }).catch(() => []);

        // Sort the facts by ascending timestamp
        facts.sort((a, b) => new Date(b.object._meta.creationTime) - new Date(a.object._meta.creationTime));
        return facts;
    }
};

function processUserEngagedFact(kb, fact) {
    try {

        // Extract the data from the object
        let { _data: { value, interactionName }, _meta: { creationTime } } = fact.object;
        creationTime = new Date(creationTime);

        // If the user disengaged, terminate the interaction and store it in memory
        if (!value && currentInteraction) {
            currentInteraction.endTimestamp = creationTime;
            interactions.splice(0, 0, currentInteraction);
            debug('New interaction #%d', currentInteraction.id);
            currentInteraction = null;
        }

        // If the user engaged, begin a new interaction
        else if (value) {
            currentInteraction = new Interaction(kb, interactionName, creationTime);
        }

    } catch (e) {
        debug('Error handling incoming USER_ENGAGED fact: %o', e);
    }
}

module.exports = {
    async start(kb) {
        debug('Starting log collector...');

        // Request all the USER_ENGAGED facts
        const res = await kb.query({ jsonReq: { _meta: { tag: 'USER_ENGAGED' } } })
                          .catch(() => []);
        res.sort((a, b) => new Date(b.object._meta.creationTime) - new Date(a.object._meta.creationTime));
        res.forEach(x => processUserEngagedFact(kb, x));

        // Subscribe to get notified of the new facts
        const idSource = await kb.register();
        await kb.subscribe(idSource, { _meta: { tag: 'USER_ENGAGED' } }, (err, data) => {
            if (err) {
                debug('Error handling sunscription: %o', err);
                return;
            }
            data.sort((a, b) => new Date(b.object._meta.creationTime) - new Date(a.object._meta.creationTime));
            data.forEach(x => processUserEngagedFact(kb, x));
        });

        debug('Initialized log collector with %d interactions.', interactions.length);

    },

    async getInteractions() {
        return interactions;
    },

    async getInteraction(id) {
        return interactions.find(x => x.id === id);
    }

};