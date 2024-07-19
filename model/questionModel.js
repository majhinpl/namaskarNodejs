module.exports = (sequelize, DataTypes) => {
  const Question = sequelize.define("question", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    image: {
      type: DataTypes.STRING,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });
  return Question;
};
