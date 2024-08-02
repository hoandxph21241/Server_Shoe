var Model = require("../Models/DB_Shoes");

const admin = require('../config/firebase');


const bucket = admin.storage().bucket();

exports.addBrand = async (req, res) => {
    let imageType = '';
    try {
        const { nameType } = req.body;

        const uploafFile = (file, folder) => {
            return new Promise((resolve, reject) => {
                const blob = bucket.file(`${folder}/${Date.now()}_${file.originalname}`);
                const blobStream = blob.createWriteStream({
                    metadata: {
                        contentType: file.mimetype,
                        cacheControl: 'public, max-age=31536000',
                    },
                });

                blobStream.on('error', (err) => {
                    reject(err);
                });

                blobStream.on('finish', async () => {
                    try {
                        await blob.makePublic();
                        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(blob.name)}?alt=media`;
                        resolve(publicUrl);
                    } catch (error) {
                        reject(error);
                    }
                });
                blobStream.end(file.buffer);
            });
        }

        // Kiểm tra sự tồn tại của req.files và imageType
        if (req.files && req.files['imageType']) {
            // Tải lên tệp và lấy URL công khai
            imageType = await uploafFile(req.files['imageType'][0], 'imageType');
        }

        const newBrand = new Model.TypeShoeModel({
            nameType,
            imageType,
        });

        await newBrand.save();
        res.redirect('/manager/productlist'); // Sử dụng đường dẫn hợp lệ cho redirect
    } catch (error) {
        console.error(error);
        res.status(500).send('Có lỗi xảy ra');
    }
};

exports.BrandList = async (req, res) => {
    try {
        const brand = await Model.TypeShoeModel.find();
        if (!brand) {
            return res.status(404).send("Not Found");
        };

        res.render('manager/product/product.ejs', { brands: brand });
        // res.json(brand)
    } catch (error) {
        console.error(error);
    }
};


exports.ProductList = async (req, res, next) => {
    try {
        const brand = await Model.TypeShoeModel.find();
        if (!brand) {
            return res.status(404).send("Not Found");
        };

        res.render('manager/product/product.ejs', { brands: brand });
        // res.json(brand)
    } catch (error) {
        console.error(error);
    }
};

exports.AddProduct = async (req, res, next) => {
    res.render('manager/product/add_product.ejs');
};

exports.EditProduct = async (req, res, next) => {
    res.render('manager/product/edit_product.ejs');
};

exports.VorcherList = async (req, res, next) => {
    res.render('manager/vorcher/vorcher.ejs');
};

exports.BannerList = async (req, res, next) => {
    try {
        const banner = await Model.BannerModel.find({ hide: false });
        if (!banner) {
            console.log("Không tìm thấy banner");
        }
        res.render('manager/banner/hide_banner.ejs', { banner: banner });
    } catch (error) {
        console.log("Đã có lỗi lấy danh sách banner: " + error);
    }
};

exports.Banner_Hide = async (req, res) => {
    try {
        const banner = await Model.BannerModel.find({ hide: true });
        if (!banner) {
            console.log("Không tìm thấy banner");
        }
        res.render('manager/banner/hide_banner.ejs', { banner: banner });
    } catch (error) {
        console.log("Đã có lỗi lấy danh sách bannner : " + error);
    }
};

exports.AddBanner = async (req, res, next) => {
    try {
        const { type, title, thumbnail, description } = req.body;
        let image = "";
        let imageThumbnail = "";

        const uploadFile = (file, folder) => {
            return new Promise((resolve, reject) => {
                const blob = bucket.file(`${folder}/${Date.now()}_${file.originalname}`);
                const blobStream = blob.createWriteStream({
                    metadata: {
                        contentType: file.mimetype,
                        cacheControl: 'public, max-age=31536000',
                    },
                });

                blobStream.on('error', (err) => {
                    reject(err);
                });

                blobStream.on('finish', async () => {
                    try {
                        await blob.makePublic();
                        const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(blob.name)}?alt=media`;
                        resolve(publicUrl);
                    } catch (error) {
                        reject(error);
                    }
                });
                blobStream.end(file.buffer);
            });
        };

        if (req.files['image']) {
            image = await uploadFile(req.files['image'][0], 'images');
        }

        if (req.files['imageThumbnail']) {
            imageThumbnail = await uploadFile(req.files['imageThumbnail'][0], 'thumbnails');
        }

        // Tạo mới banner trong cơ sở dữ liệu
        const newBanner = new Model.BannerModel({
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


exports.HideBanner = async (req, res, next) => {
    try {
        const bannerId = req.params._id;
        const banner = await Model.BannerModel.findById(bannerId);
        if (!banner) {
            console.log("Không tìm thấy banner");
            return res.redirect('/manager/bannerlist');
        }
        banner.hide = !banner.hide;

        await banner.save();

        res.redirect('/manager/bannerlist');
    } catch (error) {
        console.log("Đã có lỗi ẩn banner : " + error);
    }
}
