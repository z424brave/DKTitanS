(function () {
    'use strict';

    let passport = require('passport');
    let jwt = require('jsonwebtoken');
    let expressJwt = require('express-jwt');
    let compose = require('composable-middleware');
    let User = require('../user/user_model');
    
    const Config = require("config");

    let validateJwt = expressJwt({
        secret: Config.get("secrets.session.token")
    });


    class AuthenticationService {

        /**
         * Attaches the user object to the request if authenticated
         * Otherwise returns 403
         */
        isAuthenticated() {
            return compose()
            // Validate jwt
                .use(function (req, res, next) {
                    validateJwt(req, res, next);
                })
                // Attach user to request
                .use(function (req, res, next) {
                    User.findById(req.user._id)
                        .then(user => {
                            if (! user) {
                                return res.status(401).end();
                            }
                            req.user = user;
                            next();
                        })
                        .catch(err => next(err));
                });
        }

        /**
         * Checks if the user role meets the minimum requirements of the route
         */

        hasRole(roleRequired) {
            if (! roleRequired) {
                throw new Error('Required role needs to be set');
            }

            return compose()
                .use(this.isAuthenticated())
                .use(function meetsRequirements(req, res, next) {
                    
                    const userRoles = Config.has("roles.user") ? Config.get("roles.user") : [];
                    
                    if (userRoles.indexOf(req.user.role) >=
                        userRoles.indexOf(roleRequired)) {
                        next();
                    } else {
                        res.status(403).send('Forbidden');
                    }
                });
        }

        /**
         * Returns a jwt token signed by the app secret
         */

        signToken(id, name, role) {
            return jwt.sign({_id: id, name: name, role: role}, Config.get("secrets.session.token"), {
                expiresIn: (Config.has("secrets.session.expires") ? Config.get("secrets.session.expires") : "30 days")
            });
        }


    }

    module.exports = new AuthenticationService();


})();