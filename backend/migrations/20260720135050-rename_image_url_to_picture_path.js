module.exports = {
  // Version 1: Change field name (Migration)
  async up(db) {
    await db.collection('users').updateMany(
      {},
      { $rename: { 'imageUrl': 'picturePath' } }
    );
  },

  // Version 2: Revert field name (Rollback)
  async down(db) {
    await db.collection('users').updateMany(
      {},
      { $rename: { 'picturePath': 'imageUrl' } }
    );
  }
};