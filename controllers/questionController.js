const { where, QueryTypes } = require("sequelize");
const { questions, users, answers, sequelize } = require("../database");
const fs = require("fs");

exports.renderAskQuestionPage = (req, res) => {
  res.render("questions/askQuestion");
};

exports.askQuestion = async (req, res) => {
  const { title, description } = req.body;
  console.log(req.body);
  console.log(req.file);
  const userId = req.userId;
  const fileName = req.file.filename;

  if (!title || !description) {
    return res.send("Please provide required field");
  }

  await questions.create({
    title,
    description,
    image: fileName,
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
  // find the blog with coming id
  const id = req.params.id;
  const existingQuestion = await questions.findAll({
    where: {
      id: id,
    },
  });
  res.render("questions/editQuestion", {
    existingQuestion: existingQuestion,
  });
};

exports.haldleEditQuestion = async (req, res) => {
  try {
    const id = req.params.id;
    const { title, description } = req.body;
    let fileName;
    if (req.file) {
      fileName = req.file.filename;
    }
    const editQuestion = await questions.findAll({
      where: {
        id: id,
      },
    });

    const oldData = await questions.findAll({
      where: {
        id: id,
      },
    });
    console.log(oldData);

    const oldFileName = oldData[0].image;

    const lengthToCut = "http://localhost:3001/".length;

    const oldFileNameAfterCut = oldFileName.slice(lengthToCut);

    if (fileName) {
      // delete old because naya aairaxa
      fs.unlink("./uploads/" + oldFileNameAfterCut, (err) => {
        if (err) {
          console.log("error occured", err);
        } else {
          console.log("Old File Deleted successfully");
        }
      });
    }

    await questions.update(
      {
        title,
        description,
        image: fileName ? process.env.BACKEND_URL + fileName : oldFileName,
      },
      {
        where: {
          id: id,
        },
      }
    );

    res.redirect("/questions/editQuestion/" + id);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error loading the edit question page");
  }
};
