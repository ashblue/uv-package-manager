import * as express from 'express';
import {userConfig} from './user-config';

import jwt = require('jwt-simple');
import passport = require('passport');
import passportJWT = require('passport-jwt');
import {Database} from '../databases/database';
import {IExpressRequest} from '../../helpers/interfaces/i-express-request';

export class CtrlUser {
  constructor (private db: Database) {
    const strategy = new passportJWT.Strategy({
      secretOrKey: userConfig.jwtSecret,
      jwtFromRequest: passportJWT.ExtractJwt.fromAuthHeaderAsBearerToken(),
    }, (payload, done) => {
      db.models.User.findById(payload.id, (err, user) => {
        if (err) {
          return done(err, false);
        }

        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      });
    });

    passport.use(strategy);
  }

  public register (req: express.Request, res: express.Response) {
    const user = new this.db.models.User(req.body);
    user.save((err, user) => {
      if (err) {
        res.status(500).json(err);
        return;
      }

      if (user == null) {
        res.status(500).json({message: 'Could not generate user'});
        return;
      }

      res.json(user);
    });
  }

  public login (req: express.Request, res: express.Response) {
    const email = req.body.email;
    const password = req.body.password;

    const user = this.db.models.User;
    user.findOne({email, password}, (err, user) => {
      if (err) {
        res.status(401).json(err);
        return;
      }

      if (!user) {
        res.status(401).json({
          message: 'Invalid login credentials',
        });
        return;
      }

      const token = jwt.encode({id: user.id}, userConfig.jwtSecret);
      res.json({
        token,
        user,
      });
    });
  }

  public authenticate (req: express.Request, res: express.Response, next: express.NextFunction, success: () => void) {
    passport.authenticate('jwt', userConfig.jwtSession, (err, user, info) => {
      if (err) {
        return next(err); // will generate a 500 error
      }
      // Generate a JSON response reflecting authentication status
      if (!user) {
        return res.status(401)
          .send({
            message: 'Authentication failed',
          });
      }

      req['user'] = user;

      success();
    })(req, res, next);
  }

  public update (req: IExpressRequest, res: express.Response) {
    const queryId = req.params.userId;

    if (!req.user || req.user.id.toString() !== queryId) {
      res.status(401).json({
        message: 'Access denied',
      });

      return;
    }

    this.db.models.User.findByIdAndUpdate(queryId,
      {$set: req.body},
      {
        runValidators: true,
        new: true,
      },
      (err, record) => {
        if (err) {
          res.status(404).json(err);
          return;
        }

        res.json(record);
      });

    // Handle bulk details update
    // Handle password with confirm field
    // Verfiy the user matches their ID
  }
}
