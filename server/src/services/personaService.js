const Customer = require('../models/Customer');
const Persona = require('../models/Persona');
const { generateJSON } = require('./geminiService');

/**
 * Feature 3: AI Customer Personas
 *
 * Auto-clusters customers into behavioral tribes using MongoDB aggregation
 * + Gemini for human-readable naming and description.
 */

const PERSONA_PROMPT = `You are a marketing analyst. Given customer cluster data, create a human-readable persona name and description.

RESPOND WITH JSON:
{
  "name": "Creative persona name (e.g. 'Weekend Coffee Lovers', 'Deal Hunters')",
  "description": "2-3 sentence description of this customer tribe's behavior and preferences"
}

Keep names catchy and marketing-friendly. The description should help a marketer understand who these people are.`;

async function generatePersonas() {
  console.log('🧬 Generating customer personas...');

  // Clear existing personas
  await Persona.deleteMany({});

  // Aggregate customers by behavioral clusters
  const clusters = await Customer.aggregate([
    {
      $addFields: {
        ageGroup: {
          $switch: {
            branches: [
              { case: { $lte: ['$age', 25] }, then: '18-25' },
              { case: { $lte: ['$age', 35] }, then: '26-35' },
              { case: { $lte: ['$age', 45] }, then: '36-45' },
            ],
            default: '46+',
          },
        },
        spendTier: {
          $switch: {
            branches: [
              { case: { $lte: ['$totalSpent', 2000] }, then: 'Low' },
              { case: { $lte: ['$totalSpent', 8000] }, then: 'Medium' },
              { case: { $lte: ['$totalSpent', 20000] }, then: 'High' },
            ],
            default: 'Premium',
          },
        },
      },
    },
    {
      $group: {
        _id: { ageGroup: '$ageGroup', spendTier: '$spendTier' },
        count: { $sum: 1 },
        avgSpend: { $avg: '$totalSpent' },
        avgOrders: { $avg: '$totalOrders' },
        topCities: { $push: '$city' },
        customerIds: { $push: '$_id' },
        channels: { $push: '$digitalTwin.preferredChannel' },
      },
    },
    { $match: { count: { $gte: 5 } } }, // Only keep clusters with 5+ customers
    { $sort: { count: -1 } },
    { $limit: 8 }, // Max 8 personas
  ]);

  const personas = [];
  for (const cluster of clusters) {
    // Get top cities
    const cityCount = {};
    cluster.topCities.forEach((c) => { cityCount[c] = (cityCount[c] || 0) + 1; });
    const topCities = Object.entries(cityCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([city]) => city);

    // Get preferred channel
    const channelCount = {};
    cluster.channels.filter(Boolean).forEach((c) => { channelCount[c] = (channelCount[c] || 0) + 1; });
    const preferredChannel = Object.entries(channelCount)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'whatsapp';

    // Ask Gemini for a creative persona name
    let personaInfo;
    try {
      personaInfo = await generateJSON(PERSONA_PROMPT,
        `Cluster: Age ${cluster._id.ageGroup}, Spend ${cluster._id.spendTier}, ${cluster.count} customers, avg ₹${Math.round(cluster.avgSpend)} spend, avg ${Math.round(cluster.avgOrders * 10) / 10} orders, top cities: ${topCities.join(', ')}`
      );
    } catch {
      personaInfo = {
        name: `${cluster._id.ageGroup} ${cluster._id.spendTier} Spenders`,
        description: `A group of ${cluster.count} customers aged ${cluster._id.ageGroup} with ${cluster._id.spendTier.toLowerCase()} spending patterns.`,
      };
    }

    const persona = await Persona.create({
      name: personaInfo.name,
      description: personaInfo.description,
      characteristics: {
        ageRange: cluster._id.ageGroup,
        avgSpend: Math.round(cluster.avgSpend),
        avgOrders: Math.round(cluster.avgOrders * 10) / 10,
        preferredChannel,
        topCities,
        responseRate: Math.round(50 + Math.random() * 40), // Simulated
      },
      customerCount: cluster.count,
      customerIds: cluster.customerIds.slice(0, 100), // Cap stored IDs
    });

    personas.push(persona);
  }

  console.log(`✅ Generated ${personas.length} personas`);
  return personas;
}

module.exports = { generatePersonas };
