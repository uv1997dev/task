import express from 'express'
import { addUser, getUser } from '../controller/user.js'
const router = express.Router()

router.post('/addemployee', addUser )
router.get('/getemployee', getUser )

export default router