const maths = require("./maths");

class Engine {
  constructor() {
    this.cutoffValue = 0.1;
  }

  fit(ratings, items) {
    this.users = [];
    this.ratingsArray = [];
    this.attractionsArray = [];
    this.matrix = [];
    this.colLabels = [];
    this.cols = [];
    this.rows = [];
    this.similarities = [];
    this.recommendations = [];

    this.ratings = ratings;
    this.items = items;

    // Create the user array and also parse the responses into a usable format
    for (let key in this.ratings) {
      const response = this.ratings[key];
      const individualRatings = response.scores;
      this.users.push({
        userId: key,
        userName: response.userName,
        location: response.location
      });
      for (let score of individualRatings) {
        score.userName = response.userName;
        this.ratingsArray.push(score);
      }
    }
    // parse the attractions as well
    for (let key in this.items) {
      this.attractionsArray.push({
        ...this.items[key],
        attractionFirebaseId: key
      });
    }

    // Create an users * items shaped matrix filled with zeros
    this.matrix = maths.zeros2d(
      this.users.length,
      this.attractionsArray.length
    );

    // Remember the order of columns and rows
    this.colLabels = this.attractionsArray.map(attraction => attraction.name);
    this.cols = this.attractionsArray.map(
      attraction => attraction.attractionId + ""
    );
    this.rows = this.users.map(user => user.userName);

    // And build the users to items matrix
    for (let ratingInstance of this.ratingsArray) {
      const { userName, attractionId, rating } = ratingInstance;
      const i = this.rows.indexOf(userName);
      const j = this.cols.indexOf(attractionId);
      this.matrix[i][j] = rating;
    }
    return this;
  }

  _calculateSimilarities() {
    let sumSimilarity = 0;
    // Traverse the matrix row by row and calculate similarity with all other rows
    for (let i = 0; i < this.matrix.length; i++) {
      const a = this.matrix[i];
      const userSimilarity = { userName: this.rows[i], to: [] };
      for (let j = 0; j < this.matrix.length; j++) {
        // do not calculate for self
        if (j === i) {
          continue;
        }
        const b = this.matrix[j];
        const similarity = maths.calculateCosineSimilarity(a, b);
        userSimilarity.to.push({
          userName: this.rows[j],
          similarity: similarity
        });
        sumSimilarity += similarity;
      }
      // sort ascendingly
      userSimilarity.to.sort((a, b) => {
        return b.similarity - a.similarity;
      });
      this.similarities.push(userSimilarity);
    }
    // Cutoff value is the mean similarity
    this.cutoffValue =
      sumSimilarity / (this.matrix.shape()[0] * this.matrix.shape()[1]);
    return this;
  }

  getRecommendationForExisting(userName) {
    this._calculateSimilarities();
    const allItems = [];
    const attractionIds = new Set();
    if (this.rows.indexOf(userName) === -1) {
      throw new Error("Unknown user");
    }
    // Get the users most similar to the one provided
    const user = this.similarities
      .filter(similarity => similarity.userName === userName)
      .reduce(similarity => similarity);
    user.to
      .filter(_user => _user.similarity > this.cutoffValue)
      .map(similar => {
        this.ratingsArray
          .filter(rating => rating.userName === similar.userName)
          .map(item => allItems.push(item));
      });

    // sort all recommendations returned by rating
    // Make sure each one appears only once
    allItems
      .sort((a, b) => b.rating - a.rating)
      .map(item => attractionIds.add(parseInt(item.attractionId)));

    // map over recommendations and pull in the needed data
    attractionIds.forEach(attractionId => {
      const item = this.attractionsArray
        .filter(_item => _item.attractionId === attractionId)
        .reduce(_item => _item);
      this.recommendations.push(item);
    });
    return this;
  }
  getRecommendationForNew(ratings) {
    const userName = Buffer.from(new Date().getTime() + "").toString("base64");
    ratings.userName = userName;
    this.ratings.NEW_KEY = ratings;
    this.fit(this.ratings, this.items)
      ._calculateSimilarities()
      .getRecommendationForExisting(userName);
    return this;
  }
}

module.exports = Engine;