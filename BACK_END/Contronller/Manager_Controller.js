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
        res.status(500).send('Có lỗi xảy ra :', error);
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


// exports.ProductList = async (req, res, next) => {
//     try {
//         const brand = await Model.TypeShoeModel.find();
//         if (!brand) {
//             return res.status(404).send("Not Found");
//         };

//         res.render('manager/product/product.ejs', { brands: brand });
//         // res.json(brand)
//     } catch (error) {
//         console.error(error);
//     }
// };

exports.AllProduct = async (req, res, next) => {
    try {
        const userRole = req.session.userLogin ? req.session.userLogin.role : null;
        const page = parseInt(req.query.page) || 1;
        const limit = 9;
        const skip = (page - 1) * limit;

        // Lấy sản phẩm với phân trang
        let shoes = await Model.ShoeModel.find()
            .populate({
                path: "sizeShoe",
                match: { isEnable: true },
                select: "size sizeId -_id",
            })
            .populate({
                path: "imageShoe",
                select: "imageUrl -_id",
            })
            .populate({
                path: "colorShoe",
                select: "textColor codeColor -_id",
            })
            .populate("typerShoe", "nameType _id")
            .select("-__v")
            .skip(skip)
            .limit(limit);

        // Đếm tổng số sản phẩm
        const totalItem = await Model.ShoeModel.countDocuments();
        // Tính số trang tổng cộng
        const totalPages = Math.ceil(totalItem / limit);

        // Lấy thông tin loại giày
        const typerShoe = await Model.TypeShoeModel.find();
        if (!typerShoe) {
            return res.status(404).send("Not Found");
        };

        if (shoes.length > 0) {
            // Render trang sản phẩm với thông tin phân trang
            res.render('manager/product/product.ejs', { shoes: shoes, typerShoe: typerShoe, currentPage: page, totalPage: totalPages, totalItem: totalItem,userRole :userRole });
        } else {
            return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });
        }
    } catch (error) {
        return res.status(500).json({ msg: "Có lỗi xảy ra: " + error.message });
    }
};


const formatString = (inputString) => {
    return inputString.toLowerCase().replace(/\s+/g, "-");
};

exports.AddProduct = async (req, res, next) => {
    const userRole = req.session.userLogin ? req.session.userLogin.role : null;
    try {
        const {
            name,
            importPrice,
            description,
            typerShoeId,
            thumbnail,
            imageShoe,
            storageShoe = [],
            color = [],
            size = [],
        } = req.body;
        let listColor = await Model.ColorShoeModel.find();
        let listTyper = await Model.TypeShoeModel.find();
        let listSize = await Model.SizeShoeModel.find();

        let errors = [];

        // Validate required fields
        if (!name) errors.push("Name is required");
        if (!importPrice) errors.push("Price is required");
        if (!description) errors.push("Description is required");
        if (!typerShoeId) errors.push("TypeShoeId is required");
        if (errors.length > 0) {
            return res.render('manager/product/add_product.ejs', {
                listColor: listColor,
                listTyper: listTyper,
                listSize: listSize,
                errors: errors,
                userRole:userRole
            });
        }
        let shoe = await Model.ShoeModel.findOne({ name });
        if (shoe) {
            errors.push("Shoe already exists");
            return res.render('manager/product/add_product.ejs', {
                listColor: listColor,
                listTyper: listTyper,
                listSize: listSize,
                errors: errors,
                userRole:userRole
            });
        }
        const type = await Model.TypeShoeModel.findById(typerShoeId);
        if (!type) {
            errors.push("TypeShoe not found");
            return res.render('manager/product/add_product.ejs', {
                listColor: listColor,
                listTyper: listTyper,
                listSize: listSize,
                errors: errors,
                userRole:userRole
            });
        }
        const shoeId = formatString(type.nameType);

        // Prepare data for ShoeModel
        const colorIds = new Set(color);
        const sizeIds = new Set(size);
        let importQuanlityAll = 0;
        let soldQuanlityAll = 0;
        const price = importPrice * 1.2;

        const sellPrice = price * 0.98;
        shoe = new Model.ShoeModel({
            shoeId,
            name,
            importPrice,
            price: price,
            sellPrice: sellPrice,
            description,
            typerShoe: type._id,
            thumbnail,
            imageShoe,
            colorShoe: [],
            sizeShoe: [],
            importQuanlityAll,
            soldQuanlityAll,
            storageShoe: [],
        });
        const savedShoe = await shoe.save();
        const storage = [];
        for (const storageItem of storageShoe) {
            const colorDoc = await Model.ColorShoeModel.findById(storageItem.colorShoe);
            if (!colorDoc) continue;
            colorIds.add(colorDoc._id);
            console.log('colorDoc:', colorDoc);
            for (const size of storageItem.sizeShoe) {
                const sizeId = formatString(size.size);
                const sizeDoc = await Model.SizeShoeModel.findOneAndUpdate(
                    { size: size.size },
                    { $setOnInsert: { size: size.size, isEnable: true, sizeId: sizeId } },
                    { new: true, upsert: true }
                );
                sizeIds.add(sizeDoc._id);

                const importQuantity = parseInt(size.quantity, 10);
                const soldQuantity = parseInt(size.quantity, 10);

                importQuanlityAll += importQuantity;
                soldQuanlityAll += soldQuantity;

                const newStorage = new Model.StorageShoeModel({
                    shoeId: savedShoe._id,
                    colorShoe: colorDoc._id,
                    sizeShoe: [
                        {
                            sizeId: sizeDoc._id,
                            quantity: importQuantity
                        }
                    ],
                    importQuanlity: importQuantity,
                    soldQuanlity: 0,
                });

                const savedStorage = await newStorage.save();

                storage.push({
                    importQuanlity: savedStorage.importQuanlity,
                    soldQuanlity: 0,
                    _id: savedStorage._id
                });
            }
        }
        savedShoe.colorShoe = [...colorIds];
        savedShoe.sizeShoe = [...sizeIds];
        savedShoe.storageShoe = storage;
        savedShoe.importQuanlityAll = importQuanlityAll;
        savedShoe.soldQuanlityAll = 0;
        await savedShoe.save();
        console.log("Shoe created successfully:", savedShoe);

        res.render('manager/product/add_product.ejs', {
            listColor: listColor,
            listTyper: listTyper,
            listSize: listSize,
            userRole:userRole
        });
    } catch (error) {
        console.error("Error during shoe creation:", error);
        res.render('manager/product/add_product.ejs', {
            listColor: listColor,
            listTyper: listTyper,
            listSize: listSize,
            userRole:userRole,
            errors: ["Internal Server Error"],
        });
    }
};

