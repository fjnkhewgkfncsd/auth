import bcrypt from 'bcrypt';
import db from '../models/index.js';
import jwt from "jsonwebtoken";
/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and registration
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, email]
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Bad request
 */
export const register = async (req, res) => {
    const { username,password,email} = req.body;
    try {
        if(!username || !password || !email){
            return res.status(400).json({
                message: "Username, password and email are required"
            })
        }
        const exists = await db.User.findOne({ where : {email}});
        if(exists){
            return res.status(400).json({
                message: "User already exists"
            })
        }
        const hashedPassword = await bcrypt.hash(password,10);
        const user = await db.User.create({
            username,password: hashedPassword,email
        });
        res.status(201).json({
            message: "User created successfully",
            user: {
                id: user.id,
                username: user.username,
                email: user.email
            }
        })
    } catch (error) {
        console.log("Failed to create user",error);
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *       400:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 */
export const login = async (req, res) => {
    const {email, password} = req.body;
    try{
        if(!email || !password){
            return res.status(400).json({
                message: "Email and password are required"
            })
        }
        const user = await db.User.findOne({
            where: {email}
        })
        if(!user){
            return res.status(404).json({
                message: "User not found"
            })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.status(400).json({
                message: "invalid credentials"
            })
        } 
        const token = user.sign({username : user.username, id: user.id}, process.env.JWT_SECRET,{
            expiresIn: "1h"
        })  
        res.status(200).json({
            token,
            user:{
                id:user.id,
                username: user.username,
                email: user.email
            }
        }) 
    }catch(error){
        console.log("Failed to login user", error);
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}