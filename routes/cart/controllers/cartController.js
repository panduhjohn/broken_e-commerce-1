module.exports = {
    createUserCart: (req, res) => {
        let cart = new Cart()

        cart.owner = req.user._id

        cart.save((error) => {
            if (error) {
                res.status(500).json({
                    confirmation: 'failure',
                    message: error
                })
            } else {
                res.redirect('/')
            }
        })
    }
}