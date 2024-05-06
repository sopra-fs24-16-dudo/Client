/**
 * User model
 */
class User {
  constructor(data = {}) {
    this.id = null;
    this.name = null;
    this.username = null;
    this.token = null;
    this.status = null;
    this.creationDate = null;
    this.birthday = null;
    this.gamesPlayed = 0;
    this.gamesWon = 0;
    this.winRatio = 0.0;
    this.readiness = false
    Object.assign(this, data);
  }
}

export default User;
