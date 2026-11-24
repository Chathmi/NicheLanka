// Sample data for testing discovery ONLY. Replace with real, verified content.
// Run: node seed/seedAttractions.js   (from /backend, with MONGODB_URI set in .env)
require('dotenv').config();
const mongoose = require('mongoose');
const Attraction = require('../models/Attraction');

const base = { district: 'Galle' };
const data = [
  { ...base, name: 'Kottawa Rainforest Trail', featured: true, averageRating: 4.8, ratingCount: 12, town: 'Kottawa', category: 'Nature', activities: ['Hiking', 'Bird Watching'], description: 'A quiet forest reserve trail with shaded paths and rich birdlife.', status: 'approved' },
  { ...base, name: 'Hiyare Reservoir Viewpoint', featured: true, averageRating: 4.6, ratingCount: 8, town: 'Hiyare', category: 'Nature', activities: ['Bird Watching', 'Photography'], description: 'A peaceful reservoir surrounded by rainforest, popular with local visitors.', status: 'approved' },
  { ...base, name: 'Koggala Lake Island Boat Ride', averageRating: 4.7, ratingCount: 15, town: 'Koggala', category: 'Community Experience', activities: ['Boat Ride', 'Cinnamon Tasting'], description: 'Small-island visits led by local families, including cinnamon making.', status: 'approved' },
  { ...base, name: 'Baddegama Old Church', averageRating: 4.5, ratingCount: 6, town: 'Baddegama', category: 'Historical', activities: ['Sightseeing', 'Photography'], description: 'A colonial-era church overlooking the Gin River valley.', status: 'approved' },
  { ...base, name: 'Village Pottery Workshop', averageRating: 4.9, ratingCount: 4, town: 'Habaraduwa', category: 'Cultural', activities: ['Workshop', 'Local Crafts'], description: 'Learn traditional clay pottery from local artisans.', status: 'approved' },
  { ...base, name: 'Unverified Hidden Waterfall', town: 'Neluwa', category: 'Nature', activities: ['Hiking'], description: 'Pending admin review. Must NOT appear in discovery results.', status: 'pending' },
];

(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  await Attraction.deleteMany({ name: { $in: data.map((d) => d.name) } });
  await Attraction.insertMany(data);
  console.log(`Seeded ${data.length} attractions (1 pending)`);
  await mongoose.disconnect();
})();
