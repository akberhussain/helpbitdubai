var middlewareObj = {};

middlewareObj.checkIfAdmin = function(req, res, next){

    if(req.isAuthenticated()){
        var obj = {
            a:'5a43713198f27d1030ca180f'
        };
        if(req.user._id.equals(obj.a)){
            // res.redirect("/");
            
             next();
        }
        else{
            req.flash("error", "Your You do not have permission to Access the route !!!");
            res.redirect("back");
        }
    }
    else{
            req.flash("error", "Your You do not have permission to Access the route !!!");
        res.redirect("back");
    }
};

middlewareObj.checkIfServiceprovider = function(req, res, next){
    if(req.user && req.user.companyname){
        return next();
    }
    req.flash("error", "You dont have access permissions !");
    res.redirect("/");  
}

module.exports = middlewareObj;
