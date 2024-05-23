![image](https://github.com/sopra-fs24-16-dudo/Client/assets/160472898/23e2f6c6-22c4-481e-951d-4571406e4791)


## Introduction
Dudo is a multiplayer dice game that challenges players' bluffing and bidding skills. Inspired by the traditional Peruvian dice game, Dudo offers an exciting and strategic gaming experience where players attempt to outsmart each other with clever bids and daring bluffs.

The game is played with five dice, each depicting symbols from the standard deck of cards: 9, 10, J, Q, K, and A. Players take turns making bids on the total number of specific symbols (e.g., four 10s) present among all players' dice, while also having the option to challenge the previous bid if they believe it to be false.

Dudo combines elements of probability, psychology, and strategy, making each round unpredictable and engaging. Whether you're a seasoned strategist or a casual gamer looking for some fun, Dudo offers an immersive gaming experience for players of all skill levels.

## Technologies

- [Node.js](https://nodejs.org/en/docs) - JavaScript runtime environment
- [React](https://react.dev/learn) - JavaScript library for building user interfaces
- [Google Cloud](https://cloud.google.com/appengine/docs/flexible) - Deployment
- [RESTful](https://restfulapi.net/) - Web services for user control
- [Websocket](https://spring.io/guides/gs/messaging-stomp-websocket/) -  Real-time bidirectional communication between client and server
- [Agora VoiceChat API](https://docs.agora.io/en/voice-calling/get-started/get-started-sdk?platform=android) - provide voice communication between clients

## High-level Components

### Homepage
The [Homepage](https://github.com/sopra-fs24-16-dudo/Client/blob/main/src/components/views/Homepage.tsx) allows players to join an existing lobby by entering the lobby ID or create a new lobby. It also provides options to show the user page and logout. If a player enters a lobby ID, they can join that specific lobby if it is available.

### User List Page
The [User List](https://github.com/sopra-fs24-16-dudo/Client/blob/main/src/components/views/UserList.tsx) page displays all users currently registered in the game. Each user entry shows the username and ID, and an indicator of their online status (green for online, red for offline). Players can click on a user to navigate to their profile.

### Lobby Page
The [Lobby page](https://github.com/sopra-fs24-16-dudo/Client/blob/main/src/components/views/Lobby.tsx) shows a list of all users in the lobby, their readiness status, and indicates the admin of the lobby. Players can mark themselves as ready, leave the lobby, view game rules, and check the leaderboard. The admin has the ability to kick players. When all players are ready, the game starts automatically if there are enough players.

### Game Page
The [Game page](https://github.com/sopra-fs24-16-dudo/Client/blob/main/src/components/views/Game.tsx) provides the main interface for playing the game. It displays the current state of the game, including the player's hand, the current bid, and options for making bids or calling "dudo". Players can also interact with other players through voice chat and view the game rules

## Prerequisites and Installation
For your local development environment, you will need Node.js.\
We urge you to install the exact version **v20.11.0** which comes with the npm package manager. You can download it [here](https://nodejs.org/download/release/v20.11.0/).\
If you are confused about which download to choose, feel free to use these direct links:

- **MacOS:** [node-v20.11.0.pkg](https://nodejs.org/download/release/v20.11.0/node-v20.11.0.pkg)
- **Windows 32-bit:** [node-v20.11.0-x86.msi](https://nodejs.org/download/release/v20.11.0/node-v20.11.0-x86.msi)
- **Windows 64-bit:** [node-v20.11.0-x64.msi](https://nodejs.org/download/release/v20.11.0/node-v20.11.0-x64.msi)
- **Linux:** [node-v20.11.0.tar.xz](https://nodejs.org/dist/v20.11.0/node-v20.11.0.tar.xz) (use this [installation guide](https://medium.com/@tgmarinho/how-to-install-node-js-via-binary-archive-on-linux-ab9bbe1dd0c2) if you are new to Linux)

If you happen to have a package manager the following commands can be used:

- **Homebrew:** `brew install node@20.11.0`
- **Chocolatey:** `choco install nodejs-lts --version=20.11.0`

After the installation, update the npm package manager to **10.4.0** by running ```npm install -g npm@10.4.0```\
You can ensure the correct version of node and npm by running ```node -v``` and ```npm --version```, which should give you **v20.11.0** and **10.4.0** respectively.\
Before you start your application for the first time, run this command to install all other dependencies, including React:

```npm install```

Next, you can start the app with:

```npm run dev```

Now you can open [http://localhost:3000](http://localhost:3000) to view it in the browser.\
Notice that the page will reload if you make any edits. You will also see any lint errors in the console (use a Chrome-based browser).\
The client will send HTTP requests to the server which can be found [here](https://github.com/HASEL-UZH/sopra-fs24-template-server).\
In order for these requests to work, you need to install and start the server as well.

### Testing
Testing is optional, and you can run the tests with `npm run test`\
This launches the test runner in an interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

> For macOS user running into a 'fsevents' error: https://github.com/jest-community/vscode-jest/issues/423

### Build
Finally, `npm run build` builds the app for production to the `build` folder.<br>
It correctly bundles React in production mode and optimizes the build for the best performance:\
The build is minified, and the filenames include hashes.<br>

## Illustrations

### Homepage
After register or log in to the game, players are in the homepage where they can join a existing lobby via id, create a new lobby, search users or log out. 

![image](https://github.com/sopra-fs24-16-dudo/Client/assets/160472898/6ffd3c86-b003-4bc9-ba76-bc75579b8b4e)

### User List
After pressing the search users button the user gets directed in the users list where every registered user is shown with his name and online status. You can click on a player to get to his profile page.

![image](https://github.com/sopra-fs24-16-dudo/Client/assets/160472898/69bae29a-7375-4612-93c0-b08c552cf5ed)

### User Profile Page
In the profile page you can see all the informations of a user like username, status and games played.

![image](https://github.com/sopra-fs24-16-dudo/Client/assets/160472898/4337869d-bbc9-4de9-a03d-8837c88f9877)

### Lobby
In the lobby you see all players that are in the same lobby with their ready status (clicking ready will switch the status). On the botton corners you see a questionmark that shows the rules and on the right a trophy as the leaderboard. When all players are ready the game will start automatically.

![image](https://github.com/sopra-fs24-16-dudo/Client/assets/160472898/6a48d0e0-d389-4f92-995c-51c573db3118)

### Admin in the lobby
The creater of the lobby will be assigned as the admin, who can kick players out of the lobby. If the admin leaves the rights will be passed to the next player.

![image](https://github.com/sopra-fs24-16-dudo/Client/assets/160472898/f928e2f9-0d89-47ed-af11-983f5ce668d0)

### Game Rule
All the rules of the game are displayed in the lobby and in the game in case you didnt understand everything or need to look something up.

![image](https://github.com/sopra-fs24-16-dudo/Client/assets/160472898/307500d2-cf48-40dd-b10e-d898da331adc)

### Game page
In the game you can see all opponents at the top and yourself under them with you dice hand. The chips symbolise the lives of each player. Your hand is rolled automatically at the beginning of each round. Again you can look up the rules, mute/unmute yourself or other players in the voicechat and scale the volume of the music. You can also leave the game when needed. At the bottom you have you buttons with the game actions as bid 1 more, bit others or dudo to play the game when it is your turn.

![image](https://github.com/sopra-fs24-16-dudo/Client/assets/160472898/e6f8326f-e658-4e47-921f-d7cd63d537af)

### Dudo
After doubting the call of the last opponent you can dudo and end the round. If you win the opponent loses a chip else you do. 

![image](https://github.com/sopra-fs24-16-dudo/Client/assets/160472898/b2bf7c6d-5883-40ea-91dd-ae6c7ff76d88)

### Bids
You can bid one more or chose between all the other bids.

![image](https://github.com/sopra-fs24-16-dudo/Client/assets/160472898/1edaed8c-07bc-4a07-af63-11e74b49d7d1)

![image](https://github.com/sopra-fs24-16-dudo/Client/assets/160472898/ee7b5e47-abf5-4f04-a967-13b07dee36a1)

### End of Game Winner/Loser Effect
After the last round of the 2 last player the Winner and Loser are displayed and you can go back to the lobby to end your play session or start a new game. 

![image](https://github.com/sopra-fs24-16-dudo/Client/assets/160472898/3564c67c-6312-4596-9b9b-43aeaef278a7)

### Leaderboard
In the leaderboard you will see the updated points of each player in the lobby. May the best player win.

![image](https://github.com/sopra-fs24-16-dudo/Client/assets/160472898/98b55370-7ca7-40bb-9c34-05b2f47322db)


## Roadmap
New developers who want to contribute could add the following features to our project:
- Guest Account: our game only supports registered users. Implementing a Guest User that can easy play some games would be a nice addition.
- Social Features: Friendslist, invite, private chat.
- Avatars: that are shown in the game.
- Mobile Adaptability: Our Game currently is designed for PC, which can be improved in terms of the layout and of the UI for mobile devices.

## Contribution

Please read [CONTRIBUTIONS.md](https://github.com/sopra-fs24-16-dudo/Server/blob/main/contribution.md) for details on our code of conduct, and the process for submitting pull requests to us.

## Authors

* **Gianluca Nardone**  [GianlucaNardone](https://github.com/GianlucaNardone)
* **Katerina Kuneva**  [kkuneva](https://github.com/kkuneva)
* **Tomas Aguilar Lopez**  [tomasaguilar0710](https://github.com/tomasaguilar0710)
* **Jamin Sulic**  [Jamin-Sulic](https://github.com/Jamin-Sulic)

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details

## Acknowledgments

If you want to say **thanks** or/and support active development of `Dudo`:

- Add a [GitHub Star](https://github.com/sopra-fs24-16-dudo) to the project.
- Contact us ;)
