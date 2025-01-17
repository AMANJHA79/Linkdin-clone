const ConnectionRequest = require('../models/connectionRequestModel');
const User = require('../models/userModel');
const { sendConnectionAcceptedEmail } = require('../emails/email-handlers');


const sendConnectionRequest = async (req, res) => {
    try{
        const {userId} = req.params;
        const sender = req.user._id;
        if(sender.toString() === userId){
            return res.status(400).json({error: "You cannot send a connection request to yourself"});
        }
        if(req.user.connections.includes(userId)){
            return res.status(400).json({error: "You are already connected to this user"});
        }
        const existingRequest = await ConnectionRequest.findOne({
            sender: senderId,
            recipient: userId,
            status: "pending"
        });
        if(existingRequest){
            return res.status(400).json({error: "You have already sent a connection request to this user"});
        }
        const newRequest = new ConnectionRequest({
            sender: senderId, 
            recipient: userId, 
            status: "pending"
        });
        await newRequest.save();
        res.status(201).json({
            message: "Connection request sent successfully"
        });
    }
    catch(error){
        res.status(500).json({error: error.message});
    }
}

const acceptConnectionRequest = async (req, res) => {
    try{
        const { requestId } = req.params;
        const { userId } = req.user;
        const request = await ConnectionRequest.findById(requestId).populate('sender', 'name email username ')
        .populate('recipient', 'name username');
        if(!request){
            return res.status(404).json({error: "Connection request not found"});
        }
        if(request.recipient._id.toString() !== userId.toString()){
            return res.status(403).json({error: "You are not authorized to accept this connection request"});
        }
        if(request.status !== "pending"){
            return res.status(400).json({error: "Connection request is not pending"});
        }
        request.status = "accepted";
        await request.save();


        await User.findByIdAndUpdate(request.sender._id, {$push: {connections: userId}});
        await User.findByIdAndUpdate(userId, {$addToSet: {connections: request.sender._id}});

        const notification = new Notification({
            recipient: request.sender._id,
            type: "connectionAccepted",
            relatedUser: userId,

        })
        await notification.save();

        res.json({message: "Connection request accepted successfully"});

        //send email notification
        
            const senderEmail = request.sender.email;
            const senderName = request.sender.name;
            const recipientName = request.recipient.name;

            const profileUrl = `${process.env.CLIENT_URL}/profile/${request.recipient.username}`;
            try{
                await sendConnectionAcceptedEmail(senderEmail, senderName, recipientName, profileUrl);
            
            }

        
        catch(error){
            console.error("Error sending email notification", error);
        }

        res.status(200).json({message: "Connection request accepted successfully"});

    }
    catch(error){
        res.status(500).json({error: error.message});

    }
}

















module.exports = {sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest, removeConnection, getConnectionsRequests, getUserConnections, getConnectionStatus};