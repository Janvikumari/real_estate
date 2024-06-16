import prisma from "../lib/prisma.js"
import bcrypt from "bcrypt";

export const getUsers = async(req,res)=>{
    try{
     const users = await prisma.user.findMany();
     res.status(200).json(users)
    }catch(err){
    console.log(err);
    res.status(500).json({message:"Failed to get users!"})
    }
}
export const getUser = async(req,res)=>{
    const id = req.params.id;
    try{
        const user = await prisma.user.findUnique({
            where: { id },
          });
          res.status(200).json(user);
    }catch(err){
    console.log(err);
    res.status(500).json({message:"Failed to get user!"})
    }
}
export const deleteUser = async(req,res)=>{
    const id = req.params.id;
    const tokenUserId = req.userId;
    
  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }
    try{
        await prisma.user.delete({
            where: { id },
          });
          res.status(200).json({ message: "User deleted" });
    }catch(err){
    console.log(err);
    res.status(500).json({message:"Failed to delete user!"})
    }
}
export const updateUser = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId; // Assuming this is set by your authentication middleware
  const { password, avatar, ...inputs } = req.body;

  if (id !== tokenUserId) {
    return res.status(403).json({ message: "Not Authorized!" });
  }

  let updatedPassword = null;
  try {
    if (password) {
      updatedPassword = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...inputs,
        ...(updatedPassword && { password: updatedPassword }),
        ...(avatar && { avatar }),
      },
    });

    // Exclude password from the response
    const { password: userPassword, ...rest } = updatedUser;

    res.status(200).json(rest);
  } catch (err) {
    console.error("Error updating user:", err); // Improved logging
    res.status(500).json({ message: "Failed to update user!" });
  }
};

export const savePost = async (req, res) => {
  const postId = req.body.postId;
  const tokenUserId = req.userId;

  try {
    console.log(`User ID: ${tokenUserId}, Post ID: ${postId}`);

    const savedPost = await prisma.savedPost.findUnique({
      where: {
        userId_postId: {
          userId: tokenUserId,
          postId,
        },
      },
    });

    if (savedPost) {
      console.log('Post already saved, removing...');
      await prisma.savedPost.delete({
        where: {
          id: savedPost.id,
        },
      });
      res.status(200).json({ message: "Post removed from saved list" });
    } else {
      console.log('Post not saved, adding...');
      await prisma.savedPost.create({
        data: {
          userId: tokenUserId,
          postId,
        },
      });
      res.status(200).json({ message: "Post added to saved list" });
    }
  } catch (error) {
    console.error('Error saving post:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}


export const profilePosts = async (req, res) => {
  const tokenUserId = req.params.userId;

  try {
    const userPosts = await prisma.post.findMany({
      where: { userId: tokenUserId },
    });
    const saved = await prisma.savedPost.findMany({
      where: { userId: tokenUserId },
      include: {
        post: true,
      },
    });

    const savedPosts = saved.map((item) => item.post);
    res.status(200).json({ userPosts, savedPosts });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get profile posts!" });
  }
};
