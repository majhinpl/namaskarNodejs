const { answers } = require("../database");

exports.handleAnswer = async (req, res) => {
  const userId = req.userId;
  const { answer } = req.body;
  const { id: questionId } = req.params;

  await answers.create({
    answerText: answer,
    userId,
    questionId,
  });
  res.redirect(`/question/${questionId}`);
};
