var restify = require('restify');
var builder = require('botbuilder');
var config = require('./config');

// Server Stuff
var server = restify.createServer();
server.listen(process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

// Serve a static web page
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));


// Create the bot
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID || config.id,
    appPassword: process.env.MICROSOFT_APP_PASSWORD || config.password
});

var bot = new builder.UniversalBot(connector);
//var bot = new builder.TextBot();

server.post('/api/messages', connector.listen());


// Bot Response Stuff
// bot.dialog('/', function (session) {
//     session.send("Hello World");
// });

bot.dialog('/', function (session) {
    if (!session.userData.name) {
        session.beginDialog('/profile');
    } else {
        session.send('Hello %s!', session.userData.name);
        session.beginDialog('/whatsup');
    }
});

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, 'Hi!  What is your name?');
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
        session.beginDialog('/whatsup');
    }
]);

bot.dialog('/whatsup', [
    function (session) {
        builder.Prompts.text(session, 'What can I do for you ' + session.userData.name + '?');
    },
    function (session, results) {
        session.userData.help = results.response;
        session.endDialog();
        session.send('So you need help with ' + session.userData.help + '?  Piss Off!');
    }
]);