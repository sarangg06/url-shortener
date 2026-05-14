const express = require('express');
const path = require('path');
const staticRoute = require('./routes/staticRouter'); 

const {connectToMongoDb} = require('./connection');
const urlRoute = require('./routes/url');
const URL = require('./models/url');

const app = express();

connectToMongoDb('mongodb://127.0.0.1:27017/url-short')
    .then(() => console.log("MongoDB connected"));


app.set('view engine', 'ejs');
app.set('views', path.resolve('./views'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/url', urlRoute);
app.use('/', staticRoute);

app.get('/test', async (req, res) => {
    const allUrls = await URL.find({});
    return res.render('home', {
        urls: allUrls,
    });
});

app.get('/:shortId', async (req, res) => {
    const shortId = req.params.shortId;
    const entry = await URL.findOneAndUpdate(
        {
            shortId,
        },
        {
            $push: {
                visitHistory: {
                    timestamp: Date.now(),
                }
            }
        }
    );

    res.redirect(entry.redirectUrl);
});

app.listen(8001, () => console.log("Server started at 8001"));