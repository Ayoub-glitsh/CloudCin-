const mongoose = require('mongoose');

const filmSchema = new mongoose.Schema(
  {
    codefilm: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    titre: {
      type: String,
      required: true,
      trim: true,
    },
    datepublication: {
      type: Date,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    miniature: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Film', filmSchema);
