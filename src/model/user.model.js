import { dbPool } from "../../index.js";

export const findUserById = async (id) => {
  const res = await dbPool.query("SELECT * FROM users WHERE id = $1", [id]);
  return res.rows[0] ? formatUser(res.rows[0]) : null;
};

export const findUserByEmail = async (email) => {
  const res = await dbPool.query("SELECT * FROM users WHERE email = $1", [email]);
  return res.rows[0] ? formatUser(res.rows[0]) : null;
};

export const createUser = async ({ username, email, password }) => {
  const res = await dbPool.query(
    `INSERT INTO users (username, email, password)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [username, email, password]
  );
  return formatUser(res.rows[0]);
};

export const findAllUsers = async () => {
  const res = await dbPool.query("SELECT * FROM users ORDER BY created_at DESC");
  return res.rows.map(formatUser);
};

export const deleteUserById = async (id) => {
  const res = await dbPool.query("DELETE FROM users WHERE id = $1 RETURNING *", [id]);
  return res.rows[0] ? formatUser(res.rows[0]) : null;
};

export const updateUserById = async (id, { username, profession, bio, profileImage }) => {
  const res = await dbPool.query(
    `UPDATE users
     SET username = COALESCE($1, username),
         profession = COALESCE($2, profession),
         bio = COALESCE($3, bio),
         profile_image = COALESCE($4, profile_image),
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $5
     RETURNING *`,
    [username, profession, bio, profileImage, id]
  );
  return res.rows[0] ? formatUser(res.rows[0]) : null;
};

export const updateUserRoleById = async (id, role) => {
  const res = await dbPool.query(
    `UPDATE users
     SET role = $1, updated_at = CURRENT_TIMESTAMP
     WHERE id = $2
     RETURNING *`,
    [role, id]
  );
  return res.rows[0] ? formatUser(res.rows[0]) : null;
};

export const countUsers = async () => {
  const res = await dbPool.query("SELECT COUNT(*) FROM users");
  return parseInt(res.rows[0].count, 10);
};

const formatUser = (row) => ({
  _id: row.id,
  id: row.id,
  username: row.username,
  email: row.email,
  password: row.password,
  profileImage: row.profile_image,
  role: row.role,
  bio: row.bio,
  profession: row.profession,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export default {
  findUserById,
  findUserByEmail,
  createUser,
  findAllUsers,
  deleteUserById,
  updateUserById,
  updateUserRoleById,
  countUsers,
};