exports.uploadFiles = async (req, res) => {
    try {
        let imageShoe = [];
        let thumbnail = '';

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

        if (req.files && req.files.thumbnail) {
            thumbnail = await uploadFile(req.files.thumbnail[0], 'thumbnailImage');
        }

        if (req.files && req.files.imageShoe) {
            for (const file of req.files.imageShoe) {
                const url = await uploadFile(file, 'imageShoe');
                imageShoe.push(url);
            }
        }

        console.log(thumbnail);
        console.log(imageShoe);
        
        res.status(200).json({ thumbnail, imageShoe });
    } catch (error) {
        console.error("Error during file upload:", error);
        res.status(500).json({ error: "File upload failed" });
    }
};


exports.EditProduct = async (req, res, next) => {
    try {
        const userRole = req.session.userLogin ? req.session.userLogin.role : null; 
        const productId = req.params._id;

        const product = await Model.ShoeModel.findById(productId)
            .populate({ 
                path: 'typerShoe',  
                select: 'nameType'  
            })
            .populate('name')
            .lean();

        const storageShoe = await Model.StorageShoeModel.find({shoeId: productId})
            .populate({
                path: 'colorShoe',
                select: 'textColor'
            })
            .populate({
                path: 'sizeShoe.sizeId',
                select: 'size'
            })
            .lean(); 

        console.log(storageShoe);

        res.render('manager/product/edit_product.ejs', {
            product: product,
            storages: storageShoe,
            userRole: userRole
        });
    } catch (error) {
        console.error("Error in EditProduct controller:", error);
        next(error);
    }
}




exports.VorcherList = async (req, res, next) => {
   
};

exports.BannerList = async (req, res, next) => {
    const userRole = req.session.userLogin ? req.session.userLogin.role : null;
    try {
        const banner = await Model.BannerModel.find({ hide: false });
        if (!banner) {
            console.log("Không tìm thấy banner");
        }
        res.render('manager/banner/hide_banner.ejs', { banner: banner,userRole:userRole });
    } catch (error) {
        console.log("Đã có lỗi lấy danh sách banner: " + error);
    }
};

exports.Banner_Hide = async (req, res) => {
    const userRole = req.session.userLogin ? req.session.userLogin.role : null;
    try {
        const banner = await Model.BannerModel.find({ hide: true });
        if (!banner) {
            console.log("Không tìm thấy banner");
        }
        res.render('manager/banner/hide_banner.ejs', { banner: banner, userRole:userRole });
    } catch (error) {
        console.log("Đã có lỗi lấy danh sách bannner : " + error);
    }
};

exports.AddBanner = async (req, res, next) => {
    const userRole = req.session.userLogin ? req.session.userLogin.role : null;
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
        res.redirect('/manager/bannerlist',{userRole:userRole});
    } catch (error) {
        console.error("Đã có lỗi khi thêm banner:", error);
        // Xử lý lỗi và render lại trang thêm banner với thông báo lỗi
        res.render('manager/banner/add_banner.ejs', { error: 'Đã có lỗi khi thêm banner. Vui lòng thử lại.',userRole:userRole });
    }
};

exports.HideBanner = async (req, res, next) => {
    const userRole = req.session.userLogin ? req.session.userLogin.role : null;
    try {
        const bannerId = req.params._id;
        const banner = await Model.BannerModel.findById(bannerId);
        if (!banner) {
            console.log("Không tìm thấy banner");
            return res.redirect('/manager/bannerlist',{userRole:userRole});
        }
        banner.hide = !banner.hide;
        await banner.save();
        res.redirect('/manager/bannerlist');
    } catch (error) {
        console.log("Đã có lỗi ẩn banner : " + error);
    }
}


