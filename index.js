const express = require('express');
const urlRoute = require('./routes/url');
const {connectToMongoDb} = require('./connection');
const URL = require('./models/url');

const app = express();

connectToMongoDb('mongodb://127.0.0.1:27017/url-short')
    .then(() => console.log("MongoDB connected"));

app.use(express.json());

app.use('/url', urlRoute);

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