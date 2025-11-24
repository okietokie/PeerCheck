import User from "../models/user.js";


export const fetchBasicData = async (req, res) =>{
    try {
        
        const activeUsers = await User.countDocuments({onlineStatus: 'active'});
        const totalUsers = await User.countDocuments();
        console.log("[homeController.js]\nActive users:",activeUsers);

        res.status(200).json({
            activeUsers: activeUsers,
            totalUsers: totalUsers
    })
    } catch (error) {
        console.log(`[homeController.js] Error: ${error}!`)
        return res.status(500).json({ message: "Internal server error" });

    }
}