var Banner = require("../Models/DB_Shoes")
const fs = require('fs');
const path = require('path');

exports.ProductList = async (req,res,next) => {
    res.render('manager/product/product.ejs');
};

exports.AddProduct = async (req,res,next) => {
    res.render('manager/product/add_product.ejs');
};

exports.EditProduct = async (req,res,next) => {
    res.render('manager/product/edit_product.ejs');
};

exports.VorcherList = async (req,res,next) => {
    res.render('manager/vorcher/vorcher.ejs');
};


exports.BannerList = async (req,res,next) => {
    try {
        const banner = await Banner.BannerModel.find();
        if (!banner) {
            console.log("Không tìm thấy banner");
        }
        res.render('manager/banner/banner.ejs',{banner:banner});
    } catch (error) {
        console.log("Đã có lỗi lấy danh sách bannner : "+error);
    }
};

exports.AddBanner = async (req, res, next) => {
    try {
        const { type, title, thumbnail, description } = req.body;
        let image = "";
        let imageThumbnail = "";

        // Kiểm tra và xử lý tệp ảnh sản phẩm
        if (req.files['image']) {
            const imageFile = req.files['image'][0];
            const destinationPath = path.join(__dirname, "../public/upload", imageFile.filename);
            fs.renameSync(imageFile.path, destinationPath);
            image = "/upload/" + imageFile.filename;
        }

        // Kiểm tra và xử lý tệp ảnh thumbnail
        if (req.files['imageThumbnail']) {
            const thumbnailFile = req.files['imageThumbnail'][0];
            const destinationPath = path.join(__dirname, "../public/upload", thumbnailFile.filename);
            fs.renameSync(thumbnailFile.path, destinationPath);
            imageThumbnail = "/upload/" + thumbnailFile.filename;
        }

        // Tạo mới banner trong cơ sở dữ liệu
        const newBanner = new Banner.BannerModel({
            image: image,
            imageThumbnail: imageThumbnail,
            type: type,
            thumbnail: thumbnail,
            title: title,
            description: description,
        });

        // Lưu banner vào cơ sở dữ liệu
        await newBanner.save();

        // Redirect hoặc render trang sau khi thêm banner thành công
        res.redirect('/manager/bannerlist');
    } catch (error) {
        console.error("Đã có lỗi khi thêm banner:", error);
        // Xử lý lỗi và render lại trang thêm banner với thông báo lỗi
        res.render('manager/banner/add_banner.ejs', { error: 'Đã có lỗi khi thêm banner. Vui lòng thử lại.' });
    }
};

exports.HideBanner = async (req,res,next) => {
    try {
        const bannerId = req.params._id;
        
        const banner = await Banner.BannerModel.findById(bannerId);
        if(!banner) {
            console.log("Không tìm thấy banner");
        }
        banner.hide  = !banner.hide;
        await banner.save();

        res.redirect('/manager/bannerlist');
    } catch (error) {
        console.log("Đã có lỗi ẩn banner : "+error);
    }
}
