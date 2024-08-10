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
        .select("-__v");
  
        const typerShoe = await Model.TypeShoeModel.find();
        if (!typerShoe) {
            return res.status(404).send("Not Found");
        };

      if (shoes.length > 0) {
        // return res.status(200).json(shoes);
        res.render('manager/product/product.ejs', { shoes: shoes,typerShoe:typerShoe });
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
    try {
        // File upload function for Firebase
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
    
        // Extract data and files from request
        const { name, price, description, typerShoeId, status, storageShoe } = req.body;
        const thumbnail = req.files.thumbnail ? req.files.thumbnail[0] : null;
        const imageShoe = req.files.imageShoe ? req.files.imageShoe : [];
    
        // Check if shoe already exists
        let shoe = await Model.ShoeModel.findOne({ name });
        if (shoe) {
          return res.status(400).json({ message: "Shoe already exists" });
        }
    
        // Get shoe type
        const type = await Model.TypeShoeModel.findById(typerShoeId);
        if (!type) {
          return res.status(404).json({ message: "TypeShoe not found" });
        }
        const shoeId = formatString(type.nameType);
    
        // Prepare file URLs
        let thumbnailUrl = '';
        if (thumbnail) {
          thumbnailUrl = await uploadFile(thumbnail, 'thumbnails');
        }
    
        const imageShoeUrls = [];
        for (const image of imageShoe) {
          const imageUrl = await uploadFile(image, 'images');
          imageShoeUrls.push(imageUrl);
        }
        
    
        // Create a new Shoe document
        shoe = new Model.ShoeModel({
          shoeId,
          name,
          price,
          description,
          typerShoe: type._id,
          thumbnail: thumbnailUrl,
          status,
          imageShoe: imageShoeUrls,
          colorShoe: [], // To be updated later
          sizeShoe: [], // To be updated later
          importQuanlityAll: 0,
          soldQuanlityAll: 0,
          storageShoe: [] // To be updated later
        });
    
        const savedShoe = await shoe.save();
    
        // Process storageShoe information
        const storage = [];
        for (const storageItem of storageShoe) {
          const colorDoc = await Model.ColorShoeModel.findById(storageItem.colorShoe);
          if (!colorDoc) {
            continue;
          }
          const colorId = colorDoc._id;
    
          for (const size of storageItem.sizeShoe) {
            const sizeId = formatString(size.size);
            const sizeDoc = await Model.SizeShoeModel.findOneAndUpdate(
              { size: size.size },
              { $setOnInsert: { size: size.size, isEnable: true, sizeId: sizeId } },
              { new: true, upsert: true }
            );
            const sizeDocId = sizeDoc._id;
    
            const importQuantity = parseInt(size.quantity, 10);
            const soldQuantity = parseInt(size.quantity, 10);
    
            // Update quantities
            shoe.importQuanlityAll += importQuantity;
            shoe.soldQuanlityAll += soldQuantity;
    
            // Create and save StorageShoe document
            const newStorage = new Model.StorageShoeModel({
              shoeId: savedShoe._id,
              colorShoe: colorId,
              sizeShoe: [
                {
                  sizeId: sizeDocId,
                  quantity: importQuantity
                }
              ],
              importQuanlity: importQuantity,
              soldQuanlity: soldQuantity
            });
    
            const savedStorage = await newStorage.save();
            storage.push({
              importQuanlity: savedStorage.importQuanlity,
              soldQuanlity: savedStorage.soldQuanlity,
              _id: savedStorage._id
            });
          }
        }
    
        // Update the Shoe document with final information
        savedShoe.colorShoe = Array.from(colorIds);
        savedShoe.sizeShoe = Array.from(sizeIds);
        savedShoe.storageShoe = storage;
        savedShoe.importQuanlityAll = shoe.importQuanlityAll;
        savedShoe.soldQuanlityAll = shoe.soldQuanlityAll;
        await savedShoe.save();
    
        console.log("Shoe created successfully:", savedShoe);
    
        res.status(201).json({ message: "Shoe created successfully", data: savedShoe });
      } catch (error) {
        console.error("Error during shoe creation:", error);
        res.status(500).json({ message: "Internal Server Error", error });
      }
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
