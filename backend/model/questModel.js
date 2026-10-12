const quests = require("../data/quests.json");

// Get all quests for one language, in the order they appear in the file
async function getQuestsByLanguage(language) {
  try {
    return quests.filter((quest) => quest.language === language);
  } catch (error) {
    throw error;
  }
}

// Get one quest by its ID
async function getQuestById(questId) {
  try {
    return quests.find((quest) => quest.id === questId) || null;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getQuestsByLanguage,
  getQuestById
};