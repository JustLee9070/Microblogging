import Notification from "../models/notification.model.js"
import Post from "../models/post.model.js"
import User from "../models/user.model.js"
import { v2 as cloudinary } from 'cloudinary'

export const createPost = async (req, res) => {
    try {
        const { text } = req.body
        let { img } = req.body
        const userId = req.user._id.toString()

        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ error: "User Not Found!" })
        }

        if (!text && !img) {
            return res.status(400).json({ error: "A Post must have either a text or an image or both" })
        }

        if (img) {
            const upoloadedResponse = await cloudinary.uploader.upload(img)
            img = upoloadedResponse.secure_url
        }

        const newPost = new Post({
            user: userId,
            text: text,
            img: img,
        })

        await newPost.save()
        res.status(201).json(newPost)

    } catch (error) {
        console.log('Error in createPost controller: ', error.message)
        res.status(500).json({ error: "Internal Server Error!" })
    }
}

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        if (!post) {
            return res.status(404).json({ error: "Post Not Found" })
        }

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ error: "You are not authorized to delete this post!" })
        }

        if (post.img) {
            const imgId = post.img.split("/").pop().split('.')[0]
            await cloudinary.uploader.destroy(imgId)
        }

        await Post.findByIdAndDelete(req.params.id)

        return res.status(200).json({ message: "Post deleted successfully!" })

    } catch (error) {
        console.log('Error in deletePost controller: ', error.message)
        return res.status(500).json({ error: "Internal Server Error!" })
    }
}

export const commentOnPost = async (req, res) => {
    try {
        const { text } = req.body
        const postId = req.params.id
        const userId = req.user._id

        if (!text) {
            return res.status(400).json({ error: "Text field is required to add comments posts" })
        }

        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({ error: "Post Not Found!" })
        }

        const comment = { user: userId, text: text, }

        post.comments.push(comment)
        await post.save()

        return res.status(200).json({ message: "Comment added on the post successfully!", data: post })

    } catch (error) {
        console.log("Error in commentOnPost controller: ", error.message)
        return res.status(500).json({ error: "Internal Server Error!" })
    }
}

export const likeUnlikePost = async (req, res) => {
    try {
        const userId = req.user._id
        const { id: postId } = req.params


        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({ error: "Post not found!" })
        }

        const userLikedPost = post.likes.includes(userId)
        if (userLikedPost) {
            //unlike
            await Post.updateOne({ _id: postId }, { $pull: { likes: userId } })
            await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } })
            return res.status(200).json({ message: "Post Unliked Successfully!" })
        }

        else {
            await Post.updateOne({ _id: postId }, { $addToSet: { likes: userId } })
            await User.updateOne({ _id: userId }, { $addToSet: { likedPosts: postId } })
            const notification = new Notification({
                from: userId,
                to: post.user,
                type: "like"
            })
            await notification.save()
            return res.status(200).json({ message: "Post Liked Successfully!" })
        }

    } catch (error) {
        console.log("Error in the likeUnlikePost controller: ", error.message)
        return res.status(500).json({ error: "Internal Server Error!" })

    }
}

export const deleteComment = async (req, res) => {
    try {
        const { postId, commentId } = req.params
        const userId = req.user._id

        const post = await Post.findById(postId)
        if (!post) {
            return res.status(404).json({ error: "Post Not Found!" })
        }

        const comment = post.comments.id(commentId)
        if (!comment) {
            return res.status(404).json({ error: "Comment Not Found!" })
        }

        if (comment.user.toString() !== userId.toString() && post.user.toString() !== userId.toString()) {
            return res.status(403).json({ error: "Only the post owner or the comment owner can delete a comment" })
        }

        comment.deleteOne()
        await post.save()

        return res.status(200).json({ message: "Comment deleted successfully" })

    } catch (error) {
        console.log("Error in deleteComment controller: ", error.message)
        return res.status(500).json({ error: "Internal Server Error" })
    }
}

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password -email -fullName"
        }).populate({
            path: "comments.user",
            select: "-password -email -fullName"
        })


        if (posts.length === 0) {
            return res.status(200).json([])
        }

        return res.status(200).json(posts)

    } catch (error) {
        console.log('Error in getAllPosts controller: ', error.message)
        return res.json.status(500).json({ error: "Internal Server Error!" })
    }
}

export const getLikedPosts = async (req, res) => {
    const userId = req.params.userId

    try {
        const user = await User.findById(userId)
        if (!user) {
            return res.status(404).json({ error: "User Not Found!" })
        }

        const likedPosts = await Post.find({ _id: { $in: user.likedPosts } }).populate({
            path: "user",
            select: "-password -email -fullName"
        }).populate({
            path: "comments.user",
            select: "-password -email -fullName"
        })

        return res.status(200).json(likedPosts)

    } catch (error) {
        console.log("Error in getLikedPosts controller: ", error.message)
        return res.status(500).json({ error: "Internal Server Error!" })
    }

}

export const getFollowingPosts = async (req, res) => {
    try {
        const userId = req.user._id
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ error: "User not found" })
        }

        const following = user.following

        const followingPosts = await Post.find({ user: { $in: following } }).sort({ createdAt: -1 }).populate({
            path: "user",
            select: "-password -fullName -email"
        }).populate({
            path: "comments.user",
            select: "-password -fullName -email"
        })

        return res.status(200).json(followingPosts)

    } catch (error) {
        console.log('Error in getFollowingPosts controller: ', error.message)
        res.status(500).json({ error: "Internal Sever Error! " })
    }
}

export const getUserPosts = async (req, res) => {
    try {
        const { username } = req.params
        const user = await User.findOne({ username: username })

        if (!user) {
            return res.status(404).json({ error: "User Not Found!" })
        }

        const posts = await Post.find({ user: user._id }).sort({createdAt: -1}).populate({
            path: "user",
            select: "-password -email -fullName"
        }).populate({
            path: "comments.user",
            select: "-password -email -fullName"
        })

        return res.status(200).json(posts)

    } catch (error) {
        console.log("Error in getUserPosts controller: ", error.message)
        return res.status(500).json({error: "Internal Server Error!"})
    }
}