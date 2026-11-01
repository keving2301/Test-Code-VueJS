# Products page

A single page app that shows a product line sheet: a grid of product photos, where each product opens a detail dialog with its photo, description, dimensions, color, material, minimum order and wholesale price. Built with Vue 3 and plain CSS.

Live demo: https://products-page-details.netlify.app

## How it works

- The products come from a JSON feed, `src/data/line-sheet.json` (company name, contact email, a message and an `items` array). The app reads `ItemID`, `ItemName`, `Description`, `Dimensions`, `BasePrice`, `PhotoName`, `OrderMinimumQuantity` and the `udf16` and `udf17` fields (color and material) from each item, and handles a missing description or dimensions.
- `src/components/ProductCard.vue` is one product in the grid (a button that opens the dialog).
- `src/components/ProductDialog.vue` uses the native `<dialog>` element: focus moves into it and back to the product when it closes, Tab stays inside, Escape and a click outside close it, and the left and right arrow keys step through the products. On a phone it fills the screen.
- The layout has four columns on a desktop, three on a tablet and two on a phone.

The company, the products and their prices are fictional. Product photos are from Unsplash (Unsplash License) and ship with the site in `public/images/products/`. The typeface is Instrument Sans, installed from npm.

## Run it

Node 22 and Yarn 1.

```
yarn install
yarn serve   # development server
yarn build   # production build in dist/
yarn lint
```

Netlify builds `master` with `netlify.toml`.
