import User from "./User";

/**
 * Lobby model
 */
class Lobby {
  constructor(data = {}) {
    this.id = null;
    this.users = null;
    Object.assign(this, data);
  }
}

export default Lobby;