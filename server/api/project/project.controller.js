/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/projects              ->  index
 * POST    /api/projects              ->  create
 * GET     /api/projects/:id          ->  show
 * PUT     /api/projects/:id          ->  upsert
 * PATCH   /api/projects/:id          ->  patch
 * DELETE  /api/projects/:id          ->  destroy
 */

'use strict';

import jsonpatch from 'fast-json-patch';
import { Project } from '../../sqldb';
// import sql from 'mssql';
import sql from 'seriate';


var config = {
    "server": process.env.SERVER,
    "user": process.env.SQL_USER,
    "password": process.env.SQL_PWD,
    "database": process.env.DATABASE
};

console.log(config);

sql.setDefaultConfig(config);

// sql.execute({
//     query: "SELECT * FROM [vgiryavets].[InitialDataSurvey]"
// }).then(function(results) {
//     console.log(results);
// }, function(err) {
//     console.log("Something bad happened:", err);
// });

function respondWithResult(res, statusCode) {
    statusCode = statusCode || 200;
    return function(entity) {
        if (entity) {
            return res.status(statusCode).json(entity);
        }
        return null;
    };
}

function patchUpdates(patches) {
    return function(entity) {
        try {
            // eslint-disable-next-line prefer-reflect
            jsonpatch.apply(entity, patches, /*validate*/ true);
        } catch (err) {
            return Promise.reject(err);
        }

        return entity.save();
    };
}

function removeEntity(res) {
    return function(entity) {
        if (entity) {
            return entity.destroy()
                .then(() => {
                    res.status(204).end();
                });
        }
    };
}

function handleEntityNotFound(res) {
    return function(entity) {
        if (!entity) {
            res.status(404).end();
            return null;
        }
        return entity;
    };
}

function handleError(res, statusCode) {
    statusCode = statusCode || 500;
    return function(err) {
        res.status(statusCode).send(err);
    };
}

// Gets a list of Projects
export function index(req, res) {
    var request = "select * FROM [WebGIS].[rpd].[MapApplicatonData] Where Project = 'OBAG'";
    console.log(request);
    sql.getPlainContext()
        .step("data", {
            query: request
                // optionally you could do this if the
                // above query were in a readUsers.sql file
                // query: sql.fromFile( "readUsers" );
        })
        .end(function(sets) {
            console.log(sets);
            res.json(sets.data);
            // sets has a "readUsers" property
            // which contains the results of the query
        })
        .error(function(err) {
            console.log(err);
            res.json(err);
        });


    // return Project.findAll()
    //     .then(respondWithResult(res))
    //     .catch(handleError(res));
}

// Gets a single Project from the DB
export function show(req, res) {
    return Project.find({
            where: {
                _id: req.params.id
            }
        })
        .then(handleEntityNotFound(res))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Creates a new Project in the DB
export function create(req, res) {
    return Project.create(req.body)
        .then(respondWithResult(res, 201))
        .catch(handleError(res));
}

export function addMap(req, res) {
    var data = req.body;
    var dateAdded = new Date();
    // console.log(req.body);
    // sql.execute({
    //     query: "SELECT * FROM [vgiryavets].[InitialDataSurvey]"
    // }).then(function(results) {
    //     console.log(results);
    //     res.json(results);
    // }, function(err) {
    //     console.log("Something bad happened:", err);
    //     res.json(err);
    // });


    var updateMember = function(Id, wkt, project) {
        return sql.execute({
            procedure: "[rpd].[sp_InsertMappingDataApplication]",
            params: {
                Id: {
                    type: sql.NVARCHAR(60),
                    val: Id
                },
                WKT: {
                    type: sql.NVARCHAR(),
                    val: wkt
                },
                Project: {
                    type: sql.NVARCHAR(),
                    val: project
                },
                Date: {
                    type: sql.DateTime2,
                    val: dateAdded
                }
            }
        });
    };

    console.log(data.Id, ": Id");
    console.log(data.wkt);
    updateMember(data.Id, data.wkt, data.name)
        .then(results => {
            console.log(results);
            res.json(results);
        })
        .catch(err => {
            console.log(err);
            res.json(err);
        });

}

// Upserts the given Project in the DB at the specified ID
export function upsert(req, res) {
    if (req.body._id) {
        Reflect.deleteProperty(req.body, '_id');
    }

    return Project.upsert(req.body, {
            where: {
                _id: req.params.id
            }
        })
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Updates an existing Project in the DB
export function patch(req, res) {
    if (req.body._id) {
        Reflect.deleteProperty(req.body, '_id');
    }
    return Project.find({
            where: {
                _id: req.params.id
            }
        })
        .then(handleEntityNotFound(res))
        .then(patchUpdates(req.body))
        .then(respondWithResult(res))
        .catch(handleError(res));
}

// Deletes a Project from the DB
export function destroy(req, res) {
    var id = req.params.id;
    var deleteMap = function(Id) {
        return sql.execute({
            procedure: "[rpd].[sp_DeleteMappingDataApplication]",
            params: {
                Id: {
                    type: sql.NVARCHAR(60),
                    val: Id
                }
            }
        });
    };


    deleteMap(id)
        .then(results => {
            console.log(results);
            res.json(results);
        })
        .catch(err => {
            console.log(err);
            res.json(err);
        });
}