const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");

const { connectToMongoDb } = require("./connection");
const staticRoute = require("./routes/staticRouter");
const urlRoute = require("./routes/url");
const userRoute = require("./routes/user");
const URL = require("./models/url");
const { restrictToLoggedinUserOnly, checkAuth } = require("./middleware/auth");

const app = express();

connectToMongoDb("mongodb://127.0.0.1:27017/url-short").then(() =>
  console.log("MongoDB connected"),
);

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use("/url", restrictToLoggedinUserOnly, urlRoute);
app.use("/", checkAuth, staticRoute);
app.use("/user", userRoute);

app.get("/favicon.ico", (req, res) => res.status(204).end());

app.get("/test", async (req, res) => {
  const allUrls = await URL.find({});
  return res.render("home", {
    urls: allUrls,
  });
});

app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    },
  );

  if (!entry) {
    return res.status(404).send("Short URL not found");
  }

  res.redirect(entry.redirectUrl);
});

app.listen(8001, () => console.log("Server started at 8001"));
