require('dotenv').config();
const CONSTANTS = require('./constants');
//Express and Bodyparser
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
//Load Spotify local module
const spotify = require('./core/spotifyConfig');
const spotifySetup = require('./core/spotifyConfig');
const spotifyAuth = require('./core/spotifyAuth');
const spotifyController = require('./core/spotifyController');
const slack = require('./controllers/slackController');
const port = process.env.PORT || 3000;
const logger = require('./log/winston');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

/**
 * Slack button actions all flow here
 */
app.post('/slack/actions', async (req, res) =>{
  var payload = JSON.parse(req.body.payload);
  if (payload.actions != null && payload.actions.length > 0){
    // See more tracks button action
    if (payload.actions[0].name == CONSTANTS.SEE_MORE_TRACKS){
      logger.info("See more action triggered");
      res.send();
      await spotifyController.getThreeTracks(payload.callback_id, payload.actions[0].value, payload.response_url);
    }
    // Add a song button
    else if (payload.actions[0].name == CONSTANTS.ADD_SONG){
      logger.info("Add Song triggered");
      res.send(slack.deleteReply("ephemeral", ""));
      await spotifyController.addSongToPlaylist(payload.callback_id, payload.actions[0].value, payload.user, payload.channel.id);
    }
    else if (payload.actions[0].name == CONSTANTS.SKIP){
      logger.info("Add Song triggered");
      await spotifyController.voteSkip(payload.user, payload.callback_id, payload.response_url);
    }
    else if (payload.actions[0].name == CONSTANTS.RESET){
      logger.info("Add Song triggered");
      await spotifyController.reset(payload.response_url, payload.user.id);
    }
  }
  else{
    if (payload.callback_id == CONSTANTS.SPOTIFY_CONFIG){
      let errors = await spotifySetup.verifySettings(payload.submission, payload.response_url, res);
      if (!errors){
        res.send();
      } else {
        res.send({errors});
      }
    }
    else{
      res.send("Inavlid Command");
    }
  }
});

app.post('/setup', async (req, res) => {
  if (req.body.text == "setup"){
    logger.info("Setup Slash Command Used");
    res.send();
    await spotifySetup.setup(req.body.user_name, req.body.trigger_id, req.body.response_url)
  }
  else if (req.body.text == "auth"){
    logger.info("Auth Slash Command Used");
    res.send();
    await spotifySetup.setup_auth(req.body.trigger_id, req.body.response_url, req.body.channel_id);

  }
  else if (req.body.text == "settings"){
    logger.info("Settings Slash Command Used");
    res.send();
    await spotifySetup.settings(req.body.trigger_id);
  }
  else {
    console.log(req.body)
    let array = req.body.text.split(" ");
    if (array){
      if (array[0] == "admin"){
        logger.info("Admin Slash Command Used");
        if (array[1]){
          if (array[1] == "add"){
            res.send();
            spotifySetup.addAdmin(array[2], req.body.response_url);
          }
          else if(array[1] == "remove"){
            res.send();
            spotifySetup.removeAdmin(array[2], req.body.user_name, req.body.response_url);
          }
          else if(array[1] == "list"){
            res.send();
            spotifySetup.getAdmins(req.body.response_url);
          }
        }
      }
    }
  }
});


app.get('/auth', async (req, res) => {
  logger.info("Auth Slash Command Used");
  if (req.query.code != null) {
    let response = await spotifyAuth.getAccessToken(req.query.code, req.query.state);
    res.redirect(response);
  } else if (req.query.error != null) {
    logger.error(`Auth Slash Command Error ${error}`);
  }
});

app.post('/play',  async (req, res) => {
  logger.info("Play Triggered");
  res.send(slack.ack());
  await spotifyController.play(req.body.response_url);
});

app.post('/pause', async (req, res) => {
  logger.info("Pause Triggered");
  res.send(slack.ack());
  await spotifyController.pause(req.body.response_url);
});

app.post('/find', async (req, res) => {
  logger.info("Find Triggered");
  if (req.body.text == ""){
    res.send({
      "text": "I need a search term... :face_palm:"
    });
  }
else {
  res.send(slack.ack());
  await spotifyController.find(req.body.text, req.body.trigger_id, req.body.response_url);
}

});

app.post('/whom', async (req, res) => {
  logger.info("Whom Triggered");
  res.send(slack.ack());
  await spotifyController.whom(req.body.response_url);
});

app.post('/skip', async (req, res) => {
  logger.info("Skip triggered");
  res.send(slack.ack());
  await spotifyController.skip(req.body.user_id, req.body.response_url);
});

app.post('/reset', async (req, res) => {
  logger.info("Reset triggered");
  res.send(slack.ack());
  await spotifyController.resetRequest(req.body.response_url);
})


app.listen(port, () => logger.info(`App listening on port ${port}!`))