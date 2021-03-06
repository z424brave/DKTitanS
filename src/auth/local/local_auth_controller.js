(function () {
    'use strict';

    let passport = require('passport');
    let authenticationService = require('../auth_service');

    let Global = require("../../core/titan_global");
    let Logger = require(`${Global.COMMON}/logger`);

    class LocalAuthController {

        authenticate(req, res, next) {
			Logger.info('authenticate');
            passport.authenticate('local', function (err, user, info) {
                Logger.info(`authenticate error : ${err}`);
                Logger.info(`authenticate user  : ${user}`);
                Logger.info(`authenticate info  : ${JSON.stringify(info)}`);
                var error = err || info;
                if (error) {
                    //TODO log error
                    return res.status(401).json(error);
                }
                if (! user) {

                    return res.status(500).json({message: 'Something went wrong, please try again.'});
                }

                var token = authenticationService.signToken(user._id, user.name, user.role);
                Logger.info(`authenticate token : ${token}`);
                res.json({token});
            })(req, res, next);
        }

    }

    module.exports = new LocalAuthController();

})();
