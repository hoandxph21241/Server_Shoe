const {UserModel} = require('../../Models/DB_Shoes')

const userFavourite = async (req, res) => {
    try { 
        const {userId, shoeId} = req.body;
    const user = await UserModel.findById(userId);
    if (!user) {
        return res.status(404).json({Success: false, message: 'User not found!'});
    }
    const index = user.favourites.findIndex(favourite => favourite.shoeId === shoeId);
    if (index === -1) {
        user.favourites.push({shoeId});
        user.save();
        return res.status(200).json({Success: true, message: 'Favourite added successfully!'});
    }
    user.favourites.splice(index, 1);
    await user.save();
    return res.status(200).json({Success: true, message: 'Favourite removed successfully!'});
    
    } catch (error) {
        return res.status(500).json({Success: true, message: 'The server is experiencing an error!', error: error});
    }
}
const listFavouritesByUser = async (req, res) => {
   try {
    const {userId} = req.params;
    const user = await UserModel.findById(userId);
    if (!user) {
        return res.status(404).json({Success: false, message: 'User not found!'});
    }
    const userFavourites = user.favourites;
    let shoesFavourites = [];
    for (let i = 0; i < userFavourites.length; i++) {
        const shoe = await ShoeModel.findById(userFavourites[i].shoeId);
        shoesFavourites.push(shoe);
    }
    return res.status(200).json({Success: true, shoesFavourites});
   } catch (error) {
    return res.status(500).json({Success: true, message: 'The server is experiencing an error!', error: error});
   }

    
}
module.exports ={
    userFavourite,
    listFavouritesByUser
}