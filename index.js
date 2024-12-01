const express = require("express");
const bcrypt = require("bcrypt");
const {UserModel, TodoModel} = require("./db");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const JWT_SECRET="shankar123"
const { z }  = require("zod");



mongoose.connect("mongodb+srv://shnkxr1:Ic2lrrfg19VE2HTE@cluster0.fiv1h.mongodb.net/todo-shnxr-db")

const app = express();
app.use(express.json());

 
app.post("/signup", async function (req, res){
    const requiredBody =z.object({
        email: z.string().min(3).max(100).email(),
        name: z.string(),
        password: z.string()


    })

    const parsedDataWithSuccess =requiredBody.safeParse(req.body)
    if(!parsedDataWithSuccess.success){
        res.json({
            message: "Incorrect format"

        })
        return
    }
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    try{
    const hashedPassword = await bcrypt.hash(password,4);
    console.log(hashedPassword);
    await UserModel.create({

        email:email,
        password:hashedPassword,
        name:name
    });
} catch(e){

}
    res.json(
        {
            message:" you are signed in"
        }
    )

});
app.post("/signin",async function (req, res){
    const email = req.body.username;
    const password = req.body.password;

    const user = await UserModel.findOne({
        email:email,

         });
         if(!user){
            res.status(403).json({
                message:"this user does not exist in our dB"
            })
         }
         const matchedPassword = await bcrypt.compare(password, user.password)

    
    if(matchedPassword){
        const token= jwt.sign(
            {
                id: user._id.toString()
            },JWT_SECRET);
    
        res.json({
           token: token
        });
     } else{
        res.status(403).json({
            message: " Incorrect credentials"

        })

        }
    }



);

app.post("/todo",auth, async function (req, res){
     const userId = req.userId;
     const title = req.body.title;
     const done= req.body.done;

     await TodoModel.create({
        userId,
        title,
        done
     });
     res.json({
        message: " todo created"
     })

});


app.get("/todos",auth, async function (req, res){
    const userId = req.userId;
    const todos = await TodoModel.find({
        userId
    })
    res.json({
        todos
    })
});
 function auth(req,res, next){
    const token = req.headers.token;

    const decodedData= jwt.verify(token, JWT_SECRET);
    if(decodedData){
        req.userId = decodedData.id;
        next();

    }
    else{
        res.status(403).json({
            message: " Incorrect credentials"
        })
    }
 }


app.listen(3000);