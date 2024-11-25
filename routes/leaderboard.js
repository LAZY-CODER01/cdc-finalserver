const router = require('express').Router();
const Team = require('../models/Team');
const authMiddleware = require('../middleware/auth');
const roleMiddleware = require('../middleware/role');

router.get('/', authMiddleware, async (req, res) => {
  const teams = await Team.find().sort({ ranking: -1 });
  res.json(teams);
});

router.put('/:teamId', authMiddleware, roleMiddleware('Superadmin'), async (req, res) => {
  try {
    const { ranking } = req.body;
    await Team.findByIdAndUpdate(req.params.teamId, { ranking });
    res.send('Ranking updated');
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
