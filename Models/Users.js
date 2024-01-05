const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const userSchema = Schema(
  {
    email: {
      type: String,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    videos: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Video',
      },
    ],
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
    delete returnedObject.passwordHash;
  },
});

const User = model('User', userSchema);

module.exports = User;
