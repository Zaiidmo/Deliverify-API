const statisticManager = require("../services/statisticManagerService");


const getAllStatisticsResto = async (req, res) => {
try{
    const owneId = req.user._id;
    const stats = await statisticManager.getStatisticByOwner(owneId);
    return res.status(200).json({
        success: true,
        data: stats,
    });
} catch (error) {
   
    return res.status(200).json({
        success: false,
        message: error.message,
    });
}
};
module.exports = {
getAllStatisticsResto,
};