import User from '../models/User.model.js'
import generateToken from '../utils/generateToken.js'

export const register = async (req, res) => {
    const { name, email, password } = req.body
    try {
        const exitsUser = await User.findOne({ email })
        if (exitsUser) {
            return res.status(400).json({
                message: 'User alredy exits'
            })
        }
        const user = await User.create({
            name,
            email,
            password
        })

        res.status(201).json({
            message: 'User register successfully ✅',
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        })

    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({
            message: 'Server error, please try again later ❌'
        });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email })

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({
                message: "Invalid credentials ❌"
            })
        }

        res.status(201).json({
            message: 'User login successfully ✅',
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        })

    } catch (error) {
        console.error('Error login user:', error);
        res.status(500).json({
            message: 'Server error, please try again later ❌'
        });
    }
}

export const getProfile = async (req, res) => {
    try {
        res.json(req.user)
    } catch (error) {
        console.error('Error getProfile:', error);
        res.status(500).json({
            message: 'Server error, please try again later ❌'
        });
    }
}