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

  public register = (req: express.Request, res: express.Response) => {
    const user = new this.db.models.User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
    });
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

  public login = (req: express.Request, res: express.Response) => {
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

  public authenticate = (req: express.Request, res: express.Response, next: express.NextFunction, success: () => void) => {
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

  public update = (req: IExpressRequest, res: express.Response) => {
    const queryId = req.params.userId;

    if (!req.user || req.user.id.toString() !== queryId) {
      res.status(401).json({
        message: 'Access denied',
      });

      return;
    }

    if (req.body.password !== req.body.passwordConfirm) {
      delete req.body.password;

      res.status(400).json({
        errors: {
          password: 'Invalid password update. Requires a matching password and passwordConfirm field',
        },
      });

      return;
    }

    // Always delete password confirmation since it will crash the model update
    delete req.body.passwordConfirm;

    // Assemble the body
    const update: any = {};
    if (req.body.name) {
      update.name = req.body.name;
    }
    if (req.body.email) {
      update.email = req.body.email;
    }
    if (req.body.password) {
      update.password = req.body.password;
    }

    this.db.models.User.findByIdAndUpdate(queryId,
      {$set: req.body},
      {
        runValidators: true,
        new: true,
      },
      (err, record) => {
        if (err) {
          res.status(400).json(err);
          return;
        }

        res.json(record);
      });
  }
}