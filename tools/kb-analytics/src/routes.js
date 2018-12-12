const path = require('path');
const debug = require('debug')('kb-analytics:server');
const express = require('express');
const marked = require('marked');
const hljs = require('highlight.js');
const createError = require('http-errors');
const router = express.Router();

const config = require('../config.json');
const logCollector = require('./logCollector');

// Monkey patch the default markdown renderer to allow code highlighting
const renderer = new marked.Renderer();
renderer.code = (code, language) =>
    `<pre><code class="hljs ${language}">${hljs.highlightAuto(code, language ? [language] : null).value}</code></pre>`;


// GET /
router.get('/', (req, res) => {
    res.render('index');
});

// GET /docs
router.get('/docs', async (req, res, next) => {
    try {
        const data = await req.kb.getAllTags({ includeShortDesc: true });
        res.render('docs/index', { title: 'Documentation', data });
    } catch (e) {
        next(e);
    }
});

// GET /docs/:source/:tag
router.get('/docs/:source/:tag', async (req, res, next) => {
    try {
        const { source, tag } = req.params;

        const data = await req.kb.getTagDetails({ idSource: source, tagsList: [ tag ] });
        res.render('docs/details', {
            title: source + '/' + tag,
            idSource: source,
            tagName: tag,
            shortDesc: data[tag].desc,
            longDesc: marked(data[tag].doc, {
                gfm: true,
                tables: true,
                renderer
            })
        });
    } catch (e) {
        next(e);
    }
});

// GET /logs
router.get('/logs', async (req, res, next) => {
    try {
        res.render('logs/index', {
            title: 'Logs',
            interactions: await logCollector.getInteractions()
        });
    } catch (e) {
        next(e);
    }
});

// GET /logs/:id
router.get('/logs/:id', async (req, res, next) => {
    try {
        const interaction = await logCollector.getInteraction(parseInt(req.params.id, 10));
        if (!interaction) {
            next(createError(404));
            return;
        }

        res.render('logs/details', {
            title: 'Interaction #' + req.params.id,
            interaction,
            details: await interaction.getDetails()
        });
    } catch (e) {
        next(e);
    }
});

// Static log recordings
debug('Serving static recordings from: %s', path.join(__dirname, '..', config.videoRecordingsPath));
router.use('/logs/videos', express.static(path.join(__dirname, '..', config.videoRecordingsPath)));

module.exports = router;