// exports.AddProduct = async (req, res, next) => {
//     try {
//         const {
//             name,
//             price,
//             description,
//             typerShoeId,
//             storageShoe = [],
//             imageShoeURLs = [],
//             thumbnailURL,
//             color = [],
//             size = []
//         } = req.body;

//         console.log(name);
//         console.log(storageShoe);
//         console.log(price);

//         // console.log(imageShoe);

//         let listColor = await Model.ColorShoeModel.find();
//         let listTyper = await Model.TypeShoeModel.find();
//         let listSize = await Model.SizeShoeModel.find();

//         let errors = [];

//         if (errors.length > 0) {
//             return res.render('manager/product/add_product.ejs', {
//                 listColor: listColor,
//                 listTyper: listTyper,
//                 listSize: listSize,
//                 errors: errors,
//             });
//         }

//         let shoe = await Model.ShoeModel.findOne({ name });
//         if (shoe) {
//             errors.push("Shoe already exists");
//             return res.render('manager/product/add_product.ejs', {
//                 listColor: listColor,
//                 listTyper: listTyper,
//                 listSize: listSize,
//                 errors: errors,
//             });
//         }

//         const type = await Model.TypeShoeModel.findById(typerShoeId);
//         if (!type) {
//             errors.push("TypeShoe not found");
//             return res.render('manager/product/add_product.ejs', {
//                 listColor: listColor,
//                 listTyper: listTyper,
//                 listSize: listSize,
//                 errors: errors,
//             });
//         }
//         const colorIds = new Set(color);
//         const sizeIds = new Set(size);
//         let importQuanlityAll = 0;
//         let soldQuanlityAll = 0;

//         shoe = new Model.ShoeModel({
//             name,
//             price,
//             description,
//             typerShoe: type._id,
//             thumbnail:thumbnailURL,
//             imageShoe:imageShoeURLs,
//             colorShoe: [],
//             sizeShoe: [],
//             importQuanlityAll,
//             soldQuanlityAll,
//             storageShoe: [],
//         });

//         const savedShoe = await shoe.save();

//         const storage = [];
//         for (const storageItem of storageShoe) {
//             const colorDoc = await Model.ColorShoeModel.findById(storageItem.colorShoe);
//             if (!colorDoc) continue;
//             colorIds.add(colorDoc._id);
//             console.log('colorDoc:', colorDoc);
//             for (const sizeItem of storageItem.sizeShoe) {
//                 const sizeDoc = await Model.SizeShoeModel.findOneAndUpdate(
//                     { size: sizeItem.size },
//                     { $setOnInsert: { size: sizeItem.size, isEnable: true } },
//                     { new: true, upsert: true }
//                 );
//                 sizeIds.add(sizeDoc._id);

//                 const importQuantity = parseInt(sizeItem.quantity, 10);
//                 const soldQuantity = parseInt(sizeItem.quantity, 10);

//                 importQuanlityAll += importQuantity;
//                 soldQuanlityAll += soldQuantity;

//                 const newStorage = new Model.StorageShoeModel({
//                     shoeId: savedShoe._id,
//                     colorShoe: colorDoc._id,
//                     sizeShoe: [
//                         {
//                             sizeId: sizeDoc._id,
//                             quantity: importQuantity
//                         }
//                     ],
//                     importQuanlity: importQuantity,
//                     soldQuanlity: soldQuantity
//                 });
//                 const savedStorage = await newStorage.save();

//                 storage.push({
//                     importQuanlity: savedStorage.importQuanlity,
//                     soldQuanlity: savedStorage.soldQuanlity,
//                     _id: savedStorage._id
//                 });
//             }
//         }

//         savedShoe.colorShoe = [...colorIds];
//         savedShoe.sizeShoe = [...sizeIds];
//         savedShoe.storageShoe = storage;
//         savedShoe.importQuanlityAll = importQuanlityAll;
//         savedShoe.soldQuanlityAll = soldQuanlityAll;
//         await savedShoe.save();

//         console.log('Request Body:', req.body);
//         console.log('StorageShoe:', storageShoe);
//         console.log('colorIds:', colorIds);
//         console.log('sizeIds:', sizeIds);


//         storageShoe.forEach((storage, index) => {
//             console.log(`Storage Entry ${index + 1}:`);
//             console.log('ColorShoe:', storage.colorShoe);
//             console.log('SizeShoe:', storage.sizeShoe);
//         });
//         res.render('manager/product/add_product.ejs', {
//             listColor: listColor,
//             listTyper: listTyper,
//             listSize: listSize,
//             successMessage: "Shoe created successfully"
//         });
//     } catch (error) {
//         console.error("Error during shoe creation:", error);
//         res.render('manager/product/add_product.ejs', {
//             errors: ["Internal Server Error"],
//         });
//     }
// };
