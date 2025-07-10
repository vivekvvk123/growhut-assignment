const express = require('express');
const path = require('path'); 
const bcrypt = require('bcrypt');
const {v4: uuidv4} = require('uuid');
const fs = require('fs')
var validator = require("email-validator");


const bodyParser = require('body-parser');
const app = express();

const userJsonPath = path.join(__dirname, 'users.json');


//middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const validEmail = (email)=>{
    return validator.validate(email);
}

const users = [{
    username: "admin",
    email:"admin@gmail.com",
    password: "32wlfjk8953ujoperi"
}]

const saveUsers = (users) => {
    fs.writeFileSync(userJsonPath, JSON.stringify(users, null, 2));
};

const loadUsers = () =>{
    if(!fs.existsSync(userJsonPath)){
        return [];
    }
    const data = fs.readFileSync(userJsonPath, 'utf-8');
    try {
        return JSON.parse(data);
    } catch (error) {
        console.error("Error parsing users data:", error);
        return [];
    }   
}


app.post('/register', async( req, res) => {
    const {username, email, password} = req.body;
    if(!username || !email || !password){
        res.send("All fields are rrequired");
        return;
    }
    if(!validEmail(email)){
        return res.send("Invalid email");
    }
    if(password.length < 8){
        return res.send("Minimum 8 characters required");
    }

    const users = loadUsers();

    
    //to check for record duplicacy
    const existingUser = users.find(user => user.email === email);
    if(existingUser){
        res.send("user already exists");
        return;
    }
    //hashing the passowrd
    const hashedPassword = await bcrypt.hash(password, 10);

    //Now creating user
    const newUser = {
        id: uuidv4(),
        username,
        email,
        password: hashedPassword
    }

    //saving user to json file
    users.push(newUser);
    saveUsers(users);
    return res.send({message:"User registered successfully", userId: newUser.id});

})

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, ''));
})


app.listen(3000, () => {
    console.log("server running on port 3000");
})