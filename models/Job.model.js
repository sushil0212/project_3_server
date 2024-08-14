//job.model.js
const { Schema, model } = require("mongoose");
const jobSchema = new Schema({
  industry: { type: String, required: true },
  businessName: { type: String, required: true },
  mobileNo: { type: String, required: true },
  email: { type: String, required: true },
  companyWebsite: { type: String },
  details: { type: String, required: true },
  contact: { type: String },
  address: { type: String },
  description: { type: String },
  shortId: { type: Schema.Types.ObjectId, ref: "Short" },
});

const Job = model("Job", jobSchema);

module.exports = Job;
