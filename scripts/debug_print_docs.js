const mongoose = require('mongoose');

(async function(){
  try{
    await mongoose.connect('mongodb://localhost:27017/eduwallet');
  // when placed under project's scripts/ folder, models are at ../src/models
  const PartnerCourse = require('../src/models/PartnerCourse');
  const PartnerSource = require('../src/models/PartnerSource');
  const Enrollment = require('../src/models/Enrollment');

  const courseId = new mongoose.Types.ObjectId('690f06faabdd39184012866f');
  const userId = new mongoose.Types.ObjectId('690f05b1e086901f037d6748');
  const sourceId = new mongoose.Types.ObjectId('690f05d9e086901f037d6759');

    const course = await PartnerCourse.findById(courseId).lean();
    const source = await PartnerSource.findById(sourceId).lean();
    const enrollment = await Enrollment.findOne({ user: userId, itemId: courseId }).lean();

    console.log('PartnerCourse =', JSON.stringify(course, null, 2));
    console.log('PartnerSource =', JSON.stringify(source, null, 2));
    console.log('Enrollment =', JSON.stringify(enrollment, null, 2));

    await mongoose.disconnect();
  }catch(err){
    console.error('Error:', err);
    process.exit(1);
  }
})();
