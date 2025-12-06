const Disease = require("../models/disease.model");
 
const getDiseases = async (req, res) => {
  try {
    const Diseases = await Disease.find({});
    res.status(200).json(Diseases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDisease = async (req, res) => {
  try {
    const { id } = req.params;
    const Diseases = await Disease.findById(id);
    res.status(200).json(Diseases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createDisease = async (req, res) => {

  try{

    const {userId}=req.params;
    const {name, code, dept}=req.body;
    if(req.user.id.toString()!==userId){
      return res.status(403).json({message: "You can only create Diseases for yourself!"})
    }

    const diseaseData = await Disease.create({
      userId,
      name,
      code, dept
    });
    res.status(201).json(diseaseData);
  }catch(error){
    console.error("Error creating Disease: ".error);
    if (error.code === 11000) {
      return res.status(400).json({ message: "You already have a Disease with this code" });
    }
    res.status(500).json({message: error.message});
  }
}
const updateDisease = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const diseaseData = await Disease.findByIdAndUpdate(id, updateData, {new: true});
    if (!diseaseData) {
      return res.status(404).json({ message: "Disease not found" });
    }
    if(diseaseData.userId.toString()!=req.user.id.toString()&& req.user.role!=='admin'){
      return res.status(403).json({message: "You can only update your own Diseases "})
    }
    const updatedDisease=await Disease.findByIdAndUpdate(
      id, updateData, {new : true, runValidators: true}
    );

    res.status(200).json(Disease);
  } catch (error) {
    console.error("Error updating Disease: ",error);
    res.status(500).json({ message: error.message });
  }
};

const deleteDisease = async (req, res) => {
  try {
    const { id } = req.params;

    const diseaseData = await Disease.findByIdAndDelete(id);

    if (!diseaseData.userId.toString()!==req.userr.id.toString()&& req.user.role!=='admin') {
      return res.status(404).json({ message: "Disease not found" });
    }
    await Disease.findByIdAndDelete(id);
    res.status(200).json({ message: "Disease deleted successfully" });
  } catch (error) {
    console.error("Error deleting Disease: ",error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDiseases,
  getDisease,
  createDisease,
  updateDisease,
  deleteDisease,
};
