# dbay - the world's first completely decentralised exchange for stuff.

## Using the App

Use the bottom menu to navigate between the pages.
- Home = A list of listings that have been shared with you
- Favourites = A list of listings that have been favourited by you **
- Sell = You can create a listing and share it with your contacts
- Inbox = Incoming messages from other users of dbay **
- Me = A navigation menu to help you navigate to pages of your user

** denotes features yet to be developed

## How do I sell an item?
You're able to create a listing by using the "Sell" link in the bottom navbar menu. When you publish it, it is sent to all your contacts. 

## How do I buy an item?
You can browse listings that have been shared with you. If you select a listing in the menu and click "I want it" the application will check if the item is available with the seller whilst checking your wallet balance. If the item is available and you can afford it, you will be given the option to buy it. 

## How does the transaction work?
Because dbay is built on top of a commodity based blockchain which has its own currency (Minima), we are able to directly integrate private and secure payments. Buyers are able to send money directly to sellers over the Minima network. This all happens seamlessly and does not require the user to come out of dbay. 

# ------------------------------------------------------------------------------------------------------------
# Development

## Prerequisites:
- node.js https://nodejs.org/en/download/
- code Editor, we recommend Visual Studio code https://code.visualstudio.com/
- the latest minima.jar file from `https://github.com/minima-global/Minima/tree/master/jar`
- this repo (dbay) cloned to a folder on your computer;

# How to run dbay locally
dbay is a protocol (minidapp) which runs on the Minima blockchain. Minima is currently in testnet and will launch in Q1 2023. To run any minidapp, you must first be running a full Minima node. You can learn more about this on the Minima website. In order to play with and test the Minidapp that we are building, we must first set up and run two Minima nodes. If you have an android phone and would like to get a very quick understanding of Minima, you can search 'minima global' on the google play store and download the app. This is not a requirement for this task. 

## Setup 2 nodes on a test network
- Open a Terminal window and navigate to `dbay/react-ui/` (your cloned repo) and create a folder called `/minidapp`. Move the minima.jar file which was downloaded in the prerequisites, into the `dbay/react-ui/minidapp/` folder. The structure should now look like this `dbay/react-ui/minidapp/minima.jar`
- From within the `minidapp` folder run `java -jar minima.jar -data minidata1 -test -nop2p -genesis -mdsenable -clean`
- In a second terminal window navigate to the same folder `/minidapp` and run `java -jar minima.jar -data minidata2 -test -nop2p -clean -port 10001 -mdsenable -connect 127.0.0.1:9001`
- Now you have two nodes connected on a private test network (this is quicker than being on the public network and means you start with lots of test tokens to play with).

### Displaying your two Minima test nodes on your laptop
- On node 1 (terminal 1) run `mds` to get the connection URL, it should have a similar form as -> `https://10.64.25.151:9003` but with a different IP
- Below the URL is the password you'll need to access the MDS, something like `CAHC-RRGY-C0PU`
- Open the Url in a browser (if chrome doesn't let you access it type in `thisisunsafe` and it should let you pass through)
- Enter the password
- Do the same for node 2 (terminal 2)

**Now you have 2 nodes running and visible in your broswer. You may have to log off and log on again at some point in the future. Just use the same password that you used in this stage.** 

## How to build and install the dbay app
- Using terminal in visual studio code (or other terminal)
- Run the following command in the `/react-ui` directory: `npm i` and then run `npm run build`.
- Once the app has been built, and still in the `/react-ui` directory, run `npm run zip` which will create a MiniDapp .mds.zip file in the `/minidapp` folder.
- Then in each node (terminal window) run `mds action:install file:<minidapp zip file> trust:write`, where `<minidapp zip file>` is replaced by the actual destination of the zip file you just created in the step before.
- Once run on both nodes you can now go to both of your browser tabs and refresh and the apps should appear - it is possible that when you refresh on browser, it asks you to log off and log on again - this is fine, just use the same password from before. You can access this password by running `MDS` in the relevant terminal window. 
- Click on each app to open in another browser tab.

**You're now running 2 nodes on one private network and each of them have an instance of the dbay protocol installed.** 

## Automatically updating your minidapp 

We have a solution that allows you to automate app updates without constantly reinstalling, by taking advantage of `Create React App`'s automatic reloading on file changes.

- Ensure you have installed the app on at least one node using the instructions above, and that it is visible using your browser
- In your code editor, duplicate the `.env.example` file and rename it to `.env` (this is your project root)
- Configure the environment values, you can leave everything default unless you are running Minima on a custom port. 
- Open your app on Desktop
- Your url will look something like: `https://localhost:9003/{APP_ID}/index.html?uid=YOUR_UID`
- Copy the value at the end where YOUR_UID is in the URL e.g. `0xD497A626EF65C24417D4F7AE0CC48289BCB1062FB9763D47A20326984E099299`
- Replace `REACT_APP_DEBUG_UID` in the env file with the uid you copied
- From your URL, copy the localhost part of the IP `https://10.10.10.66:9003"` (the 10.10.10.66 part).
- Replace the `REACT_APP_DEBUG_HOST` in the `evn.` file with the IP you've just copied
- Run `npm run start`
- Now when you edit `/src/App.jsx` the browser window will automatically reload with those updates present
