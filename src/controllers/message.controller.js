import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/APIError.js";
import { Conversation } from "../models/conversation.model.js";
import { Message } from "../models/message.model.js";
import { config } from "../../config.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// --------------------------------send messages controller ---------------------------

export const messageSend = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const { id: receiverId } = req.params;
  const senderId = req.user?._id;

  if (!message) {
    throw new ApiError(401, "please provide a message");
  }
  if (!receiverId) {
    throw new ApiError(401, "please provide a userId in params");
  }

  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
    });
  }

  const newMessage = await Message.create({
    senderId,
    receiverId,
    message,
  });

  if (newMessage) {
    conversation.messages?.push(newMessage?._id);
  }

  await Promise.all([conversation.save()]);

  return res
    .status(config.SUCCESS)
    .json(new ApiResponse(config.SUCCESS, newMessage));
});

// ----------------------------- get messages ---------------------------------------

export const getMeassages = asyncHandler(async (req, res) => {
  // get id from params

  const { id: userToChatId } = req.params;
  if (!userToChatId) throw new ApiError(401, "please provide user id");

  // get sender id

  const senderId = req.user?._id;
  if (!senderId)
    throw new ApiError(500, "something went wrong went while get sender id");

  // find chats
  const conversation = await Conversation.findOne({
    participants: { $all: [senderId, userToChatId] },
  }).populate("messages");

  if (!conversation) throw new ApiResponse(200, []);

  return res.status(200).json(new ApiResponse(200, conversation?.messages));
});
