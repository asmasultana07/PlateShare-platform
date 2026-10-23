const { MongoClient, ObjectId } = require('mongodb');

const defaultCategories = ['Produce', 'Bakery', 'Prepared meals', 'Pantry'];
let database;

const cleanText = (value) => typeof value === 'string' ? value.trim() : '';

async function migrateLegacyFoods(db) {
  const foods = db.collection('foods');
  const oldItems = await db.collection('hasfoods').find().toArray();
  if (!oldItems.length) return;

  const migrated = [];
  for (const oldFood of oldItems) {
    const legacyId = String(oldFood._id);
    const existing = await foods.findOne({
      $or: [
        { legacyId },
        ...(oldFood._id instanceof ObjectId ? [{ _id: oldFood._id }] : []),
      ],
    });
    if (existing) continue;

    const area = cleanText(oldFood.pickup_location?.area);
    const city = cleanText(oldFood.pickup_location?.city);
    const quantity = Number(oldFood.food_quantity);
    const image = oldFood.food_image || '';

    migrated.push({
      _id: oldFood._id instanceof ObjectId ? oldFood._id : new ObjectId(),
      legacyId,
      title: cleanText(oldFood.food_name) || 'Shared food',
      category: defaultCategories.includes(oldFood.category) ? oldFood.category : 'Produce',
      description: cleanText(oldFood.additional_notes) || cleanText(oldFood.food_name) || 'A food share from the previous PlateShare version.',
      quantity: Number.isInteger(quantity) && quantity > 0 ? quantity : 1,
      location: [area, city].filter(Boolean).join(', ') || 'Location to confirm',
      pickupWindow: oldFood.exp_date ? `Please collect by ${oldFood.exp_date}` : 'Contact the food sharer',
      image: /^https?:\/\//i.test(image) ? image : 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=85',
      ownerId: `legacy-${String(oldFood.donater_id || 'unknown')}`,
      ownerName: 'Previous PlateShare neighbour',
      ownerEmail: '',
      status: 'available',
      createdAt: oldFood.created_at instanceof Date ? oldFood.created_at : new Date(),
    });
  }

  if (migrated.length) {
    await foods.insertMany(migrated);
    console.log(`Imported ${migrated.length} old food listing(s) from hasfoods.`);
  }
}

async function seedCategories(db) {
  const collection = db.collection('categories');
  if (await collection.countDocuments()) return;

  await collection.insertMany(defaultCategories.map((name) => ({
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    createdAt: new Date(),
  })));
}

async function connectDatabase() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required in the server .env file.');
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long.');
  }

  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  database = client.db(process.env.MONGODB_DATABASE || 'plateshare-db');

  await migrateLegacyFoods(database);
  await seedCategories(database);
  await Promise.all([
    database.collection('users').createIndex({ email: 1 }, { unique: true }),
    database.collection('foods').createIndex({ createdAt: -1 }),
    database.collection('foods').createIndex({ legacyId: 1 }, { unique: true, sparse: true }),
    database.collection('foodRequests').createIndex({ foodId: 1, userId: 1, status: 1 }),
    database.collection('categories').createIndex({ slug: 1 }, { unique: true }),
    database.collection('contacts').createIndex({ createdAt: -1 }),
  ]);

  return { client, database };
}

function getDb() {
  if (!database) throw new Error('MongoDB is not connected.');
  return database;
}

module.exports = { connectDatabase, getDb };
