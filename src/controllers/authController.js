const { Router } = require('express');
const router = Router();

const jwt = require('jsonwebtoken');
const config = require('../config');
const verifyToken = require('./veryfyToken');

const User = require('../models/User');

router.post('/signup', async (req, res, next) => {
    const { username, email, password } = req.body;
    const user = new User({
        username,
        email,
        password
    });
    user.password = await user.encryptPassword(user.password);
    await user.save();

    const token = jwt.sign({ id: user._id }, config.secret, {
        expiresIn: 60 * 60 * 24
    });

    res.json({ auth: true, token });
})

router.post('/signin', async (req, res, next) => {
    const { email, password } = req.body
    const user = await User.findOne({ email: email })
    if (!user) {
        res.status(404).send("the email doesn´t exitsts")
    }
    const passWordIsValid = await user.validatePassword(password);
    if(!passWordIsValid){
        return res.status(401).json({auth:false, token:null});
    }

   const token = jwt.sign({id:user._id}, config.secret, {
        expiresIn: 60*60*24
    })

    res.json({auth: true, token: token})
})

router.get('/me', verifyToken, async (req, res, next) => {
    
    const user = await User.findById(req.userId, { password: 0 });
    if (!user) {
        return res.status(404).send('No user found')
    }
    res.json(user);
})

module.exports = router;