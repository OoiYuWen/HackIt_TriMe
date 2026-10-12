//const { verifyToken } = require("./middlewares/authMiddleware");
const { validateLanguage } = require("./middlewares/questValidation");
//const { validateCompleteQuest } = require("./middlewares/progressValidation");
const questController = require("./controllers/questController");
//const progressController = require("./controllers/progressController");

// Quests (anyone can see them, no sign-in needed)
app.get("/quests", validateLanguage, questController.getQuestsByLanguage);
app.get("/quests/:questId", questController.getQuestById);

// Progress (must be signed in, guests included)
app.get("/progress", verifyToken, progressController.getMyProgress);
app.post("/progress/complete", verifyToken, validateCompleteQuest, progressController.completeQuest);