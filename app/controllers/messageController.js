const { Message } = require("../models");

const messageController = {
    // Display all Messages

    getAllMessages: async (_, response) => {
        try {
            const messages = await Message.findAll();

            if (Object.keys(messages).length === 0) {
                return response.status(404).json("No messages found");
            }

            response.json(messages);
        } catch (err) {
            console.trace(err);
            response.status(500).json(err.toString());
        }
    },

    // Display one Message

    getOneMessage: async (request, response) => {
        try {
            const messageId = parseInt(request.params.id, 10);
            if (isNaN(messageId)) {
                return response.status(400).json("ID is NaN");
            }

            const message = await Message.findByPk(messageId);

            if (!message) {
                return response.status(404).json("Message does not exist");
            }

            response.json(message);
        } catch (err) {
            console.trace(err);
            response.status(500).json(err.toString());
        }
    },

    // Create a message

    createMessage: async (request, response) => {
        try {
            if (!request.body) {
                return response.status(400).json("Missing body from request");
            }

            const { content, group_id, user_id } = request.body;

            let missingParams = [];
            if (!content) {
                missingParams.push("content");
            }

            if (!group_id) {
                missingParams.push("group_id");
            }

            if (!user_id) {
                missingParams.push("user_id");
            }

            if (missingParams.length > 0) {
                return response
                    .status(400)
                    .json(`Missing body parameter ${missingParams.join(", ")}`);
            }

            const alreadyExists = await Message.findOne({
                where: {
                    group_id: group_id,
                    user_id: user_id,
                },
            });

            if (alreadyExists) {
                return response.status(409).json("Message already exists");
            }

            const message = new Message({
                content: content,
                group_id: group_id,
                user_id: user_id,
            });

            if (!message) {
                return response.status(409).json("Failed creating message");
            }

            await message.save();
            response.json(message);
        } catch (err) {
            console.trace(err);
            response.status(500).json(err.toString());
        }
    },

    // Modify a message

    updateMessage: async (request, response) => {
        try {
            if (!request.body) {
                return response.status(400).json("Missing body from request");
            }

            const messageId = parseInt(request.params.id, 10);
            if (isNaN(messageId)) {
                return response.status(400).json("ID is NaN");
            }

            const validParams = ["content", "group_id", "user_id"];
            let uselessParams = [];

            for (const [key] of Object.entries(request.body)) {
                if (!validParams.includes(key)) {
                    uselessParams.push(key);
                }
            }

            if (uselessParams.length > 0) {
                return response
                    .status(400)
                    .json(
                        `Useless body parameter(s): ${uselessParams.join(", ")}`
                    );
            }

            const message = await Message.findByPk(messageId);

            if (!message) {
                return response.status(404).json("Message not found");
            }

            message.set(request.body);

            await message.save();
            response.json(message);
        } catch (err) {
            console.trace(err);
            response.status(500).json(err.toString());
        }
    },

    // Delete a message

    deleteMessage: async (request, response) => {
        try {
            const messageId = parseInt(request.params.id, 10);
            if (isNaN(messageId)) {
                return response.status(400).json("ID is NaN");
            }

            const message = await Message.findByPk(messageId);

            if (!message) {
                return response.status(404).json("Message does not exist");
            }

            await message.destroy();
            response.json(message);
        } catch (err) {
            console.trace(err);
            response.status(500).json(err.toString());
        }
    },
};

module.exports = messageController;
