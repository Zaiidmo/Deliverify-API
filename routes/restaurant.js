const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const { createRestaurant, getAllRestaurants, getRestaurantById, updateRestaurant, deleteRestaurant} = require("../controllers/restaurantController");
const { validateRestaurant, validateFileSize } = require("../validations/restaurantValidation");
const upload = require("../config/multer");



const router = express.Router();

const validateRestaurantMiddleware = (req, res, next) => {
    const { isValid, message } = validateRestaurant(req.body);
    if (!isValid) {
      return res.status(400).json({ errors: message });
    }
    next();
  };
  router.post("/create", 
     authMiddleware,
     upload.fields([{ name: 'logo', maxCount: 1 }, { name: 'cover', maxCount: 1 }, { name: 'images', maxCount: 5 }]),validateRestaurantMiddleware, validateFileSize, createRestaurant );
  router.post('/upload', upload.single('file'), (req, res) => {
    res.json({ message: 'Fichier téléchargé avec succès!', file: req.file });
});

router.get("/", getAllRestaurants);
router.get("/:id", getRestaurantById);

router.put("/:id",
   authMiddleware,
   updateRestaurant);

router.delete("/:id", 
  authMiddleware,
   deleteRestaurant);


module.exports = router;