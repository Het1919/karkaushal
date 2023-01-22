import mongoose from 'mongoose';
import { Password } from '../services/password';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';
export interface ShippingAddressAttrs {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

// An interface that describes the properties
// that are requried to create a new User


// gender must be one of  the following enum values
export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other',
}
export interface UserAttrs {
  email: string;
  password: string;
  isAdmin: boolean;
  name: string;
  gender: Gender;
  age: number;
  shippingAddress?: ShippingAddressAttrs;
}

// An interface that describes the properties that a user Model has

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

// an interface that describes a user document

interface UserDoc extends mongoose.Document {
  email: string;
  password: string;
  isAdmin: boolean;
  name: string;
  gender: Gender;
  age: number;
  shippingAddress?: ShippingAddressAttrs;
  version: number;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      default: false,
      required:true
    },
    name: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      required: true,
      enum: Object.values(Gender),
    },
    age: {
      type: Number,
      required: true,
    },
    shippingAddress: {
      address: { type: String },
      city: { type: String },
      postalCode: { type: String },
      country: { type: String },
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        delete ret.__v;
      },
    },
  }
);
userSchema.set("versionKey","version");
userSchema.plugin(updateIfCurrentPlugin);

userSchema.pre('save', async function (done) {
  if (this.isModified('password')) {
    const hashed = await Password.toHash(this.get('password'));
    this.set('password', hashed);
  }
  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs);
};

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };
