const bcrypt = require("bcrypt"); //password hasher
const jwt = require("jsonwebtoken")
const User = require("../models/model.js"); // schema summon
const Report = require("../models/report.model.js");
const logActivity = require("../utils/activityLogger.js");

const publicMessage = async(req, res) => {return res.status(200).json({message:"This route is public"});
}
const signUp = async(req, res) => {
    const{firstName, lastName, email, password} = req.body // stores input from body
    try{
        if(!firstName||!lastName||!email||!password)
            /*if no first name or no last name or no email or no password run the next code:-*/
        {
            return res.status(400).json({message:"All fields required"});
        }
        const user = await User.findOne({email});//find user by email

        if(user)/*if user with email was found i.e user with email= true run code in the brackets:-*/
        {
            return res.status(400).json({message:"User already exist"});
        }

        const hashedPassword = await bcrypt.hash(password, 10); //call bcrypt to hash password and save hashed password

        const newUser = await User.create({firstName, lastName, email, password: hashedPassword}); // creates a user with the variables should check schema (User is the schema it calls from model and was declared above)

        return res.status(201)
        .json({message: "User created successfully", user: {
        id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email
}});
    }

    catch(e)/*catch any error lol*/{
        console.log(e);
        return res.status(500)
        .json({message: "Internal server error?"});
    }/*end of error catcher*/
}// end of signUp


