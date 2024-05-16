exports.ProductList = async (req,res,next) => {
    res.render('manager/product/product.ejs');
};

exports.VorcherList = async (req,res,next) => {
    res.render('manager/vorcher/vorcher.ejs');
};

exports.BannerList = async (req,res,next) => {
    res.render('manager/banner/banner.ejs');
};