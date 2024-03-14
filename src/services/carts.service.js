const cartDao = require("../DAO/Mongo/cart-dao.mongo");
const { v4: uuidv4 } = require("uuid");
const { getUserById, updateUser } = require("./users.service");
const transporter = require("../utils/nodemailer.util");
const cart = new cartDao();

const getCartById = async (id) => {
  console.log("llegamos aca", id);

  const thisCart = await cart.getCartById(id);
  console.log(thisCart);
  return thisCart;
};

const getCarts = async () => {
  const carts = await cart.getCarts();
  return carts;
};
const addCart = async () => {
  const newCart = await cart.addCart();
  return newCart;
};

const getCartUserInfo = async (id) => {
  const userInfo = await getUserById(id);
  return userInfo;
};

const getCartTotalQuantity = async (cartId) => {
  const totalQuantity = await cart.totalQuantity(cartId);
  return totalQuantity;
};

const deleteProductFromCart = async (cartId, productId) => {
  const cart = await cart.deleteProductFromCart(cartId, productId);
  return cart;
};

const deleteCart = async (cartId) => {
  const cart = await cart.deleteCart(cartId);
  return cart;
};

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

const updateCartWithProductList = async (cartId, productList) => {
  const UpdatedCart = await cart.updateCartWithProductList(cartId, productList);
  return UpdatedCart;
};

const updateProductQuantityInCart = async (cartId, productId, quantity) => {
  const cart = await cart.updateProductQuantityInCart(
    cartId,
    productId,
    quantity
  );
  return cart;
};

const addProductToCart = async (req) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;
  const quantity = req.body.quantity || 1;
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

  .tableEmail{
    width: 100%;
  }

  .total{
    font-weight: bold;
    text-align: right;
    margin-right: 10px;
  }
</style><table class="tableEmail" ><tr><th>Cantidad</th><th>Producto</th><th>Precio</th></tr>${content}<tr><td>TOTAL:</td><td colspan="2" class="total"> ${amount}</td></tr></table>`;
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

module.exports = {
  createTicket,
  checkoutCart,
  getCartById,
  addProductToCart,
  addCart,
  getCarts,
  getCartUserInfo,
  getCartTotalQuantity,
  updateCartWithProductList,
  updateProductQuantityInCart,
  deleteProductFromCart,
  deleteCart,
};
