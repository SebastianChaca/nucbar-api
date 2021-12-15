const mongoose = require('mongoose');

constSectionchema = mongoose.Schema({
  title: {
    required: true,
    type: String,
  },
  category: {
    required: true,
    type: String,
  },
});

module.exports = mongoose.model('Section', Sectionschema);
