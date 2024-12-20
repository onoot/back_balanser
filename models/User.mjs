// models/User.mjs
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.mjs';
import Role from './Role.mjs';

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  telegramId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Guest',
  },
  money: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  totalMoney: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  profit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  energy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 500,
  },
  lastEnergyUpdate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  rank: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  key: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  benefit: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  wallet:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  Invited:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  referral:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  referl_link:{
    type: DataTypes.STRING,
    allowNull: true,
  },
  tasks: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  daily_tasks: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  combo_daily_tasks: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: [],
  },
  combo_daily: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  roleId: {
    type: DataTypes.INTEGER,
    references: {
      model: Role,
      key: 'id',
    },
    allowNull: false,
    defaultValue: 4, 
  },
}, {
  tableName: 'users',
});

User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });

export default User;
