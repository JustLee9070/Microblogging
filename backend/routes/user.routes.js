import express from 'express'
import { protectRoute } from '../middleware/protectRoute.js'
import { followUnfollowProfile, getSuggestedUsers, getUserProfile, updateUserProfile } from '../controllers/user.controller.js'

const router = express.Router()

router.get('/profile/:username', protectRoute, getUserProfile)
router.get('/suggested', protectRoute, getSuggestedUsers)
router.post('/follow/:id', protectRoute, followUnfollowProfile)
router.post('/update', protectRoute, updateUserProfile)

export default router