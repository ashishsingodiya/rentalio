export const addListing = async (req, res) => {
  try {
    const { _id } = req.user;
    let property = JSON.parse(req.body.propertyData);
    const images = []
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
