const router = require("express").Router();
const {
  renderAskQuestionPage,
  askQuestion,
  renderSingleQuestionPage,
  renderEditQuestionPage,
  handleEditQuestion,
  handleDeleteQuestion,
} = require("../controllers/questionController");
const { isAuthenticated } = require("../middleware/isAuthenticated");

const { multer, storage } = require("../middleware/multerConfig");
const { errorHandler } = require("../utils/catchAsyncError");
const upload = multer({ storage: storage });

router
  .route("/askQuestion")
  .get(isAuthenticated, renderAskQuestionPage)
  .post(isAuthenticated, upload.single("image"), errorHandler(askQuestion));

router.route("/question/:id").get(renderSingleQuestionPage);

router
  .route("/edit/:id")
  .get(isAuthenticated, errorHandler(renderEditQuestionPage))
  .post(
    isAuthenticated,
    upload.single("image"),
    errorHandler(handleEditQuestion)
  );

router.route("/delete/:id").get(isAuthenticated, handleDeleteQuestion);

module.exports = router;
