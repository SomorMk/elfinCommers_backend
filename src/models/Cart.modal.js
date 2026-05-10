import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        quantity: {
          type: Number,
          required: true,
          default: 1,
          min: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;

// {
//   user: "685a1234abcd5678",
//   products: [
//     {
//       product: "685b9999abcd1111",
//       quantity: 2
//     },
//     {
//       product: "685b8888abcd2222",
//       quantity: 1
//     }
//   ]
// }

// { _id: ObjectId("691247555136f7ae78e18b72"), user: ObjectId("685a184f4e6413131b611079"), products: [ { product: ObjectId("6912397897b0c09c2d76448c"), quantity: 3, _id: ObjectId("691247555136f7ae78e18b73") } ], createdAt: 2026-05-10T15:28:53.373Z, updatedAt: 2026-05-10T15:28:53.373Z, __v: 0 }
