const { default: mongoose } = require("mongoose");
const Patient = require("../models/patient.model");
const User = require("../models/user.model");
const cloudinary = require("../services/cloudinary.service"); 
const getPatients = async (req, res) => {
  try {
    const Patients = await Patient.find({});
    res.status(200).json(Patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPatient = async (req, res) => {
  try {
    const { id } = req.params;  
    const [aggregatedPatient] = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id), accountType: 'Patient' } },
      {
        $lookup: {
          from: 'Patient',
          localField: '_id',
          foreignField: 'userId',
          as: 'profile'
        }
      },
      { $unwind: { path: '$profile', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          fullName: 1,
          email: 1,
          accountType: 1,
          age: '$profile.age',
          gender: '$profile.gender',
          dept: '$profile.dept',
          major: '$profile.major',
          course: '$profile.course',
          imageUrl: '$profile.imageUrl'
        }
      }
    ]);

    if (!aggregatedPatient) return res.status(404).json({ message: 'Patient not found' });
    res.status(200).json(aggregatedPatient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const createPatient = async (req, res) => {

  try{
    const patientData=req.body;
    if(req.file){
      patientData.imageUrl=req.file.path;
      patientData.cloudinaryId=req.file.filename;
    }    
    const Patient =  await Patient.create(patientData);
    res.status(201).json(Patient);
  }catch(error){
    console.error("Error creating Patient: ".error);
    res.status(500).json({message: error.message});
  }
}
const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if(req.file){
      updateData.imageUrl=req.file.path;
      updateData.cloudinaryId=req.file.filename;
    }
    const updatedPatient = await Patient.findByIdAndUpdate(id, updateData, {new: true});
    
    if (!updatedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.status(200).json(Patient);
  } catch (error) {
    console.error("Error updating Patient: ",error);
    res.status(500).json({ message: error.message });
  }
};

const updatePatientProfile=async(req, res)=>{
  try{
    const userId=req.user.id;
    const user=await User.findById(userId);
    if(!user) return res.status(404).json({message: 'User not found'});
    if(user.accountType!='Patient')
        return res.status(400).json({message: "You don't have permissions to edit this !!"});
    const profileData=req.body;
    if(req.file){
      profileData.imageUrl=req.file.path;
      profileData.cloudinaryId=req.file.filename;
    }
    const updatedProfile=await Patient.findOneAndUpdate(
      {userId: userId},
      {...profileData, userId: userId},
      {new: true, upsert: true, setDefaultsOnInsert: true}
    );
    res.status(200).json(updatedProfile);
  }catch(error){
    console.error("Profile update error: ",error);
    res.status(500).json({message: error.message});
  }
}

const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPatient = await Patient.findByIdAndDelete(id);

    if (!deletedPatient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    if(deletedPatient.cloudinaryId){
      await cloudinary.uploader.destroy(Patient.cloudinaryId);
    }

    res.status(200).json({ message: "Patient deleted successfully" });
  } catch (error) {
    console.error("Error deleting Patient: ",error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPatients,
  getPatient,
  createPatient,
  updatePatient,
  deletePatient,
  updatePatientProfile
};
