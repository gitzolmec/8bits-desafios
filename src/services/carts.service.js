const cartDao = require("../DAO/Mongo/cart-dao.mongo");
const { v4: uuidv4 } = require("uuid");
const { getUserById, updateUser } = require("./users.service");
const transporter = require("../utils/nodemailer.util");
const cart = new cartDao();

const checkoutCart = async (cartId) => {
  const checkoutInfo = await cart.checkoutCart(cartId);
  return checkoutInfo;
};
const createTicket = async (req, totalprice, purchaseDetails) => {
  const tokenid = req.user.id;

  const userInfo = await getUserById(tokenid);
  const { email, first_name, last_name } = userInfo;
  const userId = userInfo._id;
  const amount = totalprice;
  const code = uuidv4();
  const purchaser = email;
  const ticket = await cart.createTicket(
    purchaser,
    code,
    amount,
    purchaseDetails
  );
  const purchaseId = ticket._id;
  await updateUser(userId, purchaseId);
  sendEmail(first_name, last_name, email, purchaseDetails, amount);
  return ticket;
};

const getCartById = async (id) => {
  const cart = await cart.getCartById(id);
  return cart;
};

const addProductToCart = async (cartId, productId, quantity) => {
  const cart = await cart.addProductToCart(cartId, productId, quantity);
  return cart;
};

const sendEmail = async (
  first_name,
  last_name,
  email,
  purchaseDetails,
  amount
) => {
  const content = purchaseDetails
    .map(
      (data) =>
        `<tr><td>${data.quantity}</td><td>${data.title}</td><td>${data.price}</td></tr>`
    )
    .join("");
  const message = `<style>
  table, th, td {
    border: 1px solid  ;
    border-collapse: collapse;
    
    text-align: center;
    align-items: center;
  }
</style><table ><tr><th>Cantidad</th><th>Producto</th><th>Precio</th></tr>${content}<tr><td>TOTAL:</td><td> ${amount}</td></tr></table>`;
  const MailInfo = await transporter.sendMail({
    from: '"8-bits 🎮" <jorgemorales.600@gmail.com>',
    to: "jorgemorales_1991@hotmail.com",
    subject: "Compra Exitosa ✔",
    text: `Hola ${first_name} ${last_name}`,
    html: message,
  });
  console.log(purchaseDetails);
  console.log("Message sent: %s", MailInfo.messageId);
};

module.exports = { createTicket, checkoutCart, getCartById, addProductToCart };
