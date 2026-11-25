const mongoose = require('mongoose');

const attractionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true, default: 'Galle' },
    town: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true }, // e.g. Nature, Cultural, Historical
    activities: [{ type: String, trim: true }],
    facilities: [{ type: String, trim: true }],
    images: [{ url: String, caption: String }],
    location: {
      latitude: Number,
      longitude: Number,
    },
    featured: { type: Boolean, default: false },
    // maintained by the reviews module; used here for "Highest rated" sorting and card display
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
      index: true,
    },
  },
  { timestamps: true }
);

attractionSchema.index({ district: 1, town: 1, category: 1 });
attractionSchema.index({ activities: 1 });

module.exports = mongoose.model('Attraction', attractionSchema);
