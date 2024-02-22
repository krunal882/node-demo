exports.login = (req, res) => {
    res.status(200).render('login', {
        title: 'Login',
    })
}

exports.signup = (req, res) => {
    res.status(200).render('signup', {
        title: 'Signup',
    })
}