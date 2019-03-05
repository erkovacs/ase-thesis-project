const fs = require("fs");
const Engine = require("./engine");

class Recommender {
  constructor(firebaseRef) {
    this.engine = new Engine();
    this.userName = null;

    // refactor...
    this.responsesRef = firebaseRef.child("responses");
    this.attractionsRef = firebaseRef.child("attractions");
  }
  static async getInstance(ref) {
    const ret = new Recommender(ref);
    const responses = await ret.responsesRef.once("value");
    const attractions = await ret.attractionsRef.once("value");
    ret.responses = responses.val();
    ret.attractions = attractions.val();
    return ret;
  }
  parse(event) {
    const parts = event.split(/=/);
    const type = parts[0];
    const term = parts[1] || "";
    this.engine.fit(this.responses, this.attractions);
    switch (type) {
      case "expression.attribution.username":
        return this.setUserName(term);
      case "query.recommend.term":
        return this.recommend(term);
      case "query.recommend.all":
        return this.recommendAll();
      case "query.inform.term":
        return "TODO";
      case "query.image.term":
        return "TODO";
      default:
        return event;
    }
  }
  setUserName(userName) {
    const rows = this.engine.rows.map(name => name.toLowerCase());
    if (rows.indexOf(userName) > -1) {
      this.userName = userName;
      return `Welcome ${userName}!`;
    } else {
      return `Sorry but I do not know of any ${userName}. Maybe you have not been a customer before, or have you misspelt your username?`;
    }
  }
  recommendTerm(term) {
    return "TODO";
  }
  recommendAll() {
    const { recommendations } = this.userName
      ? this.engine.getRecommendationForExisting(this.userName)
      : this.engine.getRecommendationForNew({});
    const recommendationsString = recommendations
      .map(r => r.name)
      .slice(0, 10)
      .join("\n");
    return recommendationsString;
  }
}

module.exports = Recommender;
