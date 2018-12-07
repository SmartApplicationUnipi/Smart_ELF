const express = require('express');
const marked = require('marked');
const hljs = require('highlight.js');
const router = express.Router();

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
router.get('/logs', (req, res) => {
    res.render('logs/index', { title: 'Logs' });
});

module.exports = router;
