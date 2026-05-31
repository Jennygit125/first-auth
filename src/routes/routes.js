const express = require ("express"); 
/*I think express is needed to run any path it handles req and res type stuff*/

const { signUp, signIn, makeAdmin, getAllUsers, publicMessage, getProfile, getReport, createReport, deleteUser, manualLockUser } = require("../controllers/controllers"); 
/*my functionic variable import was written automatically by vscode Note:- the router.post thing is case sensitive had to write the import manually then realised i wrote SignUp instead of signUp */

const { isAuthentication, authorizeRoles } = require("../utils/Authentication"); 
// authenticates and stuff

const router = express.Router(); 
/*Seems router is an express thingy makes sense since routes are paths*/

router.post("/signUp", signUp);
//sign up above quite obvious

router.get("/public/message", publicMessage);
//a message to u all

router.get("/user/profile", isAuthentication, authorizeRoles("admin","moderator", "user"), getProfile);
//lowest level access

router.get("/moderator/reports", isAuthentication, authorizeRoles("admin", "moderator"), getReport);
router.get("/admin/reports", isAuthentication, authorizeRoles("admin"), getReport);
//moderator report fetching only 

router.post("/moderator/reports", isAuthentication, authorizeRoles("moderator"), createReport);
//create report only moderator

router.delete("/admin/user/:id", isAuthentication, authorizeRoles("admin"), deleteUser);
//delete user

router.post("/user/:id/lock", isAuthentication, authorizeRoles("admin", "moderator"), manualLockUser);
//moderator locks for 1 day, admin can choose duration

router.post("/signIn", signIn);
//sign in here

router.post(
  "/admin/promote/:id",
  isAuthentication,
  authorizeRoles("admin"),
  makeAdmin
);
//looks complicated but simply makes a user admin only admin can make admin

router.get("/admin/getAllUsers", isAuthentication, authorizeRoles("admin","moderator"), getAllUsers);
//only admin can view all users gives info needed to delete 


module.exports = router;//routes needs to be known by machine so it can be called
