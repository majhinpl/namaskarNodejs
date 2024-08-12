const {
  renderAskQuestionPage,
  askQuestion,
  renderSingleQuestionPage,
  renderEditQuestionPage,
} = require("../controllers/questionController");
const { isAuthenticated } = require("../middleware/isAuthenticated");

const { multer, storage } = require("../middleware/multerConfig");
const upload = multer({ storage: storage });

const router = require("express").Router();

router
  .route("/askQuestion")
  .get(renderAskQuestionPage)
  .post(isAuthenticated, upload.single("image"), askQuestion);

router.route("/question/:id").get(renderSingleQuestionPage);
router.route("/edit/:id").get(renderEditQuestionPage);

module.exports = router;
