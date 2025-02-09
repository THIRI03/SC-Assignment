const bcrypt = require('bcrypt');

const saltRounds = 10;

// this will be used while logging in

module.exports.comparePassword = async (enteredPassword, storedPasswordHash) => {
    return await bcrypt.compare(enteredPassword, storedPasswordHash);
};


// Hash Password will be done in postman

module.exports.hashPassword = async (req, res, next) => {
    try {
        const password = req.body.password;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Update the password field with the hashed password
        req.body.password = hashedPassword;

        next();
    } catch (err) {
        console.error('Error bcrypt hashing password: ', err);
        return res.status(500).json({ message: 'Error hashing password.' });
    }
};
