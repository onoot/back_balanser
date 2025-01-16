import { DataTypes } from 'sequelize';
import sequelize from '../database.mjs';

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.DECIMAL,
    allowNull: false,
  },
  reward: {
    type: DataTypes.INTEGER,
    allowNull: true, // Разрешаем null, если reward не всегда есть
  },
  number: {
    type: DataTypes.INTEGER,
    allowNull: true, // Разрешаем null, если number не всегда есть
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true, // Разрешаем null, если link не всегда есть
  },
  category: {
    type: DataTypes.STRING,
    allowNull: true, // Разрешаем null, если category не всегда есть
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true, // Разрешаем null, если image не всегда есть
  },
}, {
  tableName: 'tasks',
});

export default Task;