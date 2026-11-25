const Attraction = require('../models/Attraction');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Only plain strings are accepted (blocks NoSQL operator injection like ?district[$ne]=x)
const str = (v) => (typeof v === 'string' ? v.trim() : '');

const SORTS = {
  featured: { featured: -1, averageRating: -1, createdAt: -1, _id: -1 },
  rating: { averageRating: -1, ratingCount: -1, _id: -1 },
  newest: { createdAt: -1, _id: -1 },
  oldest: { createdAt: 1, _id: 1 },
  name_asc: { name: 1, _id: 1 },
  name_desc: { name: -1, _id: -1 },
};

// GET /api/attractions?q=&district=&town=&category=&activities=a,b&sort=&page=&limit=
exports.listAttractions = async (req, res) => {
  try {
    const q = str(req.query.q);
    const district = str(req.query.district);
    const town = str(req.query.town);
    const category = str(req.query.category);
    const activities = str(req.query.activities)
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 9, 1), 50);
    const sort = SORTS[str(req.query.sort)] || SORTS.featured;

    // Public discovery must only ever show approved attractions
    const filter = { status: 'approved' };

    if (district) filter.district = new RegExp(`^${escapeRegex(district)}$`, 'i');
    if (town) filter.town = new RegExp(`^${escapeRegex(town)}$`, 'i');
    if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, 'i');
    if (activities.length) {
      // match attractions offering ALL selected activities
      filter.activities = { $all: activities.map((a) => new RegExp(`^${escapeRegex(a)}$`, 'i')) };
    }
    if (q) {
      const rx = new RegExp(escapeRegex(q), 'i');
      filter.$or = [{ name: rx }, { description: rx }, { town: rx }, { activities: rx }];
    }

    const [items, total] = await Promise.all([
      Attraction.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .select('name description district town category activities images location featured averageRating ratingCount createdAt')
        .lean(),
      Attraction.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        items,
        pagination: { page, limit, total, totalPages: Math.max(Math.ceil(total / limit), 1) },
      },
    });
  } catch (error) {
    console.error('listAttractions error:', error.message);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Could not load attractions.' },
    });
  }
};

// GET /api/attractions/filters  -> values that populate the filter UI (approved only)
exports.getFilterOptions = async (req, res) => {
  try {
    const approved = { status: 'approved' };
    const [districts, categories, activities, townPairs] = await Promise.all([
      Attraction.distinct('district', approved),
      Attraction.distinct('category', approved),
      Attraction.distinct('activities', approved),
      Attraction.aggregate([
        { $match: approved },
        { $group: { _id: { district: '$district', town: '$town' } } },
        { $project: { _id: 0, district: '$_id.district', town: '$_id.town' } },
        { $sort: { district: 1, town: 1 } },
      ]),
    ]);

    const sorted = (arr) => [...arr].sort((a, b) => a.localeCompare(b));
    res.json({
      success: true,
      data: {
        districts: sorted(districts),
        categories: sorted(categories),
        activities: sorted(activities),
        towns: townPairs,
      },
    });
  } catch (error) {
    console.error('getFilterOptions error:', error.message);
    res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Could not load filter options.' },
    });
  }
};
