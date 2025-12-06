const { default: mongoose } = require("mongoose");
const Doctor = require("../models/doctor.model");
const User = require("../models/user.model");
const cloudinary = require("../services/cloudinary.service"); 
const getDoctors = async (req, res) => {
  try {
    const Doctors = await Doctor.find({});
    res.status(200).json(Doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDoctor = async (req, res) => {
  try {
    const { id } = req.params;  
    const [aggregatedDoctor] = await User.aggregate([
      { $match: { _id: new mongoose.Types.ObjectId(id), accountType: 'Doctor' } },
      {
        $lookup: {
          from: 'Doctor',
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

    if (!aggregatedDoctor) return res.status(404).json({ message: 'Doctor not found' });
    res.status(200).json(aggregatedDoctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createDoctor = async (req, res) => {

  try{
    const doctorData=req.body;
    if(req.file){
      doctorData.imageUrl=req.file.path;
      doctorData.cloudinaryId=req.file.filename;
    }    
    const Doctor =  await Doctor.create(doctorData);
    res.status(201).json(Doctor);
  }catch(error){
    console.error("Error creating Doctor: ".error);
    res.status(500).json({message: error.message});
  }
}

const updateDoctorProfile=async(req, res)=>{
  try{
    const userId=req.user.id;
    const user=await User.findById(userId);
    if(!user) return res.status(404).json({message: 'User not found'});
    if(user.accountType!='Doctor')
        return res.status(400).json({message: "You don't have permissions to edit this !!"});
    const profileData=req.body;
    if(req.file){
      profileData.imageUrl=req.file.path;
      profileData.cloudinaryId=req.file.filename;
    }
    const updatedProfile=await Doctor.findOneAndUpdate(
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

const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    if(req.file){
      updateData.imageUrl=req.file.path;
      updateData.cloudinaryId=req.file.filename;
    }
    const Doctor = await Doctor.findByIdAndUpdate(id, updateData, {new: true});
    if (!Doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json(Doctor);
  } catch (error) {
    console.error("Error updating Doctor: ",error);
    res.status(500).json({ message: error.message });
  }
};

const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedDoctor = await Doctor.findByIdAndDelete(id);

    if (!deletedDoctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    if(deletedDoctor.cloudinaryId){
      await cloudinary.uploader.destroy(Doctor.cloudinaryId);
    }

    res.status(200).json({ message: "Doctor deleted successfully" });
  } catch (error) {
    console.error("Error deleting Doctor: ",error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDoctors,
  getDoctor,
  createDoctor,
  updateDoctor,
  updateDoctorProfile,
  deleteDoctor,
};
