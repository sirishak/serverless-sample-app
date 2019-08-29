'use strict'

const uuidv1 = require('uuid/v1');
const AWS = require('aws-sdk');
const dynamo = new AWS.DynamoDB.DocumentClient();
const kinesis = new AWS.Kinesis();

const TABLE_NAME = process.env.orderTableName;
const STREAM_NAME = process.env.orderStreamName;

module.exports.createOrder = body => {
	const order = {
		orderId: uuidv1(),
		name: body.name,
		address: body.address,
		productId: body.productId,
		quantity: body.quantity,
		orderDate: Date.now(),
		eventType: 'order_place'
	}
    
    return order;
}

module.exports.placeNewOrder = order => {
	return saveNewOrder(order).then(() => {
        return placeOrderInStream(order)
	})
}

module.exports.fulfillOrder = body => {
	return updateOrder(body).then(() => {
        return placeOrderInStream(body)
	})
}

function saveNewOrder(order) {
	const params = {
		TableName: TABLE_NAME,
		Item: order
	}
    
    return dynamo.put(params).promise();
}

function placeOrderInStream(order) {
    const params = {
        Data: JSON.stringify(order),
        PartitionKey: order.orderId,
        StreamName: STREAM_NAME
    }
    
    return kinesis.putRecord(params).promise();
}

function updateOrder(body) {
	const params = {
		TableName:TABLE_NAME,
		Key:{
			"orderId": body.orderId
		},
		UpdateExpression: "set fulfillmentId = :fId, fulfillmentDate=:fd, event_type=:et",
		ExpressionAttributeValues:{
			":fId":body.fulfillmentId,
			":fd":Date.now(),
			":et":"order_fulfilled"
		},
		ReturnValues:"ALL_NEW"
	};

	return dynamo.update(params).promise();
}