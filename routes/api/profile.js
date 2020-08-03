const express = require('express');
const router = express.Router();
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

})

module.exports = router;