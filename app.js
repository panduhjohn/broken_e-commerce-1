mongoose.connect(process.env.MONGODB_URI, 
                { useNewUrlParser: true, useUnifiedTopology: true,
                useCreateIndex: true })
        .then(   () => console.log('MongoDB Connected'))
        .catch( err => console.log(`MongoDB Error: ${err}`))

let app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(methodOverride('_method'))

app.use(session({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    store: new MongoStore({
        url: process.env.MONGODB_URI,
        autoReconnect: true
    }),
    cookie: {
        secure: false,
        maxAge: 365 * 24 * 60 * 60 * 1000
    }
}))

app.use(flash())

app.use(passport.initialize())
app.use(passport.session())


app.use(expressValidator({
    errorFormatter: (param, message, value) => {
        let namespace = param.split('.')
        let root      = namespace.shift()
        let formParam = root

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']'
        }

        return {
            param:   formParam,
            message: message,
            value:   value
        }
    }
}))

app.use((req, res, next) => {
    res.locals.user = req.user

    res.locals.errors        = req.flash('errors')
    res.locals.success       = req.flash('success')
    res.locals.loginMessage  = req.flash('loginMessage')
    res.locals.errorValidate = req.flash('errorValidate')
    
    next()
})

app.use((req, res, next) => {
    Category.find({})
            .then(categories => {
                res.locals.categories = categories

                next()
            })
            .catch(error => next(error))
})

// app.use(cartMiddleware)

app.use('/', indexRouter);
app.use('/api/cart', cartRouter);
app.use('/api/users', usersRouter);
app.use('/api/admin', adminRouter);
app.use('/api/products', productsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error   = req.app.get('env') === 'development' ? err : {};

    // TODO: add flash

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;