var express = require('express');
var router = express.Router();

// GET home page
router.get('/', async (req, res, next) => {
    try {
        const data = await req.kb.invoke('listTags', { includeShortDesc: true });
        res.render('index', { data });
    } catch (e) {
        next(e);
    }
});

// Get tag details
router.get('/:source/:tag', async (req, res, next) => {
    try {
        const { source, tag } = req.params;

        const data = await req.kb.invoke('getTagDetails', { idSource: source, tagsList: [ tag ] });
        res.render('details', {
            title: source + '/' + tag,
            idSource: source,
            tagName: tag,
            shortDesc: data[tag].desc,
            longDesc: data[tag].doc
        });
    } catch (e) {
        next(e);
    }
});

module.exports = router;
