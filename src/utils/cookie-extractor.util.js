const cookieExtractor = (req) => {
  const tokenKey = "authToken";
  if (req && req.cookies) {
    return req.cookies[tokenKey] || null;
  }
  return null;
};

module.exports = cookieExtractor;
