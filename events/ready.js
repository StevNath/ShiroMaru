const { Events, Activity, ActivityType } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
        client.user.setActivity('Subscribe Here!', { type: ActivityType.Streaming, url: 'https://www.youtube.com/watch?v=pMdOcNlPJFo&t=1s'});

    }
}