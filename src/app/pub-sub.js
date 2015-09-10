var subClient = require('../app/redis-client')('sub');
var pubClient = require('../app/redis-client')('pub');
var service = require('../modules/didi');
var pubSubService = {
    pubClient: pubClient,
    subClient: subClient
};
var channels = [
    'submitFastCarOrder',
    'cancelFastCarOrder'
];
//didi Service
channels.forEach(function(channel){
    pubSubService.subClient.subscribe('DD' + channel);
});
pubSubService.subClient.on('message', function(channel, msg){
    var channel = channel.substring(3);
    service[channel](JSON.parse(msg));
});

module.exports = null;