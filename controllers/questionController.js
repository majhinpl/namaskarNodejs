const { QueryTypes } = require("sequelize");
const { questions, users, answers, sequelize } = require("../database");
const fs = require("fs");
const path = require("path");

exports.renderAskQuestionPage = (req, res) => {
  res.render("questions/askQuestion");
};

exports.askQuestion = async (req, res) => {
  const { title, description } = req.body;
  console.log(req.file);

  const userId = req.userId;
  const fileName = req.file.filename;

  const result = await CloudinaryStorage.v2.uploader.upload(req.file.path);
  console.log(result);

  if (!title || !description) {
    return res.send("Please provide required field");
  }

  await questions.create({
    title,
    description,
    image: result.url,
    userId,
  });
  res.redirect("/");
};

exports.getAllQuestion = async (req, res) => {
  const data = await questions.findAll({
    include: [
      {
        model: users,
      },
    ],
  });
};

exports.renderSingleQuestionPage = async (req, res) => {
  const { id } = req.params;
  const data = await questions.findAll({
    where: {
      id: id,
    },
    include: [
      {
        model: users,
        attributes: ["username"],
      },
    ],
  });

  let likes;
  let count = 0;

  try {
    likes = await sequelize.query(`SELECT * FROM likes_${id}`, {
      type: QueryTypes.SELECT,
    });
    if (likes.length) {
      count = likes.length;
    }
  } catch (error) {
    console.log(error);
  }

  const answersData = await answers.findAll({
    where: {
      questionId: id,
    },
    include: [
      {
        model: users,
        attributes: ["username"],
      },
    ],
  });
  res.render("./questions/singleQuestion", {
    data,
    answers: answersData,
    likes: count,
  });
};

exports.renderEditQuestionPage = async (req, res) => {
  const { id } = req.params;

  try {
    const existingQuestion = await questions.findAll({
      where: { id: id },
    });

    if (!existingQuestion) {
      return res.status(404).send("Question not found");
    }

    res.render("questions/editQuestion", { question: existingQuestion });
  } catch (error) {
    console.error("Error fetching the question:", error);
    res.status(500).send("An error occurred");
  }
};

exports.handleEditQuestion = async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description } = req.body;

    const oldData = await questions.findAll({
      where: { id: id },
    });

    let fileName;
    if (req.file) {
      fileName = req.file.filename;

      const oldFileName = oldData[0].image;
      const lengthToCut = "http://localhost:3001/".length;
      const oldFileNameAfterCut = oldFileName.slice(lengthToCut);

      if (fileName) {
        // Delete old file if new file is uploaded
        fs.unlink(
          path.join(__dirname, "..", "storage", oldFileNameAfterCut),
          (err) => {
            if (err) {
              console.log("Error occurred while deleting old file:", err);
            } else {
              console.log("Old file deleted successfully");
            }
          }
        );
      }
    } else {
      fileName = oldData[0].image;
    }

    if (!oldData) {
      return res.status(404).send("Question not found");
    }

    await questions.update(
      {
        title,
        description,
        image: fileName ? fileName : oldFileName,
      },
      {
        where: {
          id: id,
        },
      }
    );

    res.redirect("/question/" + id);
  } catch (error) {
    console.error("Error updating the question:", error);
    res.status(500).send("Error updating the question");
  }
};

exports.handleDeleteQuestion = async (req, res) => {
  const id = req.params.id;
  await questions.destroy({
    where: {
      id: id,
    },
  });

  res.redirect("/");
};
