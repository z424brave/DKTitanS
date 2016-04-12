(function () {
    'use strict';

    let Node = require('../node_model');
    let _ = require('lodash');

    const Global = require("../../core/titan_global");
    const BaseController = require(`${ Global.CORE}/controllers/base_controller`);
    const Logger = require(`${ Global.COMMON}/logger`);


    class NodeController extends BaseController {

        constructor() {
            super();
        }

        /**
         * Get a single node
         */
        get(req, res, next) {
            var id = req.params.id;
            Node.findById(id)
                .populate('type')
                .exec(function (err, result) {
                    if (err) {
                        Logger.error(err);
                        res.status(5000).json(err);
                    }
                    res.json(result);
                });
        }

        /**
         * Create a node
         */
        save(req, res, next) {
			Logger.info(`Node save start`);
            Logger.info(`${req.body}`);
            Logger.info(`Node save end`);
            var node = req.body;
            node.type = node.type._id;
            var tagIds = [];
            for(var tag of node.tags){
                tagIds.push(tag._id);
            }
            node.tags = tagIds;
            var newNode = new Node(node);
            newNode.status = 'active';
            newNode.save()
                .then(node => node = node[0])
                .then(super.responseWithResult(res))
                .catch(super.handleError(res));
        }


        findUserNodes(req, res, next) {
            var userId = req.params.userId;
            Logger.info(`in findUserNodes - ${userId}`);
            Node.find({user: userId, status: 'active'})
                .populate('user', 'name')
                .populate('type', 'name')
                .exec(function (err, result) {
                    if (err) {
                        Logger.error(err);
                        res.status(5000).json(err);
                    }
                    res.json(result);
                });

        }


        /**
         * Update a node
         */
        update(req, res, next) {
            Logger.info(`Node update start`);
            Logger.info(`${req.body}`);
            Logger.info(`Node update end`);
            var inputNode = req.body;
            var that = this;
            Node.findByIdAndUpdate(
                inputNode._id, {
                    $set: {
                        name: inputNode.name,
                        tags: inputNode.tags
                    }
                })
                .then(super.handleEntityNotFound(res))
                .then(entity => {
                    Node.findById(entity._id)
                        .populate('type')
                        .exec(function (err, result) {
                            if (err) {
                                Logger.error(err);
                                res.status(500).json(err);
                            }
                            res.json(result);
                        });
                })
                .catch(err => next(err));
        }


        delete(req, res, next) {
            var id = req.params.id;
            Node.findByIdAndUpdate(
                id, {
                    $set: {
                        status: 'deleted'
                    }
                })
                .then(super.handleEntityNotFound(res))
                .then(entity => res.status(200))
                .catch(err => next(err));
        }

    }







    module.exports = NodeController;


})();