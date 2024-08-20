# OpenLayers + Vite

This example demonstrates how the `ol` package can be used with [Vite](https://vitejs.dev/).

To get started, run the following (requires Node 14+):

    npx create-ol-app my-app --template vite

Then change into your new `my-app` directory and start a development server (available at http://localhost:5173):

    cd my-app
    npm start

To generate a build ready for production:

    npm run build

Then deploy the contents of the `dist` directory to your server. You can also run `npm run serve` to serve the results of the `dist` directory for preview.

Don't forget to change the Localhost fetch if you are in developement you will need to build a new geoserver in local and manage the CORS issue of FETCH.
