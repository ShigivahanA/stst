import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { encrypt, decrypt, isEncrypted, hashForLookup } from '../utils/encryption.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
    },
    emailHash: {
      type: String,
      unique: true,
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer',
    },
    refreshTokens: [
      {
        type: String,
      },
    ],
    forgotPasswordToken: {
      type: String,
      default: '',
    },
    forgotPasswordExpiry: {
      type: Date,
    },
    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          default: 1,
          min: [1, 'Quantity cannot be less than 1'],
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    lastCartEmailSentAt: {
      type: Date,
    },
    addresses: [
      {
        tag: {
          type: String,
          required: [true, 'Address tag is required'],
          trim: true,
        },
        doorNumber: {
          type: String,
          required: [true, 'Door / flat number is required'],
          trim: true,
        },
        secondLine: {
          type: String,
          trim: true,
        },
        landmark: {
          type: String,
          trim: true,
        },
        city: {
          type: String,
          required: [true, 'City is required'],
          trim: true,
        },
        state: {
          type: String,
          required: [true, 'State is required'],
          trim: true,
        },
        pincode: {
          type: String,
          required: [true, 'Pincode is required'],
          trim: true,
        },
      },
    ],
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorOtp: {
      type: String,
    },
    twoFactorOtpExpiry: {
      type: Date,
    },
    avatar: {
      type: String,
      default: '',
    },
    avatarPublicId: {
      type: String,
      default: '',
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
    isBanned: {
      type: Boolean,
      default: false,
    },
    banUntil: {
      type: Date,
      default: null,
    },
    banReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// ---------------------------------------------------------------------------
// Encryption hooks — encrypt before save, decrypt after read
// ---------------------------------------------------------------------------

// Fields to encrypt on the user document
const ENCRYPTED_USER_FIELDS = ['name', 'email'];
// Fields to encrypt on each address subdocument
const ENCRYPTED_ADDRESS_FIELDS = ['doorNumber', 'secondLine', 'landmark', 'city', 'state', 'pincode'];

/**
 * Helper: encrypt all sensitive fields on a user document.
 */
function encryptUserFields(doc) {
  // Encrypt top-level fields
  for (const field of ENCRYPTED_USER_FIELDS) {
    if (doc[field] && !isEncrypted(doc[field])) {
      doc[field] = encrypt(doc[field]);
    }
  }

  // Compute emailHash for lookups (always from decrypted email)
  // If the email is encrypted, decrypt first to get the raw value
  const rawEmail = isEncrypted(doc.email) ? decrypt(doc.email) : doc.email;
  if (rawEmail) {
    doc.emailHash = hashForLookup(rawEmail);
  }

  // Encrypt address subdocument fields
  if (doc.addresses && doc.addresses.length > 0) {
    for (const addr of doc.addresses) {
      for (const field of ENCRYPTED_ADDRESS_FIELDS) {
        if (addr[field] && !isEncrypted(addr[field])) {
          addr[field] = encrypt(addr[field]);
        }
      }
    }
  }
}

/**
 * Helper: decrypt all sensitive fields on a user document.
 */
function decryptUserFields(doc) {
  // Decrypt top-level fields
  for (const field of ENCRYPTED_USER_FIELDS) {
    if (doc[field] && isEncrypted(doc[field])) {
      doc[field] = decrypt(doc[field]);
    }
  }

  // Decrypt address subdocument fields
  if (doc.addresses && doc.addresses.length > 0) {
    for (const addr of doc.addresses) {
      for (const field of ENCRYPTED_ADDRESS_FIELDS) {
        if (addr[field] && isEncrypted(addr[field])) {
          addr[field] = decrypt(addr[field]);
        }
      }
    }
  }
}

// Pre-save: encrypt fields + hash password
userSchema.pre('save', async function (next) {
  // Hash password if modified
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  // Encrypt PII fields
  encryptUserFields(this);

  next();
});

// Post-init: decrypt fields when a document is loaded from the database
userSchema.post('init', function (doc) {
  decryptUserFields(doc);
});

// Post-save: decrypt fields so the document is usable in-memory after saving
userSchema.post('save', function (doc) {
  decryptUserFields(doc);
});

// Compare password method
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      role: this.role,
    },
    process.env.ACCESS_TOKEN_SECRET || 'access_secret_123',
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY || '15m',
    }
  );
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET || 'refresh_secret_123',
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY || '7d',
    }
  );
};

const User = mongoose.model('User', userSchema);
export default User;
