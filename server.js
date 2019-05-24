var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var env = require('node-env-file');
const fetch = require('node-fetch');
const log = require('./logger');
var port = 3000;
env(__dirname + '/.env');

io.on('connection', socket => {
    log.info('New user connected -- Socket UDCH server');
    const sendEmit = (event, data) => {
        log.info('broadcast emit event:' + event);
        socket.broadcast.emit(event, data);
    };

    const actionFetch = (event, url) => {
        fetch(url).then(response => response.json()).then(data => {
            log.fatal('broadcast emit event:' + event);
            if (data.data.order_complte) {
                sendEmit(event, data);
            }
        });
    };

    socket.on('checkOrderChemo', (data) => {
        const params = new URLSearchParams({
            visit_id: data.visit_id
        });
        let mainUrl = process.env.backendUrl + 'api/public-thai-his/order-chemo-complte?' + params
        actionFetch('newOrderChemo', mainUrl);
    });

    socket.on('disconnect', function () {
        log.info('disconnected server');
        io.emit('disconnected', { 'message': 'Bey' });
    });
});

http.listen(port, function () {
    log.trace('server start in port http://localhost:' + port);
});