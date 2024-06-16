import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { getPosts, getPost, addPost, deletePost, updatePost } from "../controllers/post.controller.js"; // Import functions

const router = express.Router();

router.get("/", getPosts);
router.get("/:id", getPost);
router.post("/", verifyToken, addPost); // Use updatePost instead of addPost for PUT request
router.put("/:id", verifyToken, updatePost);
router.delete("/:id", verifyToken, deletePost);

export default router;
