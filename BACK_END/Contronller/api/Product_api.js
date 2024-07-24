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

    if (shoes.length > 0) {
      return res.status(200).json(shoes);
    } else {
      return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });
    }
  } catch (error) {
    return res.status(500).json({ msg: "Có lỗi xảy ra: " + error.message });
  }
};

exports.FindProduct = async (req, res, next) => {
  try {
    let shoeId = req.params.id;
    let shoe = await Model.ShoeModel.findById(shoeId);
    if (shoe) {
      console.log(shoe);
      return res.status(200).json(shoe);
    } else {
      return res.status(404).json({ msg: "Không tìm sản phẩm với id này" });
    }
  } catch (error) {
    return res.status(500).json({ msg: "Có lỗi xảy ra: " + error.message });
  }
  // res.status(200).json({msg});
};

exports.FindByName = async (req, res, next) => {
  try {
    let conditions = {};
    if (req.query.name) {
      const productName = decodeURIComponent(req.query.name);
      conditions.name = new RegExp(productName, "i");
    }
    const shoes = await Model.ShoeModel.find(conditions);
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
}; development
};


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
    } = req.body;
    console.log("data add " + req.body);

    let shoe = await Model.ShoeModel.findOne({ name });
    if (shoe) {
      return res.status(400).json({ message: "Shoe already exists" });
    }

    const type = await Model.TypeShoeModel.findB
    const shoeId = formatString(type.nameType);
    const colorIds = new Set();
    const sizeIds = new Set();

    let importQuanlityAll = 0;
    let soldQuanlityAll = 0;
    const storage = [];
    for (const storageItem of storageShoe) {
      const colorDoc = await Model.ColorShoeModel.findById(
        storageItem.colorShoe
      );
      colorIds.add(colorDoc._id);

      for (const size of storageItem.sizeShoe) {
        const sizeId = formatString(size.size);
        const sizeDoc = await Model.SizeShoeModel.findOneAndUpdate(
          { size: size.size },
          { $setOnInsert: { size: size.size, isEnable: true, sizeId: sizeId } },
          { new: true, upsert: true }
        );
        sizeIds.add(sizeDoc._id);

        const importQuantity = parseInt(size.quantity);
        const soldQuantity = parseInt(size.quantity);

        importQuanlityAll += importQuantity;
        soldQuanlityAll += soldQuantity;

        storage.push({
          colorShoe: colorDoc._id,
          sizeShoe: sizeDoc._id,
          importQuanlity: parseInt(size.quantity),
          sellQuanlity: 0,
          soldQuanlity: parseInt(size.quantity),
        });
      }
    }

    shoe = new Model.ShoeModel({
      shoeId,
      name,
      price,
      description,
      typerShoe: type._id,
      thumbnail,
      status,
      imageShoe,
      colorShoe: [...colorIds],
      sizeShoe: [...sizeIds],
      storageShoe: storage,
      importQuanlityAll,
      soldQuanlityAll,
    });

    const savedShoe = await shoe.save();
    console.log("Shoe created successfully:", savedShoe);

    res
      .status(201)
      .json({ message: "Shoe created successfully", data: savedShoe });
  } catch (error) {
    console.error("Error during shoe creation:", error);
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
      commentText: commentText,
      rateNumber: rateNumber,
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
    const { userId, shoeId } = req.params;

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
    .populate("shoeId", "name _id")
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

