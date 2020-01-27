const queryHandler = require('./query-handler');
'use strict';
class ChatHandler{
async getMessagesRouteHandler(request, response){
    console.log(request);
    let userId = request.body.userId;
    let toUserId = request.body.toUserId;			
    if (userId == '') {
        response.status(404).send({
            error : true,
            message : 'error'
        });
    }else{
        try {
            const messagesResponse = await queryHandler.getMessages({
                userId:userId,
                toUserId: toUserId
            });
            response.status(200).send({
                error : false,
                messages : messagesResponse
            });
        } catch ( error ){
            response.status(404).send({
                error : true,
                messages : 'error'
            });
        }
    }
}
}
module.exports = new ChatHandler();