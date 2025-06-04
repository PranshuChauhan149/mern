import {v2 as cloudniary} from 'cloudinary';

const connectCloudinary = async ()=>{
  cloudniary.config({
cloud_name:process.env.CLOUDINARY_CLOUD_NAME,
  api_key:process.env.CLOUDINARY_API_KEY,
    api_secret :process.env.CLOUDINARY_API_SECRET 

  })
}

export default connectCloudinary;