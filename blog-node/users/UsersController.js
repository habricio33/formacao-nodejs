import express from "express";
import User from "./User.js";
import bcrypt from "bcryptjs";


const router = express.Router();

router.get("/admin/users", (req, res) => {
    User.findAll().then(users => {
        res.render("admin/users/index",{users: users});
    });
})

router.get("/admin/users/create", (req, res) => { 
    res.render("admin/users/create")
});

router.post("/users/create", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    
    //pesquisa se ja existe email cadastrado
    User.findOne({where: {email: email}}).then((user) => {

        if(user == undefined) {

            let salt = bcrypt.genSaltSync(10);
            let hash = bcrypt.hashSync(password, salt);
            
            //cria o usuario caso o email não esteja no BD
            User.create({
                email: email,
                password: hash
            }).then(() => {
                res.redirect("/");
            }).catch((err) => {
                res.redirect("/");
            }); 

        } else {
            res.redirect("/admin/users");
        }        

});

});    

router.get("/login", (req, res) => {
    res.render("admin/users/login");
});

router.post("/authenticate", (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    
    User.findOne({where: {email: email}}).then((user) => {
        if(user != undefined) {
            
            //verifica se a senha é valida 
            let correct = bcrypt.compareSync(password, user.password);

            if(correct) {
                req.session.user = {
                    id: user.id,
                    email: user.email
                }
                res.redirect("/admin/articles");
                // res.json({ usuario: req.session.user });
            } else {
                res.redirect("/login");
            }
        } else {
            res.redirect("/login");
        }
    });
    
});

router.get("/logout", (req, res) => {
    req.session.user = undefined;
    res.redirect("/");
});

export default router;