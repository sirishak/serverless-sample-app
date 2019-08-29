'use strict';

const orderManager = require('./orderManager');

function response(statusCode, message) {
    const resp = {
        statusCode: statusCode,
        body: JSON.stringify(message)
    };
    
    return resp;
}


module.exports.createOrder = async (event) => {
	
    const body = JSON.parse(event.body)
    const order = orderManager.createOrder(body)
      
    return orderManager.placeNewOrder(order).then(() => {
        return response(200, order);
    }).catch(error => {
        return response(400, error);
    });
};

module.exports.fulfillOrder = async (event) => {
	
    const body = JSON.parse(event.body)
      
    return orderManager.fulfillOrder(body).then(() => {
        return response(200, body);
    }).catch(error => {
        return response(400, error);
    });
};
  