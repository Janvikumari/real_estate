import prisma from "../lib/prisma.js";

export const getChats = async (req, res) => {
    const tokenUserId = req.userId;
    try {
        const chats = await prisma.chat.findMany({
            where: {
                userIDs: {
                    hasSome: [tokenUserId],
                },
            },
        });

        for (const chat of chats) {
            const receiverId = chat.userIDs.find((id) => id !== tokenUserId);

            // Ensure receiverId is defined before making the query
            if (receiverId) {
                const receiver = await prisma.user.findUnique({
                    where: {
                        id: receiverId,
                    },
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                });
                chat.receiver = receiver;
            } else {
                console.warn('Receiver ID is undefined for chat:', chat.id);
                chat.receiver = null;
            }
        }

        res.status(200).json(chats);
    } catch (err) {
        console.error('Error in getChats:', err);
        res.status(500).json({ message: "Failed to get chats" });
    }
};

export const getChat = async (req, res) => {
    const tokenUserId = req.userId;
    try {
        const chat = await prisma.chat.findUnique({
            where: {
                id: req.params.id,
                userIDs: {
                    hasSome: [tokenUserId],
                },
            },
            include: {
                messages: {
                    orderBy: {
                        createdAt: "asc",
                    },
                },
            },
        });

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        await prisma.chat.update({
            where: {
                id: req.params.id,
            },
            data: {
                seenBy: {
                    set: [tokenUserId],
                },
            },
        });

        res.status(200).json(chat);
    } catch (err) {
        console.error('Error in getChat:', err);
        res.status(500).json({ message: "Failed to get chat" });
    }
};

export const addChat = async (req, res) => {
    const tokenUserId = req.userId;
    try {
        const newChat = await prisma.chat.create({
            data: {
                userIDs: [tokenUserId, req.body.receiverId],
            },
        });
        res.status(200).json(newChat);
    } catch (err) {
        console.error('Error in addChat:', err);
        res.status(500).json({ message: "Failed to add chat" });
    }
};

export const deleteChat = async (req, res) => {
    try {
        // Assuming you need to implement deletion logic here
        await prisma.chat.delete({
            where: {
                id: req.params.id,
            },
        });
        res.status(200).json({ message: "Chat deleted successfully" });
    } catch (err) {
        console.error('Error in deleteChat:', err);
        res.status(500).json({ message: "Failed to delete chat" });
    }
};

export const readChat = async (req, res) => {
    const tokenUserId = req.userId;
    try {
        const chat = await prisma.chat.update({
            where: {
                id: req.params.id,
                userIDs: {
                    hasSome: [tokenUserId],
                },
            },
            data: {
                seenBy: {
                    set: [tokenUserId],
                },
            },
        });

        if (!chat) {
            return res.status(404).json({ message: "Chat not found" });
        }

        res.status(200).json(chat);
    } catch (err) {
        console.error('Error in readChat:', err);
        res.status(500).json({ message: "Failed to read chat" });
    }
};
