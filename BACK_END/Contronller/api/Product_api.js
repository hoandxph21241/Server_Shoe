var Model = require("../../Models/DB_Shoes");

exports.GetAllBrand = async (req, res, next) => {
  msg = "Danh sach Du Lieu Thuong Hieu";

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

exports.FindBrand= async (req, res, next) => {
  try {
    let brandId = req.params.id;
    let brand = await Model.TypeShoeModel.findById(brandId);
    if (brand) {
      console.log(brand);
      return res.status(200).json(brand);
    } else {
      return res.status(404).json({ msg: "Không tìm thấy id này" });
    }
  } catch (error) {
    return res.status(500).json({ msg: "Có lỗi xảy ra: " + error.message });
  }
};

exports.AddBrand = async (req, res, next) => {
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
        .json({ success: false, message: "Đã tồn tại một Brand tương tự" });
    }
    const newShoe = new Model.TypeShoeModel({ nameType, imageType });
    await newShoe.save();
    console.log(`Thêm Brand thành công: ${nameType}`);
    return res
      .status(200)
      .json({ success: true, message: "Thêm Brand thành công" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};
exports.UpdateBrand = async (req, res, next) => {
  const { nameType, imageType } = req.body;
  let id = req.params.id;
  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Vui lòng cung cấp id" });
  }
  try {
    const idBrand = await Model.TypeShoeModel.findById(id);
    if (!idBrand) {
      return res
        .status(400)
        .json({ success: false, message: "id không được để trống" });
    }
    idBrand.nameType = nameType || idBrand.nameType;
    idBrand.imageType = imageType || idBrand.imageType;
    await idBrand.save();
    console.log(`Đã cập nhật Brand: ${idBrand.nameType}`);
    return res
      .status(200)
      .json({ success: true, message: "Đã cập nhật Brand thành công" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, message: "Lỗi máy chủ" });
  }
};

exports.DeleteBrand = async (req, res, next) => {
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
        .json({ success: false, message: "Brand không tồn tại" });
    }
    await Model.TypeShoeModel.findByIdAndDelete(id);
    console.log(`Đã xóa Thành Công`);
    return res
      .status(200)
      .json({ success: true, message: "Đã xóa Brand thành công" });
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
    let shoe = await Model.ShoeModel.find()
      .populate({
        path: "shoeDetail",
        select: "sizeShoe imageShoe colorShoe -_id",
        populate: [
          {
            path: "sizeShoe",
            match: { isEnable: true },
            select: "size quanlity _id",
          },
          { path: "imageShoe", select: "imageShoe _id" },
          { path: "colorShoe", select: "textColor codeColor _id" },
        ],
      })
      .populate("brandShoe", "_id");

    if (shoe) {
      console.log(shoe);
      return res.status(200).json(shoe);
    } else {
      return res.status(404).json({ msg: "Không tìm sản phẩm" });
    }
  } catch (error) {
    return res.status(500).json({ msg: "Có lỗi xảy ra: " + error.message });
  }
  // res.status(200).json({msg});
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


exports.HiddenProduct = async (req, res, next) => {
  try {
    let shoeId = req.params.id;
    let shoe = await Model.ShoeModel.findByIdAndUpdate(shoeId).populate();
    if (!shoe) {
      return res.status(404).json({ msg: "Không tìm thấy sản phẩm" });
    }
    shoe.hidden = !shoe.hidden;
    await shoe.save();
    return res.status(200).json(shoe);
  } catch (error) {
    console.error("Lỗi khi chuyển đổi trạng thái ẩn hiện của sản phẩm:", error);
    return res.status(500).json({
      msg: "Có lỗi xảy ra khi chuyển đổi trạng thái ẩn hiện của sản phẩm",
    });
  }
};


