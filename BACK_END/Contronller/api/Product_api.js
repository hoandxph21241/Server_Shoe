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