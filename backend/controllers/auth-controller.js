const User = require('../models/user-model');

const signup = async (req, res) => {
    res.send('Signups');
}

const login = async (req, res) => {
    res.send('login');
}

const logout = async (req, res) => {
    res.send('logout');
}

module.exports = {
    signup,
    login,
    logout
};