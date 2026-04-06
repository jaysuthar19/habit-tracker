import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
  const header = req.header("Authorization");

  if (!header) {
    return res.status(401).json({ msg: "No token" });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ msg: "Invalid token" });
  }
};

export default auth;