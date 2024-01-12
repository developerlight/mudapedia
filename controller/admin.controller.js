import Admin from "../model/admin.schema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Content from "../model/content.schema.js";


const adminController = {
    test : async (req, res) => {
        res.send({ message: "Hello from admin controller"});
    },
    registerAdmin : async (req, res) => {
        try {

            const { username, password } = req.body;
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            const admin = new Admin({ username, password: hashedPassword });
            const result = await admin.save();

            if (!result) {
                return res.status(400).send({ message: "Admin not created"});
            }

            res.send({ message: "Admin created successfully" })
        } catch (error) {
            res.send({ message : error.message})
        }
    },
    loginAdmin : async (req, res) => {
        try {
            const { username, password } = req.body;
            const admin = await Admin.findOne({ username });
            const validPassword = await bcrypt.compare(password, admin.password);

            if (!validPassword) {
                return res.status(400).send({ message: "Invalid password"});
            }

            const token = jwt.sign({ adminId: admin.id }, process.env.SECRET_KEY, {
                algorithm: "HS256",
                allowInsecureKeySizes: true,
                expiresIn: 86400,
            });

            res.cookie("token", token, {
                httpOnly: true,
                secure: true,
                maxAge: 24 * 60 * 60 * 1000,
                sameSite: "none",
            });

            res.json({ message: "Login successful", id: admin._id });
        } catch (error) {
            res.send({ message : error.message})
        }
    },
    dashboard : async (req, res) => {
        try {
            res.send({ message: "Hello from admin dashboard"});
        } catch (error) {
            res.send({ message : error.message})
        }
    },
    createContent : async (req, res) => {
        try {
            const { title, thumbnail, description } = req.body;

            const content = new Content({ title, thumbnail, description });
            const result = await content.save();
            
            if (!result) {
                return res.status(400).send({ message: "Content not created"});
            }

            res.send({ message: "Content created successfully"});
        } catch (error) {
            res.send({ message : error.message})
        }
    },
    getContent : async (req, res) => {
        try {
            const content = await Content.find();

            if (!content) {
                return res.status(400).send({ message: "Content not found"});
            }

            res.send(content);
        } catch (error) {
            res.send({ message : error.message})
        }
    },
    updateContent : async (req, res) => {
        try {
            const id = req.params.id;
            const { title, thumbnail, description } = req.body;

            const content = await Content.findOneAndUpdate(
                { _id: id },
                { title, thumbnail, description },
                { new: true }
            );
            
            if (!content) {
                return res.status(400).send({ message: "Content not found"});
            }
            console.log(content);

            res.send({ message: "Content updated successfully"});
        } catch (error) {
            res.send({ message : error.message})
        }
    },
    deleteContent : async (req, res) => {
        try {
            const id = req.params.id;

            const content = await Content.findOneAndDelete({ _id: id });
            
            if (!content) {
                return res.status(400).send({ message: "Content not found"});
            }

            res.send({ message: "Content deleted successfully"});
        } catch (error) {
            res.send({ message : error.message})
        }
    }
}

export default adminController;