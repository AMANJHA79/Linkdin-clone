const ConnectionRequest = require('../models/connectionRequestModel');
const User = require('../models/userModel');
const { sendConnectionAcceptedEmail } = require('../emails/email-handlers');


const sendConnectionRequest = async (req, res, next) => {
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
            sender: sender,
            recipient: userId,
            status: "pending"
        });
        if(existingRequest){
            return res.status(400).json({error: "You have already sent a connection request to this user"});
        }
        const newRequest = new ConnectionRequest({
            sender: sender,
            recipient: userId, 
            status: "pending"
        });
        await newRequest.save();
        res.status(201).json({
            message: "Connection request sent successfully"
        });
    }
    catch(error){
        next(error);
    }
}

const acceptConnectionRequest = async (req, res, next) => {
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
        next(error);
    }
}

const rejectConnectionRequest = async (req, res, next) => {
    try{
        const {requestId} = req.params;
        const userId = req.user._id;
        const request = await ConnectionRequest.findById(requestId);
        
        if(request.recipient._id.toString() !== userId.toString()){
            return res.status(403).json({error: "You are not authorized to reject this connection request"});
        }
        if(request.status !== "pending"){
            return res.status(400).json({error: "Connection request is not pending"});
        }
        request.status = "rejected";
        await request.save();
        res.json({message: "Connection request rejected successfully"});
    }
    catch(error){
        next(error);
    }
}

const removeConnection = async (req, res, next) => {
    try {
		const myId = req.user._id;
		const { userId } = req.params;

		await User.findByIdAndUpdate(myId, { $pull: { connections: userId } });
		await User.findByIdAndUpdate(userId, { $pull: { connections: myId } });

		res.json({ message: "Connection removed successfully" });
	} catch (error) {
		console.error("Error in removeConnection controller:", error);
		res.status(500).json({ message: "Server error" });
	}
}

const getConnectionsRequests = async (req, res, next) => {
    try{
        const {userId} = req.user._id;
        const requests = await ConnectionRequest.find({recipient: userId, status: "pending"}).populate('sender', 'name username profilePicture headline connections');
        res.json(requests);
    }
    catch(error){
        next(error);
    }
}

const getUserConnections = async (req, res, next) => {
    try{
        const {userId} = req.user._id;
        const user = await User.findById(userId).populate('connections', 'name username profilePicture headline connections');
        res.json(user.connections);
    }
    catch(error){
        next(error);
    }
}

const getConnectionStatus = async (req, res, next) => {
	try {
		const targetUserId = req.params.userId;
		const currentUserId = req.user._id;

		const currentUser = req.user;
		if (currentUser.connections.includes(targetUserId)) {
			return res.json({ status: "connected" });
		}

		const pendingRequest = await ConnectionRequest.findOne({
			$or: [
				{ sender: currentUserId, recipient: targetUserId },
				{ sender: targetUserId, recipient: currentUserId },
			],
			status: "pending",
		});

		if (pendingRequest) {
			if (pendingRequest.sender.toString() === currentUserId.toString()) {
				return res.json({ status: "pending" });
			} else {
				return res.json({ status: "received", requestId: pendingRequest._id });
			}
		}

		// if no connection or pending req found
		res.json({ status: "not_connected" });
	} catch (error) {
		console.error("Error in getConnectionStatus controller:", error);
		res.status(500).json({ message: "Server error" });
	}
}











module.exports = {sendConnectionRequest, acceptConnectionRequest, rejectConnectionRequest, removeConnection, getConnectionsRequests, getUserConnections, getConnectionStatus};