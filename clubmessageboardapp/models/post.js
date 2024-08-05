const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const PostSchema = new Schema({
  message: { type: String, required: true, maxLength: 100, minLength: 3 },
  date: { type: Date, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

PostSchema.virtual("date_formatted").get(function () {
  return DateTime.fromJSDate(this.date).toFormat("yyyy-MM-dd HH:mm:ss");
});

// Export model
module.exports = mongoose.model("Post", PostSchema);
