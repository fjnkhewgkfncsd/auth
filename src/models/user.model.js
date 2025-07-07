export default (sequelize, DataTypes) => 
    sequelize.define("User",{
        username: DataTypes.STRING,
        password: DataTypes.STRING,
        email: DataTypes.STRING
    })

