const cron = require('node-cron');

const { DiscountModel } = require("../Models/DB_Shoes");

cron.schedule('* * * * *',async () => {
    try {
        const now = new Date();
        await DiscountModel.updateMany(
            {
                $or :[
                    { endDate:{$lte:now},isActive:true},
                    {maxUser:{$lte:0},isActive:true},
                ]
            },
            {$set:{isActive:false}}
        );
        console.log("Discount update");
    } catch (error) {
        console.error('Error updating discounts:', err);
    }
});