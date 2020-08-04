const express = require('express');
const router = express.Router();
const request = require('request');
const config = require('config');
const auth = require('../../middleware/auth');
const {
    check,
    validationResult
} = require('express-validator');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route GET api/profile/me
// @desc Test route
// @access private
router.get('/me', auth, async (req, res, next) => {
    try {

        const profile = await Profile.findOne({
            user: req.user.id
        }).populate('user', ['name', 'avatar']);

        if (!profile) {
            return res.status(400).json({
                msg: 'There is no profile for this user'
            });
        }
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
    }

});

// @route POST api/profile
// @desc Update profile
// @access private
router.post('/', [auth, [
    check('status', 'Status is required').not().isEmpty(),
    check('skills', 'Skill is required').not().isEmpty()
]], async (req, res, next) => {
    try {
        const errors = validationResult(req);
        // check the error status.
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        const {
            company,
            location,
            website,
            bio,
            skills,
            status,
            githubusername,
            youtube,
            twitter,
            instagram,
            linkedin,
            facebook
        } = req.body;

        // Build profile fields
        const profileFields = {};
        profileFields.user = req.user.id;

        if (company) profileFields.company = company;
        if (location) profileFields.location = location;
        if (website) profileFields.website = website;
        if (bio) profileFields.bio = bio;
        if (status) profileFields.status = status;
        if (githubusername) profileFields.githubusername = githubusername;

        if (skills) profileFields.skills = skills.split(',').map(skill => skill.trim());

        // Build profile social fields
        profileFields.social = {};
        if (youtube) profileFields.social.youtube = youtube;
        if (twitter) profileFields.social.twitter = twitter;
        if (instagram) profileFields.social.instagram = instagram;
        if (linkedin) profileFields.social.linkedin = linkedin;
        if (facebook) profileFields.social.facebook = facebook;

        try {
            let profile = await Profile.findOne({
                user: req.user.id
            });

            if (profile) {
                // update profile
                profile = await Profile.findOneAndUpdate({
                    user: req.user.id
                }, {
                    $set: profileFields
                }, {
                    new: true
                });

                return res.json(profile);
            }

            // add the profile
            profile = new Profile(profileFields);

            await profile.save();
            res.json(profile);

        } catch (error) {
            console.error(err.message);
            return res.status(500).send('Server Error');
        }
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server Error');
    }

});

// @route GET api/profile
// @desc get all profile
// @access public
router.get('/', async (req, res, next) => {
    try {
        const profiles = await Profile.find({}).populate('user', ['avatar', 'name']);
        res.json(profiles);
    } catch (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
    }

});

// @route GET api/profile/user/:user_id
// @desc get selected user profile
// @access public
router.get('/user/:user_id', async (req, res, next) => {
    try {
        const profile = await Profile.findOne({
            user: req.params.user_id
        }).populate('user', ['avatar', 'name']);

        if (!profile) return res.status(400).json({
            msg: "Profile not found."
        });
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        if (err.kind == 'ObjectId') {
            return res.status(400).json({
                msg: "Profile not found."
            });
        }
        return res.status(500).send("Server Error");
    }

});

// @route DELETE api/profile
// @desc DELETE user profile
// @access Private
router.delete('/', auth, async (req, res, next) => {
    try {
        // @todo -- remove user posts

        // remove user profile
        await Profile.findOneAndRemove({
            user: req.user.id
        });

        // remove user
        await User.findByIdAndRemove({
            _id: req.user.id
        });

        res.json({
            msg: "Deleted User profile."
        });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
    }

});

// @route PUT api/profile/experience
// @desc Add or update user profile experience
// @access Private

router.put('/experience', [auth, [
    check('title', 'Tile is required').not().isEmpty(),
    check('company', 'Company is required').not().isEmpty(),
    check('location', 'Location is required').not().isEmpty()
]], async (req, res, next) => {

    const {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    } = req.body;

    const newExp = {
        title,
        company,
        location,
        from,
        to,
        current,
        description
    };
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        const profile = await Profile.findOne({
            user: req.user.id
        });
        profile.experience.unshift(newExp);

        await profile.save();
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
    }

});

// @route DELETE api/profile/experience/:exp_id
// @desc delete experience by experience id
// @access Private
router.delete('/experience/:exp_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        });
        const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

        profile.experience.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);

    } catch (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
    }
});

// Education 
// @route PUT api/profile/education
// @desc Add or update user profile education
// @access Private

router.put('/education', [auth, [
    check('school', 'School is required').not().isEmpty(),
    check('degree', 'Degree is required').not().isEmpty(),
    check('from', 'From date is required').not().isEmpty(),
    check('to', 'To Date is required').not().isEmpty()
]], async (req, res, next) => {

    const {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    } = req.body;

    const newEdu = {
        school,
        degree,
        fieldofstudy,
        from,
        to,
        current,
        description
    };
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                errors: errors.array()
            });
        }
        const profile = await Profile.findOne({
            user: req.user.id
        });
        profile.education.unshift(newEdu);

        await profile.save();
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
    }

});

// @route DELETE api/profile/education/:edu_id
// @desc delete education by individual school id
// @access Private
router.delete('/education/:edu_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({
            user: req.user.id
        });
        const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

        profile.education.splice(removeIndex, 1);

        await profile.save();

        res.json(profile);

    } catch (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
    }
});


// @route GET api/profile/github/:username
// @desc get gihub repos by username
// @access Public
router.get('/github/:username', async (req, res, next) => {
    try {
        const options = {
            uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get('githubClientID')}&client_secret=${config.get('githubSecretKey')}`,
            method: 'GET',
            headers: {
                'user-agent': 'node.js'
            }
        }

        request(options, (err, response, body) => {
            if (err) console.error(err);

            if (response.statusCode !== 200) {
                return res.status(400).json({
                    msg: 'github profile is not available'
                });
            }

            res.json(JSON.parse(body));

        });

    } catch (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
    }

});

module.exports = router;