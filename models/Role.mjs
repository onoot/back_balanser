// models/Role.mjs
import { DataTypes } from 'sequelize';
import sequelize from '../database.mjs';

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'roles',
});

export default Role;
