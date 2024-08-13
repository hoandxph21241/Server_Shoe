var Model = require("../Models/DB_Shoes");

async function createDefaultData() {

  const adminExists = await Model.UserModel.findOne({ "role": 2 });
  if (!adminExists) {
    const defaultAdmin = new Model.UserModel({
      nameAccount: 'admin@example.com',
      namePassword: 'admin',
      userName: 'Admin',
      fullName: 'Admin',
      imageAccount: 'Admin',
      gmail: 'admin@example.com',
      grender: 'Male',
      phoneNumber: '1234567890',
      'role': 2
    });
    await defaultAdmin.save();
    console.log("Admin_Data_Create");
  } else {
    console.log("Admin_No_Create");
  }

  const userExists = await Model.UserModel.findOne({ "role": 1 });
  if (!userExists) {
    const defaultUser = new Model.UserModel({
      nameAccount: 'user@example.com',
      namePassword: 'user',
      userName: 'User',
      fullName: 'User',
      imageAccount: 'User',
      gmail: 'user@example.com',
      grender: 'Male',
      phoneNumber: '1234567890',
      'role': 1
    });
    await defaultUser.save();
    console.log("User_Data_Create");
  } else {
    console.log("User_No_Create");
  }

  const brands = [
    {
      name: "Air Jordan 1",
      image:
        "https://static.nike.com/a/images/f_auto,cs_srgb/w_1536,c_limit/vlwzp4wntlhwmctsuiph/air-force-1.jpg",
    },
    {
      name: "Dunk",
      image:
        "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/31efddc5-18f4-412d-831d-c87a09cb3a91/dunk-low-shoes-4x8b85.png",
    },
    {
      name: "Air Force 1",
      image:
        "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/ebad848a-13b1-46d5-a85e-49b4b6a4953c/air-force-1-le-older-shoe-TDGHCN.png",
    },
    {
      name: "Air Max",
      image:
        "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/15d2efc2-a009-4102-9548-ce5f3c70c8d0/air-max-solo-shoes-D0Mfh7.png",
    },
    {
      name: "Cortez",
      image:
        "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/np029vozcemdcdmebpwm/classic-cortez-shoe-8p3Qjt.png",
    },
    {
      name: "Blazer",
      image:
        "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/ff42d2ee-1bde-446a-a399-a3277d843f3d/blazer-mid-77-vintage-shoes-dNWPTj.png",
    },
    {
      name: "Pegasus",
      image:
        "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/353a41d1-56cc-4848-9993-63fae58ed79f/custom-pegasus-40-by-you.png",
    },
  ];

  for (const brand of brands) {
    const brandExists = await Model.TypeShoeModel.findOne({
      nameType: brand.name,
    });
    if (!brandExists) {
      const newBrand = new Model.TypeShoeModel({
        nameType: brand.name,
        imageType: brand.image,
      });
      await newBrand.save();
      console.log(`${brand.name} brand created`);
    } else {
      console.log(`${brand.name} brand already exists`);
    }
  }

  const colors = [
    { textColor: "White", codeColor: "#FFFFFF" },
    { textColor: "Black", codeColor: "#000000" },
    { textColor: "Red", codeColor: "#FF0000" },
    { textColor: "Blue", codeColor: "#0000FF" },
  ];

  for (const color of colors) {
    const colorExists = await Model.ColorShoeModel.findOne({
      textColor: color.textColor,
    });
    if (!colorExists) {
      const newColor = new Model.ColorShoeModel({
        textColor: color.textColor,
        codeColor: color.codeColor,
        isEnable: true,
      });
      await newColor.save();
      console.log(`Color ${color.textColor} created`);
    } else {
      console.log(`Color ${color.textColor} already exists`);
    }
  }

  
  function generateSizeId(sizeName) {
    const sizeId = sizeName.replace(/\s+/g, "-");
    return sizeId;
  }
  
  const sizes = [
    { size: "35.5", isEnable: true },
    { size: "36", isEnable: true },
    { size: "36.5", isEnable: true },
    { size: "37", isEnable: true },
    { size: "37.5", isEnable: true },
    { size: "38", isEnable: true },
    { size: "38.5", isEnable: true },
    { size: "39", isEnable: true },
    { size: "39.5", isEnable: true },
    { size: "40", isEnable: true },
  ];
  
  for (const size of sizes) {
    const sizeExists = await Model.SizeShoeModel.findOne({
      size: size.size,
    });
    if (!sizeExists) {
      const newSize = new Model.SizeShoeModel({
        size: size.size,
        isEnable: size.isEnable,
        sizeId: generateSizeId(size.size),
      });
      await newSize.save();
      console.log(`Size ${size.size} created`);
    } else {
      console.log(`Size ${size.size} already exists`);
    }
  }
  


  console.log("Finished_Create");
}

createDefaultData().catch(error => {
  console.error("Error:", error);
});





exports.yeu_cau_dang_nhap = (req, res, next) => {
  if (req.session.userLogin) {
    console.log("Đã Đăng Nhập")
    next();
  } else {
    console.log("Chưa Đăng Nhập");
    res.redirect("/auth/signin");
  }
};
