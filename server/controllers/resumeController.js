import fs from 'fs';
import Resume from '../models/Resume.js';
import imagekit from '../configs/imagekit.js';

// controller for creating a new resume
// POST: /api/resumes/create
export const createResume = async (req, res) => {
    try {
        const userId = req.userId;
        const { title } = req.body;

        // create new resume
        const newResume = await Resume.create({userId, title});

        // return success message
        return res.status(201).json({message: "Resume created successfully", resume: newResume});
        
    } catch (err) {
        console.error(err); // Log actual error
        return res.status(400).json({message: err.message});
    }
}

// controller for deleting a resume
// POST: /api/resumes/delete
export const deleteResume = async (req, res) => {
    try {
        const userId = req.userId;
        const {resumeId} = req.params;

        await Resume.findOneAndDelete({userId, _id: resumeId});
        return res.status(200).json({message: "Resume deleted successfully"});
    } catch (err) {
        return res.status(400).json({message: err.message});
    }
}

// get user resume by id
// GET: /api/resumes/get
export const getResumeById = async (req, res) => {
    try {
        const userId = req.userId;
        const {resumeId} = req.params;

        const resume = await Resume.findOne({userId,_id: resumeId});
        
        if(!resume) return res.status(404).json({message: "Resume not found"});

        resume.__v = undefined;
        resume.createdAt = undefined;
        resume.updatedAt = undefined;

        return res.status(200).json({resume});

    } catch (err) {
        return res.status(400).json({message: err.message});
    }
}

// get resume by id Public
// GET: /api/resumes/public

export const getPublicResumeById = async (req, res) => {
    try {
        const {resumeId} = req.params;
        const resume = await Resume.findOne({public: true, _id: resumeId});
        if(!resume) return res.status(404).json({message: "Resume not found"});
        return res.status(200).json({resume});

    } catch (err) {
        return res.status(400).json({message: err.message});
    }
}


// controller for updating a resume
// PUT: /api/resumes/update
export const updateResume = async (req, res) => {
    try {

        const userId = req.userId;
        const {resumeId, resumeData, removeBackground} = req.body;
        const image = req.file;

        let resumeDataCopy;
        if(typeof resumeData === 'string') {
            resumeDataCopy = await JSON.parse(resumeData);
        }else{
            resumeDataCopy = structuredClone(resumeData);
        }
       
        if(image){

            const imageBufferData = fs.createReadStream(image.path);

            const response = await imagekit.files.upload({
            file: imageBufferData,
            fileName: 'resume.png',
            folder: 'user-resumes',
            transformation: {
                pre: 'w-300,h-300,fo-face,z-0.75' + (removeBackground ? ',e-bgremove' : '')
            }
            });

            resumeDataCopy.personal_info.image = response.url;

        }

        const resume = await Resume.findOneAndUpdate({userId, _id: resumeId}, resumeDataCopy, {new: true});
        


        return res.status(200).json({message: "Saved successfully", resume});

    } catch (err) {
        return res.status(400).json({message: err.message});
    }
}