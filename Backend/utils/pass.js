'use strict';
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const {getUserLogin} = require('../models/userModel');
const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

// local strategy for username password login
passport.use(new Strategy(
  async (username, password, done) => {
    const params = [username];
    try {
      const [user] = await getUserLogin(params);
      if (user === undefined) {
        return done(null, false, {message: 'Väärä sähköposti'});
      }
      if (!bcrypt.compareSync(password, user.password)) {
        return done(null, false, {message: 'Väärä salasana'});
      }
      delete user.password;
      return done(null, {...user}, {message: 'Olet kirjautunut sisään'}); // use spread syntax to create shallow copy to get rid of binary row type
    } catch (err) {
      return done(err);
    }
  }));

// TODO: JWT strategy for handling bearer token
passport.use(new JWTStrategy(
  {
    jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'tw34y5ktugijl',
  }, (jwtPayload, done) => {
    done(null, jwtPayload);
  }));

// consider .env for secret, e.g. secretOrKey: process.env.JWT_SECRET

module.exports = passport;