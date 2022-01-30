const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const User = require('../../models/User');

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post(
    '/',
    [
        check('name', 'Name is required custom error msg pog').not().isEmpty(),
        check('email', 'Please use a valid email').isEmail(),
        check(
            'password',
            'Please enter a password with 6 or more carrotters'
        ).isLength({ min: 6 }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // This is short hand for the following...
        // const name = req.body.name;
        // const email = req.body.email;
        // const password = req.body.password;
        const { name, email, password } = req.body;

        try {
            // See if user exists
            let user = await User.findOne({ email });

            if (user) {
                return res
                    .status(400)
                    .json({ errors: [{ msg: 'User already exists' }] });
            }

            // Get users gravatar
            const avatar = gravatar.url(email, {
                s: '200',
                r: 'pg',
                d: 'mm',
            });

            user = new User({
                name,
                email,
                avatar,
                password,
            });

            // Encrypt password
            const salt = await bcrypt.genSalt(10);

            user.password = await bcrypt.hash(password, salt);

            // Save user to db
            await user.save();

            const payload = {
                user: {
                    id: user.id,
                },
            };

            // Change expiresIn back to 3600 seconds before production
            jwt.sign(
                payload,
                config.get('jwtSecret'),
                { expiresIn: 3600000 },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        } catch (err) {
            console.error(err.message);
            res.status(500).send('Server error');
        }
    }
);

module.exports = router;
