const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: [true, 'Menu item reference is required'],
    },
    name: {
      type: String,
      required: [true, 'Item name snapshot is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Item price snapshot is required'],
      min: [0, 'Item price cannot be negative'],
    },
    quantity: {
      type: Number,
      required: [true, 'Item quantity is required'],
      min: [1, 'Item quantity must be at least 1'],
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be an integer',
      },
    },
    subtotal: {
      type: Number,
      required: [true, 'Item subtotal is required'],
      min: [0, 'Item subtotal cannot be negative'],
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: [true, 'Order number is required'],
      unique: true,
      index: true,
      trim: true,
    },
    customer: {
      name: {
        type: String,
        required: [true, 'Customer name is required'],
        trim: true,
        minlength: [2, 'Customer name must be at least 2 characters'],
        maxlength: [100, 'Customer name cannot exceed 100 characters'],
      },
      phone: {
        type: String,
        required: [true, 'Customer phone is required'],
        trim: true,
        minlength: [6, 'Customer phone must be at least 6 characters'],
        maxlength: [25, 'Customer phone cannot exceed 25 characters'],
      },
      notes: {
        type: String,
        trim: true,
        default: '',
        maxlength: [500, 'Customer notes cannot exceed 500 characters'],
      },
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },
        message: 'An order must contain at least one item',
      },
    },
    total: {
      type: Number,
      required: [true, 'Order total is required'],
      min: [0, 'Order total cannot be negative'],
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    whatsappUrl: {
      type: String,
      default: null,
    },
    whatsappMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast retrieval by status and creation date
orderSchema.index({ createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