exports.FindProductsByBrandId = async (req, res, next) => {
  try {
    let brandId = req.params.id;
    let shoes = await Model.ShoeModel.find({ brandShoe: brandId })
      // .populate({
      //   path: 'shoeDetail',
      //   populate: [
      //     { path: 'sizeShoe', match: { isEnable: true } },
      //     { path: 'imageShoe' },
      //     { path: 'colorShoe' },
      //   ]
      // })
      .populate("brandShoe");

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
    const { idBrand, sizeId, idColor, shoeId } = req.params;
    let query = {};
    let populateOptions = [];
    if (idBrand && idBrand !== 'null') query.brandShoe = idBrand;
    if (shoeId && shoeId !== 'null') query.shoeId = shoeId;
    if (sizeId && sizeId !== 'null') {
      populateOptions.push({
        path: 'sizeShoe',
        match: { sizeId: sizeId }
      });
    } else {
      populateOptions.push({ path: 'sizeShoe' });
    }

    if (idColor && idColor !== 'null') {
      populateOptions.push({
        path: 'colorShoe',
        match: { _id: idColor }
      });
    } else {
      populateOptions.push({ path: 'colorShoe' });
    }

    // Tìm kiếm và populate dữ liệu
    const shoes = await Model.ShoeModel.find(query).populate({
      path: 'shoeDetail',
      populate: populateOptions
    });

    // Lọc và trả về kết quả dựa trên điều kiện match
    const filteredShoes = shoes.filter(shoe => {
      const detail = shoe.shoeDetail;
      return detail && (!sizeId || sizeId === 'null' || detail.sizeShoe.length > 0) && (!idColor || idColor === 'null' || detail.colorShoe);
    });

    if (filteredShoes.length > 0) {
      return res.status(200).json(filteredShoes);
    } else {
      return res.status(404).json({ msg: "Không tìm thấy sản phẩm nào phù hợp" });
    }
  } catch (error) {
    return res.status(500).json({ msg: "Có lỗi xảy ra: " + error.message });
  }
};


const formatString = (inputString) => {
  return inputString.toLowerCase().replace(/\s+/g, '-');
};

exports.ADD_Product = async (req, res) => {
  try {
    const {
      name,
      price,
      description,
      brandShoeId,
      thumbnail,
      hidden,
      sizes,
      imageShoe,
      colorShoe
    } = req.body;

    let shoe = await Model.ShoeModel.findOne({ name });
    if (shoe) {
      return res.status(400).json({ message: 'Shoe already exists' });
    }

    const brand = await Model.TypeShoeModel.findById(brandShoeId);
    const shoeId = formatString(brand.nameType);

    shoe = new Model.ShoeModel({
      shoeId,
      name,
      price,
      description,
      brandShoe: brandShoeId,
      thumbnail,
      hidden,
      shoeDetail: null
    });

    const savedShoe = await shoe.save();
    console.log('Shoe created successfully:', savedShoe);

    const sizeIds = [];
    for (const size of sizes) {
      let newSize = new Model.SizeShoeModel({
        size: size.size,
        quanlity: size.quanlity,
        isEnable: true,
        sizeId: formatString(size.size)
      });
      await newSize.save();
      sizeIds.push(newSize._id);
    }

    const newImage = new Model.ImageShoeModel({
      shoeId: savedShoe._id,
      imageShoe: imageShoe
    });
    const savedImage = await newImage.save();
    console.log('Image Array created:', savedImage);

    const newShoeDetail = new Model.ShoeDetailModel({
      shoeId: savedShoe._id,
      sizeShoe: sizeIds,
      imageShoe: savedImage._id,
      colorShoe: colorShoe
    });
    const savedShoeDetail = await newShoeDetail.save();
    console.log('ShoeDetail created:', savedShoeDetail);

    const updatedShoe = await Model.ShoeModel.findByIdAndUpdate(
      savedShoe._id,
      { shoeDetail: savedShoeDetail._id },
      { new: true }
    );
    res.status(201).json({ message: 'Shoe and ShoeDetail created successfully', shoe: updatedShoe });
  } catch (error) {
    console.error('Error during shoe creation: ', error);
    res.status(500).json({ message: 'Internal Server Error', error });
  }
};
