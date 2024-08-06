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
});

const Job = model("Job", jobSchema);

module.exports = Job;
