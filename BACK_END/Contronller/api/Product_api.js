var Model = require("../../Models/DB_Shoes");

exports.GetAllTyper = async (req, res, next) => {
  msg = "Danh sach Du Lieu";

  try {
    let list = await Model.TypeShoeModel.find();
    list.forEach((item) => {
      console.log("Danh Sách Dữ Liệu");
      console.log(item.nameType);
      console.log("---------------");
    });
    return res.status(200).json(list);
  } catch (error) {
    return res.status(204).json({ msg: "không có dữ liệu" + error.message });
  }
};

exports.FindTyper = async (req, res, next) => {
  try {
    let typerId = req.params.id;
    let type = await Model.TypeShoeModel.findById(typerId);
    if (type) {
      console.log(type);
      return res.status(200).json(type);
    } else {
      return res.status(404).json({ msg: "Không tìm thấy id này" });
    }
  } catch (error) {
    return res.status(500).json({ msg: "Có lỗi xảy ra: " + error.message });
  }
};

exports.AddTyper = async (req, res, next) => {
  const { nameType, imageType } = req.body;
  if (!nameType || !imageType) {
    return res
      .status(400)
      .json({ success: false, message: "Vui lòng nhập đầy đủ thông tin" });
  }
  try {
    const checkShoe = await Model.TypeShoeModel.findOne({ nameType });
    if (checkShoe) {
      return res
        .status(400)
        .json({ success: false, message: "Đã tồn tại một Typer tương tự" });
    }
    const newShoe = new Model.TypeShoeModel({ nameType, imageType });
    await newShoe.save();
    console.log(`Thêm Brand thành công: ${nameType}`);
    return res
      .status(200)
      .json({ success: true, message: "Thêm Typer thành công" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};
exports.UpdateTyper = async (req, res, next) => {
  const { nameType, imageType } = req.body;
  let id = req.params.id;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Vui lòng cung cấp id" });
  }
  try {
    const idTyper = await Model.TypeShoeModel.findById(id);
    if (!idTyper) {
      return res
        .status(400)
        .json({ success: false, message: "id không được để trống" });
    }
    idTyper.nameType = nameType || idTyper.nameType;
    idTyper.imageType = imageType || idTyper.imageType;
    await idTyper.save();
    console.log(`Đã cập nhật Typer: ${idTyper.nameType}`);
    return res
      .status(200)
      .json({ success: true, message: "Đã cập nhật Typer thành công" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

exports.DeleteTyper = async (req, res, next) => {
  let id = req.params.id;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "id không được để trống" });
  }
  try {
    const idBrand = await Model.TypeShoeModel.findById(id);
    if (!idBrand) {
      return res
        .status(400)
        .json({ success: false, message: "Typer không tồn tại" });
    }
    await Model.TypeShoeModel.findByIdAndDelete(id);
    console.log(`Đã xóa Thành Công`);
    return res
      .status(200)
      .json({ success: true, message: "Đã xóa Typer thành công" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

exports.createTypeShoe = async (req, res) => {
  try {
    const newTypeShoe = new Model.TypeShoeModel(req.body);
    await newTypeShoe.save();
    return res.status(201).json(newTypeShoe);
  } catch (error) {
    console.error("Error creating:", error);
    return res.status(500).json({ msg: "Có lỗi xảy ra khi tạo" });
  }
};
exports.getAllTypeShoes = async (req, res) => {
  try {
    const typeShoes = await Model.TypeShoeModel.find();
    return res.status(200).json(typeShoes);
  } catch (error) {
    console.error("Error fetching:", error);
    return res.status(500).json({ msg: "Có lỗi xảy ra khi lấy danh sách" });
  }
};
exports.getTypeShoeById = async (req, res) => {
  try {
    const typeShoeId = req.params.id;
    const typeShoe = await Model.TypeShoeModel.findById(typeShoeId);
    if (!typeShoe) {
      return res.status(404).json({ msg: "Không tìm thấy ID này" });
    }
    return res.status(200).json(typeShoe);
  } catch (error) {
    console.error("Error fetching:", error);
    return res.status(500).json({ msg: "Có lỗi xảy ra khi lấy thông tin" });
  }
};
exports.updateTypeShoe = async (req, res) => {
  try {
    const typeShoeId = req.params.id;
    const updatedTypeShoe = await Model.TypeShoeModel.findByIdAndUpdate(
      typeShoeId,
      req.body,
      { new: true }
    );
    if (!updatedTypeShoe) {
      return res.status(404).json({ msg: "Không tìm thấy ID này" });
    }
    return res.status(200).json(updatedTypeShoe);
  } catch (error) {
    console.error("Error updating:", error);
    return res.status(500).json({ msg: "Có lỗi xảy ra khi cập nhật" });
  }
};
exports.deleteTypeShoe = async (req, res) => {
  try {
    const typeShoeId = req.params.id;
    const deletedTypeShoe = await Model.TypeShoeModel.findByIdAndDelete(
      typeShoeId
    );
    if (!deletedTypeShoe) {
      return res.status(404).json({ msg: "Không tìm thấy ID này" });
    }
    return res.status(200).json({ msg: "Xóa thành công" });
  } catch (error) {
    console.error("Error deleting TypeShoe:", error);
    return res.status(500).json({ msg: "Có lỗi xảy ra khi xóa" });
  }
};

// exports.AllProduct = async (req, res, next) => {
//   try {
//     let shoes = await Model.ShoeModel.find()
//       .populate({
//         path: "sizeShoe",
//         match: { isEnable: true },
//         select: "size sizeId -_id",
//       })
//       .populate({
//         path: "imageShoe",
//         select: "imageUrl -_id",
//       })
//       .populate({
//         path: "colorShoe",
//         select: "textColor codeColor -_id",
//       })
//       .populate("typerShoe", "nameType _id")
//       .select("-__v");

//     if (shoes.length > 0) {
//       return res.status(200).json(shoes);
//     } else {
//       return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });
//     }
//   } catch (error) {
//     return res.status(500).json({ msg: "Có lỗi xảy ra: " + error.message });
//   }
// };


exports.AllProduct = async (req, res) => {
  try {
    let shoes = await Model.ShoeModel.find()
      .populate('typerShoe', 'nameType id') 
      .populate('colorShoe', 'textColor codeColor' )
      .populate('sizeShoe', 'size sizeId')
      .lean();
    
    const shoesWithStorage = [];

    for (const shoe of shoes) {
      const storageItems = await Model.StorageShoeModel.find({ shoeId: shoe._id })
        .populate('colorShoe', 'textColor')
        .populate('sizeShoe.sizeId', 'size')
        .lean();
      const formattedStorageItems = storageItems.map(item => {
        if (item.sizeShoe.length > 0) {
          const sizeItem = item.sizeShoe[0];
          return {
            colorShoe: item.colorShoe ? { textColor: item.colorShoe.textColor } : null,
            sizeShoe: sizeItem.sizeId ? { size: sizeItem.sizeId.size } : null,
            importQuanlity: item.importQuanlity,
            soldQuanlity: item.soldQuanlity
          };
        }
        return null;
      }).filter(item => item !== null);

      shoe.storageShoe = formattedStorageItems;
      shoesWithStorage.push(shoe);
    }
    res.status(200).json( shoesWithStorage );
  } catch (error) {
    return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });
  }
};

exports.FindProduct = async (req, res, next) => {
  try {
    let shoeId = req.params.id;  // Lấy shoeId từ request params
    let shoe = await Model.ShoeModel.findById(shoeId)
      .populate('typerShoe', 'nameType id') 
      .populate('colorShoe', 'textColor codeColor')
      .populate('sizeShoe', 'size sizeId')
      .lean();

    if (!shoe) {
      return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });
    }

    const storageItems = await Model.StorageShoeModel.find({ shoeId: shoe._id })
      .populate('colorShoe', 'textColor')
      .populate('sizeShoe.sizeId', 'size')
      .lean();

    const formattedStorageItems = storageItems.map(item => {
      if (item.sizeShoe.length > 0) {
        const sizeItem = item.sizeShoe[0];
        return {
          colorShoe: item.colorShoe ? { textColor: item.colorShoe.textColor } : null,
          sizeShoe: sizeItem.sizeId ? { size: sizeItem.sizeId.size } : null,
          importQuanlity: item.importQuanlity,
          soldQuanlity: item.soldQuanlity
        };
      }
      return null;
    }).filter(item => item !== null);

    shoe.storageShoe = formattedStorageItems;

    res.status(200).json(shoe); 
  } catch (error) {
    return res.status(500).json({ msg: "Có lỗi xảy ra: " + error.message });
  }
};

// exports.ReviewProduct = async (req, res, next) => {
//   try {
//     let shoeId = req.params.id;
//     let shoe = await Model.ShoeModel.findById(shoeId)
//       .select('rateShoe')
//       .populate({
//         path: 'rateShoe.comment',
//         populate: { path: 'userName', select: 'fullName imageAccount' }  //do img nặng ai test thì bỏ comment
//         // populate: { path: 'userName', select: 'fullName' }
//       })
//       .lean();

//     if (!shoe) {
//       return res.status(404).json({ msg: "Không tìm thấy đánh giá của sản phẩm" });
//     }
//     if (shoe.rateShoe && shoe.rateShoe.comment) {
//       shoe.rateShoe.comment.sort((a, b) => {
//         return new Date(b.createDate) - new Date(a.createDate);
//       });
//     }

//     res.status(200).json({
//       shoeId: shoe._id,
//       rateShoe: shoe.rateShoe
//     });

//   } catch (error) {
//     return res.status(500).json({ msg: "Có lỗi xảy ra: " + error.message });
//   }
// };

// exports.ReviewProduct = async (req, res, next) => {
//   try {
//     let shoeId = req.params.id;
//     let shoe = await Model.ShoeModel.findById(shoeId)
//       .select('rateShoe')
//       .populate({
//         path: 'rateShoe.comment',
//         populate: { path: 'userName', select: '_id fullName ' }
//       })
//       .lean();

//     if (!shoe) {
//       return res.status(404).json({ msg: "Không tìm thấy đánh giá của sản phẩm" });
//     }
//     if (shoe.rateShoe && shoe.rateShoe.comment) {
//       // shoe.rateShoe.comment.forEach(comment => {
//       //   if (comment.userName && comment.userName.imageAccount) {
//       //     comment.userName.imageAccount = {
//       //       "$binary": {
//       //         "base64": comment.userName.imageAccount.toString('base64'),
//       //         "subType": "10"
//       //       }
//       //     };
//       //   }
//       // });

//       // let user = await Model.UserModel.findById(shoe.rateShoe.comment.userName._id);
//       console.log(shoe.rateShoe.comment.userName);
//       // console.log(user);
      
      
//       // if (user.imageAccount) {
//       //   user.imageAccount = {
//       //     "$binary": {
//       //       "base64": user.imageAccount.toString('base64'),
//       //       "subType": "00"
//       //     }
//       //   };
//       // }

//       shoe.rateShoe.comment.sort((a, b) => {
//         return new Date(b.createDate) - new Date(a.createDate);
//       });
//     }

//     res.status(200).json({
//       shoeId: shoe._id,
//       rateShoe: shoe.rateShoe,
//     });

//   } catch (error) {
//     return res.status(500).json({ msg: "Có lỗi xảy ra: " + error.message });
//   }
// };

// exports.ReviewProduct = async (req, res, next) => {
//   try {
//     let shoeId = req.params.id;
//     let shoe = await Model.ShoeModel.findById(shoeId)
//       .select('rateShoe')
//       .populate({
//         path: 'rateShoe.comment',
//         populate: { path: 'userName', select: '_id fullName imageAccount' }
//       })
//       .lean();

//     if (!shoe) {
//       return res.status(404).json({ msg: "Không tìm thấy đánh giá của sản phẩm" });
//     }

//     if (shoe.rateShoe && shoe.rateShoe.comment) {
//       shoe.rateShoe.comment.forEach(comment => {
//         if (comment.userName && comment.userName.imageAccount) {
//           if (Buffer.isBuffer(comment.userName.imageAccount)) {
//             comment.userName.imageAccount = {
//               "$binary": {
//                 "base64": comment.userName.imageAccount.toString('base64'),
//                 "subType": "00"
//               }
//             };
//           }
//         }
//       });

//       shoe.rateShoe.comment.sort((a, b) => {
//         return new Date(b.createDate) - new Date(a.createDate);
//       });
//     }

//     res.status(200).json({
//       shoeId: shoe._id,
//       rateShoe: shoe.rateShoe
//     });

//   } catch (error) {
//     return res.status(500).json({ msg: "Có lỗi xảy ra: " + error.message });
//   }
// };

exports.ReviewProduct = async (req, res, next) => {
  try {
    let shoeId = req.params.id;
    let shoe = await Model.ShoeModel.findById(shoeId)
      .select('rateShoe')
      .populate({
        path: 'rateShoe.comment',
        populate: { path: 'userName', select: '_id fullName imageAccount' }
      })
      .lean();

    if (!shoe) {
      return res.status(404).json({ msg: "Không tìm thấy đánh giá của sản phẩm" });
    }
    
    if (shoe.rateShoe && shoe.rateShoe.comment) {
      let userIds = shoe.rateShoe.comment.map(comment => comment.userName._id);
      let users = await Model.UserModel.find({ '_id': { $in: userIds } })
      .select('_id fullName imageAccount') 
      .lean();
      // Chuyển đổi thông tin người dùng
      let userMap = users.reduce((acc, user) => {
        if (user.imageAccount) {
          user.imageAccount = {
            "$binary": {
              "base64": user.imageAccount.toString('base64'),
              "subType": "00" 
            }
          };
        }
        acc[user._id] = user;
        return acc;
      }, {});
      shoe.rateShoe.comment.forEach(comment => {
        if (comment.userName && userMap[comment.userName._id]) {
          comment.userName = userMap[comment.userName._id];
        }
      });

      shoe.rateShoe.comment.sort((a, b) => {
        return new Date(b.createDate) - new Date(a.createDate);
      });
    }

    res.status(200).json({
      shoeId: shoe._id,
      rateShoe: shoe.rateShoe
    });

  } catch (error) {
    return res.status(500).json({ msg: "Có lỗi xảy ra: " + error.message });
  }
};


exports.FindByName = async (req, res, next) => {
  try {
    let conditions = {};
    if (req.query.name) {
      const productName = decodeURIComponent(req.query.name);
      conditions.name = new RegExp(productName, "i");
    }
    const shoes = await Model.ShoeModel.find(conditions)
    .select("_id name thumbnail imageShoe")
    .lean();

    console.log("=Tìm Kiếm=");
    console.log("Số sản phẩm phù hợp: " + shoes.length);
    console.log("=Tìm Kiếm END=");
    return res.status(200).json(shoes);
  } catch (error) {
    console.error("Lỗi khi tìm kiếm sản phẩm:", error);
    return res.status(500).json({ msg: "Có lỗi xảy ra khi tìm kiếm sản phẩm" });
  }
};

exports.FindProductsByTyperdId = async (req, res, next) => {
  try {
    let brandId = req.params.id;
    let shoes = await Model.ShoeModel.find({ typerShoe: brandId })
      // .populate({
      //   path: 'shoeDetail',
      //   populate: [
      //     { path: 'sizeShoe', match: { isEnable: true } },
      //     { path: 'imageShoe' },
      //     { path: 'colorShoe' },
      //   ]
      // })
      .populate("typerShoe");

    if (shoes.length > 0) {
      shoes = shoes.map((shoe) => {
        if (shoe.shoeDetail) {
          shoe.shoeDetail.sizeShoe = shoe.shoeDetail.sizeShoe.filter(
            (size) => size.isEnable
          );
        }
        return shoe;
      });

      console.log(shoes);
      return res.status(200).json(shoes);
    } else {
      return res
        .status(404)
        .json({ msg: "Không tìm thấy sản phẩm nào của thương hiệu này" });
    }
  } catch (error) {
    return res.status(500).json({ msg: "Có lỗi xảy ra: " + error.message });
  }
};


exports.findShoes_DATA = async (req, res, next) => {
  try {
    const { idTyper, sizeId, textColor, shoeId } = req.params;
    let query = {};

    if (idTyper && idTyper !== "null") query.typerShoe = idTyper;
    if (shoeId && shoeId !== "null") query.shoeId = shoeId;

    let shoes = await Model.ShoeModel.find(query)
      .populate("typerShoe", "nameType _id")
      .populate({
        path: "sizeShoe",
        match: sizeId && sizeId !== "null" ? { sizeId: sizeId } : {},
        select: "size sizeId -_id",
      })
      .populate({
        path: "colorShoe",
        match:
          textColor && textColor !== "null" ? { textColor: textColor } : {},
        select: "textColor codeColor -_id",
      })
      .select("-__v");

    // Lọc kết quả dựa trên sizeId và textColor
    let filteredShoes = shoes.filter((shoe) => {
      const matchesSize =
        !sizeId ||
        sizeId === "null" ||
        shoe.sizeShoe.some((size) => size.sizeId === sizeId);
      const matchesColor =
        !textColor ||
        textColor === "null" ||
        shoe.colorShoe.some((color) => color.textColor === textColor);
      return matchesSize && matchesColor;
    });

    if (filteredShoes.length > 0) {
      return res.status(200).json(filteredShoes);
    } else {
      return res
        .status(404)
        .json({ msg: "Không tìm thấy sản phẩm nào phù hợp" });
    }
  } catch (error) {
    return res.status(500).json({ msg: "Có lỗi xảy ra: " + error.message });
  }
};


const formatString = (inputString) => {
  return inputString.toLowerCase().replace(/\s+/g, "-");
};
const now = new Date();
const formattedDate = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`; 

exports.ADD_Product = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      typerShoeId,
      thumbnail,
      status,
      storageShoe,
      imageShoe,
      importPrice,
      sellPrice
    } = req.body;

    let shoe = await Model.ShoeModel.findOne({ name });
    if (shoe) {
      return res.status(400).json({ message: "Shoe already exists" });
    }

    const type = await Model.TypeShoeModel.findById(typerShoeId);
    if (!type) {
      return res.status(404).json({ message: "TypeShoe not found" });
    }
    const shoeId = formatString(type.nameType);

    const colorIds = new Set();
    const sizeIds = new Set();

    let importQuanlityAll = 0;
    let soldQuanlityAll = 0;

    shoe = new Model.ShoeModel({
      shoeId,
      name,
      price,
      description,
      typerShoe: type._id,
      thumbnail,
      status,
      imageShoe,
      colorShoe: [], 
      sizeShoe: [], 
      importQuanlityAll,
      soldQuanlityAll,
      storageShoe: [],
      importPrice,
      sellPrice,
      createDate: formattedDate
    });

    const savedShoe = await shoe.save();


    const storage = [];
    for (const storageItem of storageShoe) {
      const colorDoc = await Model.ColorShoeModel.findById(storageItem.colorShoe);
      if (!colorDoc) {
        continue;
      }
      colorIds.add(colorDoc._id);

      for (const size of storageItem.sizeShoe) {
        const sizeId = formatString(size.size);
        const sizeDoc = await Model.SizeShoeModel.findOneAndUpdate(
          { size: size.size },
          { $setOnInsert: { size: size.size, isEnable: true, sizeId: sizeId } },
          { new: true, upsert: true }
        );
        sizeIds.add(sizeDoc._id);

        const importQuantity = parseInt(size.quantity, 10);
        const soldQuanlity = parseInt(size.quantity, 10);

        importQuanlityAll += importQuantity;
        soldQuanlityAll += soldQuanlity;

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
          soldQuanlity: soldQuanlity
        });

        const savedStorage = await newStorage.save();
        storage.push({
          importQuanlity: savedStorage.importQuanlity,
          soldQuanlity: soldQuanlity,
          _id: savedStorage._id
        });
      }
    }
    savedShoe.colorShoe = [...colorIds];
    savedShoe.sizeShoe = [...sizeIds];
    savedShoe.storageShoe = storage;
    savedShoe.importQuanlityAll = importQuanlityAll;
    savedShoe.soldQuanlityAll = soldQuanlityAll;
    await savedShoe.save();

    console.log("Shoe created successfully:", savedShoe);

    res.status(201).json({ message: "Shoe created successfully", data: savedShoe });
  } catch (error) {
    console.error("Error during shoe creation:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

exports.UPDATE_Product = async (req, res) => {
  let id=req.params.id;
  try {
    const {
      name,
      price,
      description,
      typerShoeId,
      thumbnail,
      status,
      storageShoe,
      imageShoe,
    } = req.body;

    let shoe = await Model.ShoeModel.findById(id);
    if (!shoe) {
      return res.status(404).json({ message: "Shoe not found" });
    }

    if (name && shoe.name !== name) {
      let existingShoe = await Model.ShoeModel.findOne({ name });
      if (existingShoe) {
        return res.status(400).json({ message: "Shoe with this name already exists" });
      }
    }

    if (typerShoeId && shoe.typerShoe.toString() !== typerShoeId) {
      const type = await Model.TypeShoeModel.findById(typerShoeId);
      if (!type) {
        return res.status(404).json({ message: "TypeShoe not found" });
      }
      shoe.typerShoe = type._id;
    }

    if (name) shoe.name = name;
    if (price) shoe.price = price;
    if (description) shoe.description = description;
    if (thumbnail) shoe.thumbnail = thumbnail;
    if (status !== undefined) shoe.status = status;
    if (imageShoe) shoe.imageShoe = imageShoe;


    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
    shoe.updateDate = formattedDate;

    let importQuanlityAll = shoe.importQuanlityAll || 0;
    let soldQuanlityAll = shoe.soldQuanlityAll || 0;
    const colorIds = new Set();
    const sizeIds = new Set();
    const storage = [];

    for (const storageItem of storageShoe) {
      const colorDoc = await Model.ColorShoeModel.findById(storageItem.colorShoe);
      if (!colorDoc) {
        continue;
      }
      colorIds.add(colorDoc._id);

      for (const size of storageItem.sizeShoe) {
        const sizeId = formatString(size.size);
        const sizeDoc = await Model.SizeShoeModel.findOneAndUpdate(
          { size: size.size },
          { $setOnInsert: { size: size.size, isEnable: true, sizeId: sizeId } },
          { new: true, upsert: true }
        );
        sizeIds.add(sizeDoc._id);

        const importQuantity = parseInt(size.quantity, 10);
        const soldQuanlity = parseInt(size.quantity, 10);

        let existingStorage = await Model.StorageShoeModel.findOne({
          shoeId: shoe._id,
          colorShoe: colorDoc._id,
          "sizeShoe.sizeId": sizeDoc._id,
        });

        if (existingStorage) {
          existingStorage.importQuanlity += importQuantity;
          existingStorage.soldQuanlity += soldQuanlity;

          const sizeIndex = existingStorage.sizeShoe.findIndex(
            (s) => s.sizeId.toString() === sizeDoc._id.toString()
          );
          if (sizeIndex > -1) {
            existingStorage.sizeShoe[sizeIndex].quantity += importQuantity;
          }

          await existingStorage.save();
          storage.push({
            importQuanlity: existingStorage.importQuanlity,
            soldQuanlity: existingStorage.soldQuanlity,
            _id: existingStorage._id,
          });
        } else {
          const newStorage = new Model.StorageShoeModel({
            shoeId: shoe._id,
            colorShoe: colorDoc._id,
            sizeShoe: [
              {
                sizeId: sizeDoc._id,
                quantity: importQuantity,
              },
            ],
            importQuanlity: importQuantity,
            soldQuanlity: soldQuanlity,
          });

          const savedStorage = await newStorage.save();

          storage.push({
            importQuanlity: savedStorage.importQuanlity,
            soldQuanlity: savedStorage.soldQuanlity,
            _id: savedStorage._id,
          });
        }

        importQuanlityAll += importQuantity;
        soldQuanlityAll += soldQuanlity;
      }
    }

    shoe.colorShoe = [...colorIds];
    shoe.sizeShoe = [...sizeIds];
    shoe.storageShoe = storage;
    shoe.importQuanlityAll = importQuanlityAll;
    shoe.soldQuanlityAll = soldQuanlityAll;

    await shoe.save();

    console.log("Shoe updated successfully:", shoe);

    res.status(200).json({ message: "Shoe updated successfully", data: shoe });
  } catch (error) {
    console.error("Error during shoe update:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

exports.rateShoe = async (req, res) => {
  try {
    const { shoeId, userId, rateNumber, commentText } = req.body;

    const shoe = await Model.ShoeModel.findById(shoeId);
    if (!shoe) {
      return res.status(404).json({ message: "Shoe not found" });
    }

    const user = await Model.UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newComment = {
      userName: user._id,
      commetText: commentText,
      rateNumber: rateNumber,
      createDate: formattedDate
    };
    
    shoe.rateShoe.comment.push(newComment);

    let totalRating = shoe.rateShoe.comment.reduce(
      (acc, curr) => acc + curr.rateNumber,
      0
    );
    shoe.rateShoe.starRate = parseFloat(
      (totalRating / shoe.rateShoe.comment.length).toFixed(1)
    );

    const updatedShoe = await shoe.save();

    res
      .status(200)
      .json({ message: "Rating added successfully", data: updatedShoe });
  } catch (error) {
    console.error("Error during rating:", error);
    res.status(500).json({ message: "Internal Server Error", error });
  }
};

exports.ADDFavourite = async (req, res, next) => {
  try {
    const { userId, shoeId } = req.body;
    const existingFavourite = await Model.FavouriteShoeModel.findOne({
      userId: userId,
    });
    if (existingFavourite) {
      if (!existingFavourite.shoeId.includes(shoeId)) {
        existingFavourite.shoeId.push(shoeId);
        await existingFavourite.save();
      }
    } else {
      await Model.FavouriteShoeModel.create({ userId, shoeId: [shoeId] });
    }

    res.status(200).json({ message: "Đã thêm vào yêu thích" });
  } catch (error) {
    return res.status(500).json({ msg: "Có lỗi xảy ra: " + error.message });
  }
};
exports.RemoveFavourites = async (req, res) => {
  try {
    const { userId, shoeId } = req.body;
    const existingFavourite = await Model.FavouriteShoeModel.findOne({
      userId: userId,
    });
    if (existingFavourite) {
      existingFavourite.shoeId = existingFavourite.shoeId.filter(
        (id) => id.toString() !== shoeId
      );
      await existingFavourite.save();
    }

    res.status(200).json({ message: "Đã xóa khỏi yêu thích" });
  } catch (error) {
    res.status(500).json({ error: "Lỗi khi xóa khỏi yêu thích" });
  }
};

exports.FindFavouritesByUserId = async (req, res) => {
  try {
    const favourites = await Model.FavouriteShoeModel.findOne({ userId:req.params.id })
    .populate("shoeId", "_id name thumbnail price")
    .populate("userId", "userName fullName _id");
    
    if (favourites) {
      res.status(200).json({message:'Favorite List',favourites});
    } else {
      res.status(404).json({ message: 'No favorites found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Lỗi khi lấy Favorite' });
  }
};
exports.getBanner = async (req,res) => {
  try {
    const banners = await Model.BannerModel.find({hide: false});
    if(!banners) {
      return res.status(404).json({ message: 'Banner not found'});
    };

    res.status(200).json({ message:"List of active banners", data: banners });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error', error });
  }
};