const signIn = async (req, res) => {
    const {email, password} = req.body;/*same shit but only creates email and password*/
    try{
        if(!email||!password)/*if no password or no email run code*/{
            return res.status(400)
            .json({message: "email and password are required"});
        }

        const user = await User.findOne({email}).select("+password");/*this searches by email and forcibly selects password which was set to unselectable to avoid hackers and stuff*/

        if(!user)/*if no user found run code:-*/{
            await logActivity({
                action: "FAILED_LOGIN",
                ipAddress: req.ip,
                metadata: {
                    email,
                    reason: "USER_NOT_FOUND"
                }
            });

            return res.status(400)
            .json({message:"invalid email or password"})
        }

        const now = new Date();
        const tenMinutes = 10 * 60 * 1000;
        const fifteenMinutes = 15 * 60 * 1000;

        if (user.lockUntil && user.lockUntil > now) {
            await logActivity({
                action: "FAILED_LOGIN",
                user: user._id,
                ipAddress: req.ip,
                metadata: {
                    email,
                    reason: "ACCOUNT_LOCKED",
                    lockUntil: user.lockUntil
                }
            });

            return res.status(423).json({
                message: "Account locked. Try again later."
            });
        }

        if (user.lockUntil && user.lockUntil <= now) {
            user.failedLoginAttempts = 0;
            user.firstFailedLoginAt = null;
            user.lockUntil = null;
            await user.save();
        }

        const pass = await bcrypt.compare(password, user.password); //asks bcrypt to compare both passwords only bcrypt can decipher the hashed password stuff
        
        if(!pass) /*if password not same (actually returns true or false which is negated by ! so false becomes true and if true run code:-) */ 
        {
            const firstFailedAt = user.firstFailedLoginAt;
            const withinWindow = firstFailedAt && now - firstFailedAt <= tenMinutes;

            if (!withinWindow) {
                user.failedLoginAttempts = 1;
                user.firstFailedLoginAt = now;
                user.lockUntil = null;
            }
            else {
                user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

                if (user.failedLoginAttempts >= 5) {
                    user.lockUntil = new Date(now.getTime() + fifteenMinutes);
                }
            }

            await user.save();

            await logActivity({
                action: "FAILED_LOGIN",
                user: user._id,
                ipAddress: req.ip,
                metadata: {
                    email,
                    reason: "INVALID_PASSWORD",
                    failedLoginAttempts: user.failedLoginAttempts,
                    lockUntil: user.lockUntil
                }
            });

            if (user.lockUntil && user.lockUntil > now) {
                return res.status(423).json({
                    message: "Account locked after too many failed login attempts. Try again in 15 minutes."
                });
            }

            return res.status(400)
            .json({message:"invalid email or password"})
        }

        /* Note if above code runs i.e  the invalid email stuff runs the return will stop code below from running*/

        user.failedLoginAttempts = 0;
        user.firstFailedLoginAt = null;
        user.lockUntil = null;
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" })

        return res.status(200).json({ message: "User signed in successfully", user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
        }, token // returns everything except password or hashed password no where in my code would you find the password it lives and stays in the database

    });
    }

   catch(e){
        console.log(e);
        return res.status(500)
        .json({message: "Internal server error?"});
    }
}
const makeAdmin = async (req,res) => {
    const {id} = req.params;

    try{
        const user = await User.findById(id);
        if(!user){
            return res.status(404)
            .json({message: "User not found"});
        } 
        if(req.user.role !== "admin")
            /*Not needed but rechecks if your role is appropriate*/
        {
          return res.status(403)
         .json({message: "Unauthorized action"})
        }
        if (user.role === "admin") {
           return res.status(400).json({ message: "Cannot promote another admin" });
        }
        user.role = "admin";
        await user.save();
        return res.status(200)
        .json({message: "user now admin"})
    }
    catch(e){
        console.log(e);
        return res.status(500)
        .json({message:"internal server error"});
    }
 }
 const getAllUsers = async (req, res) => {
    if(req.user.role !== "admin" && req.user.role !== "moderator")
        /*Not needed but rechecks if your role is appropriate*/
    {
        return res.status(403)
        .json({message: "Unauthorized action"})
    }
    try{
        const users = await User.find().select("-password");
        return res.status(200)
        .json({users});
    }
    catch (e){
        console.log(e);
        return res.status(500)
        .json({message: "internal server error"});
    }
 }

 const getProfile =async (req, res) => 
    /*get's profile*/{
    return res.status(200).json({
  user: {
    id: req.user._id,
    firstName: req.user.firstName,
    lastName: req.user.lastName,
    email: req.user.email,
    role: req.user.role
  }
});
 }

 const getReport = async (req, res) => 
    /*admin can view moderator reports path for moderators exist too though*/
 {
    try {
        const filter = req.user.role === "admin" ? {} : { moderator: req.user._id };
        const reports = await Report.find(filter)
        .populate("moderator", "firstName lastName email role")
        .sort({ createdAt: -1 })
        .lean();

        return res.status(200).json({ reports });
    }
    catch (e) {
        console.log(e);
        return res.status(500)
        .json({message: "internal server error"});
    }
 }

 const createReport = async (req, res) => /*only moderators can create reports in a sense this reduces admin powers by a lot*/{
    const { contentId, contentType, reportType, description, priority, actionTaken } = req.body;

    try {
        if (!contentId || !reportType || !description) {
            return res.status(400).json({ message: "contentId, reportType and description are required" });
        }

        const report = await Report.create/*moderator be snitching*/({
            contentId,
            contentType,
            reportType,
            description,
            priority,
            actionTaken,
            moderator: req.user._id
        });

        return res.status(201).json({ message: "Report created successfully", report });
    }
    catch (e) {
        console.log(e);
        return res.status(500)
        .json({message: "internal server error"});
    }
 }
 const deleteUser = async (req, res) => /*only admin can delete user*/{
    try {
        if (req.user._id.toString() === req.params.id) {
            return res.status(400).json({
                message: "Admins cannot delete themselves"
            });
        }

        const user = await User.findByIdAndDelete(req.params.id);// does the actual deleting
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await logActivity/*ensures i can blame u later*/({
            action: "ACCOUNT_DELETED",
            user: req.user._id,
            ipAddress: req.ip,
            metadata: {
                deletedUserId: user._id,
                deletedUserEmail: user.email,
                deletedUserRole: user.role
            }
        });

        return res.status(200).json({ message: "User deleted successfully" });
    }
    catch (e) {
        console.log(e);
        return res.status(500)
        .json({message: "internal server error"});
     }
  }

 const manualLockUser = async (req, res) => {
    const { id } = req.params;
    // yes i believe watching a user be disrespectful is very painful so i added manual lock
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const now = new Date();
        let lockUntil;

        if (req.user.role === "admin") /*as an admin is normal for me to block u for a million years*/{
            const { durationMinutes, lockUntil: requestedLockUntil } = req.body;

            if (requestedLockUntil) {
                lockUntil = new Date(requestedLockUntil);

                if (Number.isNaN(lockUntil.getTime()) || lockUntil <= now) {
                    return res.status(400).json({ message: "lockUntil must be a future date" });
                }
            }
            else /*as a moderator i think 1 day is enough*/{
                const minutes = durationMinutes === undefined ? 24 * 60 : Number(durationMinutes);

                if (!Number.isFinite(minutes) || minutes <= 0) {
                    return res.status(400).json({ message: "durationMinutes must be a positive number" });
                }

                lockUntil = new Date(now.getTime() + minutes * 60 * 1000);
            }
        }
        else {
            lockUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        }

        user.lockUntil = lockUntil;
        user.failedLoginAttempts = 0;
        user.firstFailedLoginAt = null;
        await user.save();

        await logActivity({
            action: "MANUAL_ACCOUNT_LOCK",
            user: req.user._id,
            ipAddress: req.ip,
            metadata: {
                targetUserId: user._id,
                targetUserEmail: user.email,
                targetUserRole: user.role,
                lockedByRole: req.user.role,
                lockUntil
            }
        });

        return res.status(200).json({
            message: "User account locked successfully",
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                lockUntil: user.lockUntil
            }
        });
    }
    catch (e) {
        console.log(e);
        return res.status(500)
        .json({ message: "internal server error" });
    }
 }

module.exports ={signUp, signIn, makeAdmin, getAllUsers, publicMessage, getProfile, getReport, createReport, deleteUser, manualLockUser}; 
//export both functionic variables, modules? don't know what to call it but it works like a function just call it and it runs
// Hope the code was easy to understand cause i have headache just thinking of reading random codes