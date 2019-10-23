const router = express.Router();

/* GET home page. */
router.get('/', productController.getPageIfUserLoggedIn);

router.get('/page/:page', paginate)

module.exports = router;
