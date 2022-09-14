Stampd is a ma

# Using the App

Use the bottom menu to navigate between the pages.
- Marketplace = Lists all the items on the chain that have been created over the last 24 hours
- My Items = Lists all the items that you've created on the chain
- Add Item = Allows you to add a item to the chain
## How do I sell an item?
You're able to put an item up for sale by using the "Add Item" page.

## How do I buy an item?
You can browse items that have been added to the chain in the last 24 hours. If you select one and the item is not one of your own you will be able to click "Buy Now" to begin a transaction.

## How does the transaction work?
1. The buyer begins the transacion by clicking buy now on a product
2. The selller must view the same product and wait for the approive purchase request (this will sign the transaction)
3. The buyer then reloads the item page and clicks approve payment (this will sign the transaction and post it to chain)
4. The product has now been sold to the buyer. Please check your wallet for confirmation.

## Pre-requisites
- node.js https://nodejs.org/en/download/
- Code Editor, we recommend Visual Studio code https://code.visualstudio.com/
- A running Minima node
# How to run the Stampd application locally
## Run 2 nodes
- Clone the guthub repo to a folder on your computer
- Open a Terminal window and navigate to `/create-minima-app/minidapp` (where the minima.jar file is located) and run `java -jar minima.jar -data minidata1 -test -nop2p -genesis -mdsenable -clean`
- Do the same in second terminal window but run `java -jar minima.jar -data minidata2 -test -nop2p -clean -port 10001 -mdsenable -connect 127.0.0.1:9001`
- Now you have two nodes running on a network
- On node 1 (terminal 1) run `mds` to get the connection URL, it should look like -> `https://10.64.25.151:9003`
- Below is the password you'll need, something like `CAHC-RRGY-C0PU`
- Open the Url in a browser (if chrome doesn't let you access it type in `thisisunsafe` and it should let you pass through)
- Enter the password
- Do the same for node 2 (terminal 2)

## How to build and install the stampd app
- Using terminal in visual studio code (or other terminal)
- Run the following command in the `/create-minima-app` directory: `npm i` and then run `npm run build`.
- Once the app has been built, run `npm run zip` to create an MiniDapp .mds.zip file in the `/minidapp` folder.
- Then in each node (terminal window) run `mds action:install file:<minidapp zip file>`, where <minidapp zip file> is replaced by the actual destination of the zip file you just created in the step before.
- Copy the UID of the minidapp installation and then in each node run `mds action:permission trust:write uid:<uid of minidapp>`
- Once run on both nodes you can now go to both of your browser tabs and refresh and the apps should appear.
- Click on each app to open in another browser tab.
- You're now running 2 nodes on one network.

### Installing on a Desktop node

Login to your MiniDapp Hub by going to `https://localhost:9003` (default MDS port) and log in. You must log in using a password that you can retrieve by running `mds` in the Minima Terminal. Once you are logged in, scroll to the bottom and click `Choose file`, locate your zip file and click the `install` button and your app should be installed. Click `Back to MDS Hub` and you should now see your app in the list. Click on your app to open it.

### Installing on Android

Either connect to your Android node using the Desktop connect feature and continue to install the MiniDapp as above, or transfer your app to your phone's storage and open the Minima app. Click on the `+` button on the bottom right of the screen. Locate and select the zip file on your phone and you should be taken back to the app list. You should now see your app in the list. Tap on your app to open it.

## Do I have to reinstall after every change?

No, we have a solution that allows you to get around the issue to take advantage of `Create React App`'s automatic reloading on file changes.

- Ensure you have installed the app using the instructions above on desktop
- Duplicate the `.env.example` file and rename it to `.env` (this is your project root)
- Configure the environment values, you can leave everything default unless you are running Minima on a custom port. If connecting to a phone node, change the IP address to that as shown in the Health section of the app.
- Open your app on Desktop
- Your url will look something like: `https://localhost:9003/{APP_ID}/index.html?uid=YOUR_UID`
- Copy the value at the end where YOUR_UID is in the URL e.g. `0xD497A626EF65C24417D4F7AE0CC48289BCB1062FB9763D47A20326984E099299`
- Replace `REACT_APP_DEBUG_UID` in the env file with the uid you copied
- Run `npm run start`
- Edit `/src/App.jsx` and the browser window will automatically reload and should be connected to Minima



