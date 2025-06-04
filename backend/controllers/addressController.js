import Address from "../models/Address.js";

export const addAddress = async (req, res) => {
  try {
    const { address, userId } = req.body;

    // Combine userId into the address object
    await Address.create({ ...address, userId });

    res.json({ success: true, message: "Address added successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

export const getAddress = async (req, res) => {
  try {
   const userId = req.query.userId;
 
    const addresses  = await Address.find({userId})

  res.json({success:true,addresses})
    
   
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

