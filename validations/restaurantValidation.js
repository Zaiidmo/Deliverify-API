const validateRestaurant = (data) => {
    const errors = [];
  
    if (!data.name) {
      errors.push("Name is required");
    }
  
    if (!data.address) {
      errors.push("Address is required");
    }

    if (!data.phoneNumber) {
      errors.push("Phone number is required");
    } else {
      const phoneRegex = /^[0-9]{10,14}$/;
      if (!phoneRegex.test(data.phoneNumber)) {
        errors.push("Phone number must be between 10 and 14 digits");
      }
    }
  
    if (data.logo && typeof data.logo !== 'string') {
      errors.push("Logo must be a string if provided");
    }
    
  
    if (data.images) {
        if (!Array.isArray(data.images)) {
            errors.push("Images must be an array");
        } else if (data.images.length > 5) {
            errors.push("You can upload a maximum of 5 images");
        }
    }

    if (!data.location) {
      errors.push("Location is required");
    } else if (data.location.type !== "Point" || !Array.isArray(data.location.coordinates) || data.location.coordinates.length !== 2) {
      errors.push("Location must be a Point with coordinates array of two numbers");
    }
  
    if (!data.openAt) {
      errors.push("Opening time is required");
    }
  
 
    if (!data.closeAt) {
      errors.push("Closing time is required");
    }
  

    if (!data.category) {
      errors.push("Category is required");
    } else {
      if (!data.category.name || !data.category.description) {
        errors.push("Category must have name and description");
      }
    }
  
    return {
      isValid: errors.length === 0,
      message: errors.length > 0 ? errors.join(", ") : null,
    };
  };
  
  const validateFileSize = (req, res, next) => {
    const maxSize = 1024 * 1024 * 5; 
    const files = req.files|| {}; 
 
    if (files.logo && files.logo.size > maxSize) {
      return res.status(400).json({ message: "Logo must be less than 5MB" });
    }
    
    if (files.cover && files.cover.size > maxSize) {
      return res.status(400).json({ message: "Cover must be less than 5MB" });
    }
  
    if (files.images) {
      if (files.images.length > 5) {
        return res.status(400).json({ message: "You can upload a maximum of 5 images" });
      }
      for (let image of files.images) {
        if (image.size > maxSize) {
          return res.status(400).json({ message: "Each image must be less than 5MB" });
        }
      }
    }
  
    next();
  };
  
  module.exports = { validateRestaurant, validateFileSize };
