const passport = require('passport');
const bcrypt = require('bcrypt');

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/');
}

module.exports = (app, myDatabase) => {
  app.get('/', (req, res) => {
    res.render('pug', {
      title: 'Connected to Database',
      message: 'Please login',
      showLogin: true,
      showRegistration: true,
      showSocialAuth: true
    });
  });

  app.post('/login', passport.authenticate('local', { failureRedirect: '/' }), (req, res) => {
    res.redirect('/profile')
  });

  app.get('/profile', ensureAuthenticated, (req, res) => {
    res.render(process.cwd() + '/views/pug/profile', {
      username: req.user.username
    });
  });

  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  app.route('/register')
    .post((req, res, next) => {
      const hash = bcrypt.hashSync(req.body.password, 12);
      myDataBase.findOne({ username: req.body.username }, (err, user) => {
        if (err) next(err);
        else if (user) res.redirect('/');
        else {
          myDataBase.insertOne({
            username: req.body.username,
            password: hash
          }, (err, doc) => {
            console.log(doc.ops);
            if (err) res.redirect('/');
            else next(null, doc.ops[0]);
          });
        }
      })
    },
    passport.authenticate('local', { failureRedirect: '/' }),
    (req, res, next) => {
      res.redirect('/profile');
    }
  );

  app.get('/auth/github', (req, res) => passport.authenticate('github'));

  app.route('/auth/github/callback')
    .get((req, res) => passport.authenticate('github', { failureRedirect: '/' }), (req, res) => {
      req.session.user_id = req.user.id;
      res.redirect('/chat')
      });

  app.get('/chat', ensureAuthenticated, (req, res) => res.render(process.cwd() + '/views/pug/chat', { user: req.user }))

  app.use((req, res, next) => {
    res.status(404)
      .type('text')
      .send('Not Found');
  });

  /* The following challenges will make use of the chat.pug file. So, in your routes.js file, add a GET route pointing to /chat which makes use of ensureAuthenticated, and renders chat.pug, with { user: req.user } passed as an argument to the response. Now, alter your existing /auth/github/callback route to set the req.session.user_id = req.user.id, and redirect to /chat. */

  require('./auth.js')(app, myDatabase);
}