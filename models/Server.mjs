import { DataTypes } from 'sequelize';
import sequelize from '../database.mjs';

const Server = sequelize.define('Server', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  address: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  reason: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

export default Server;
