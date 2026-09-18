const mongoose = require('mongoose');
const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const RestaurantSettings = require('../models/RestaurantSettings');
const { getNextOrderNumber } = require('../utils/orderNumber');
const { generateWhatsAppMessage, generateWhatsAppUrl } = require('../utils/whatsapp');

/**
 * Create a new order with server-side validation and price calculation
 * POST /api/orders
 */
const createOrder = async (req, res, next) => {
  try {
    const { customer, items } = req.body || {};

    // 1. Customer Validation
    if (!customer || typeof customer !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Macluumaadka macaamiilka ayaa loo baahan yahay (Customer information is required)',
      });
    }

    const name = customer.name ? String(customer.name).trim() : '';
    if (!name || name.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Fadlan geli magacaaga oo buuxa (ugu yaraan 2 xaraf) / Customer name must be at least 2 characters',
      });
    }
    if (name.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Magaca macaamiilku ma dhaafi karo 100 xaraf / Customer name cannot exceed 100 characters',
      });
    }

    const phone = customer.phone ? String(customer.phone).trim() : '';
    const cleanPhone = phone.replace(/[\s-+()]/g, '');
    if (!phone || cleanPhone.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Fadlan geli lambar telefoon oo sax ah (ugu yaraan 6 lambar) / Valid customer phone is required',
      });
    }
    if (phone.length > 25) {
      return res.status(400).json({
        success: false,
        message: 'Lambarka telefoonku ma dhaafi karo 25 xaraf / Phone number cannot exceed 25 characters',
      });
    }

    const notes = customer.notes ? String(customer.notes).trim().slice(0, 500) : '';

    // 2. Items Validation
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dalabku waa inuu ka koobnaadaa ugu yaraan hal cunto (Order must contain at least one item)',
      });
    }

    if (items.length > 50) {
      return res.status(400).json({
        success: false,
        message: 'Tirada cuntooyinka la dalban karo hal mar ma dhaafi karaan 50 nooc (Cannot exceed 50 distinct items)',
      });
    }

    // Validate structure of each item in request
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item || !item.menuItemId) {
        return res.status(400).json({
          success: false,
          message: `Cuntada booska ${i + 1} ma lahan ID sax ah (Item at index ${i} is missing menuItemId)`,
        });
      }

      if (!mongoose.Types.ObjectId.isValid(item.menuItemId)) {
        return res.status(400).json({
          success: false,
          message: `ID-ga cuntada "${item.menuItemId}" ma aha mid sax ah (Invalid menu item ID format)`,
        });
      }

      const qty = item.quantity;
      if (!Number.isInteger(qty) || qty < 1 || qty > 100) {
        return res.status(400).json({
          success: false,
          message: `Tirada cuntada waa inay noqotaa inta u dhaxaysa 1 iyo 100 (Quantity must be an integer between 1 and 100)`,
        });
      }
    }

    // 3. Database Lookup & Price Verification
    const itemIds = items.map((i) => i.menuItemId);
    const dbMenuItems = await MenuItem.find({ _id: { $in: itemIds } });
    const menuItemMap = new Map();
    dbMenuItems.forEach((item) => {
      menuItemMap.set(item._id.toString(), item);
    });

    const verifiedItems = [];
    let calculatedTotal = 0;

    for (const item of items) {
      const dbItem = menuItemMap.get(item.menuItemId.toString());

      if (!dbItem) {
        return res.status(400).json({
          success: false,
          message: `Cuntada ID-geedu yahay "${item.menuItemId}" lagama helin menu-ga (Menu item not found)`,
        });
      }

      if (dbItem.isAvailable === false) {
        return res.status(400).json({
          success: false,
          message: `Cuntada "${dbItem.name}" hadda ma diyaarsana (waa go'day) / "${dbItem.name}" is currently unavailable`,
        });
      }

      // CRITICAL: Server-side calculation ignores any client price!
      const itemPrice = Number(dbItem.price);
      const subtotal = Math.round(itemPrice * item.quantity * 100) / 100;
      calculatedTotal += subtotal;

      verifiedItems.push({
        menuItem: dbItem._id,
        name: dbItem.name,
        price: itemPrice,
        quantity: item.quantity,
        subtotal: subtotal,
      });
    }

    calculatedTotal = Math.round(calculatedTotal * 100) / 100;

    // 4. Generate Unique Human-Friendly Order Number
    const orderNumber = await getNextOrderNumber();

    const tempOrderData = {
      orderNumber,
      customer: {
        name,
        phone,
        notes,
      },
      items: verifiedItems,
      total: calculatedTotal,
      currency: 'USD',
    };

    // 5. Build WhatsApp Message and URL using dynamic settings
    const settings = await RestaurantSettings.getSettings();
    const targetWhatsApp = settings?.whatsapp;

    const whatsappMessage = generateWhatsAppMessage(tempOrderData);
    const whatsappUrl = generateWhatsAppUrl(tempOrderData, targetWhatsApp);

    // 6. Save Order in MongoDB
    const order = new Order({
      orderNumber,
      customer: {
        name,
        phone,
        notes,
      },
      items: verifiedItems,
      total: calculatedTotal,
      currency: 'USD',
      status: 'pending',
      whatsappUrl,
      whatsappMessage,
    });

    await order.save();

    // 7. Return Clean Response (No internal secrets or raw DB internals)
    return res.status(201).json({
      success: true,
      message: 'Dalabkaaga si guul leh ayaa loo diiwaangeliyey (Order created successfully)',
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        currency: order.currency,
        status: order.status,
        customer: {
          name: order.customer.name,
          phone: order.customer.phone,
          notes: order.customer.notes,
        },
        items: order.items.map((i) => ({
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          subtotal: i.subtotal,
        })),
        whatsappMessage: order.whatsappMessage,
        whatsappUrl: order.whatsappUrl,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get Order Details by ID or Order Number
 * GET /api/orders/:id
 */
const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let query;
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { _id: id };
    } else {
      query = { orderNumber: id };
    }

    const order = await Order.findOne(query);

    if (!order) {
      return res.status(400).json({
        success: false,
        message: 'Dalabka lama helin (Order not found)',
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        total: order.total,
        currency: order.currency,
        status: order.status,
        customer: order.customer,
        items: order.items,
        whatsappUrl: order.whatsappUrl,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrderById,
};
