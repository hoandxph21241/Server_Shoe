var Banner = require("../Models/DB_Shoes");
const admin = require('firebase-admin');
const serviceAccount = require('../Config/shoe-addbc-firebase-adminsdk-csvd6-23011188ed.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://shoe-addbc.appspot.com',
});

const bucket = admin.storage().bucket();

exports.ProductList = async (req, res, next) => {
    res.render('manager/product/product.ejs');
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
        const banner = await Banner.BannerModel.find({ hide: false });
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
        const banner = await Banner.BannerModel.find({ hide: true });
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


exports.HideBanner = async (req, res, next) => {
    try {
        const bannerId = req.params._id;
        const banner = await Banner.BannerModel.findById(bannerId);
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
