
### How to build ViperCard:

- install node.js

- download vipercard source

- cd to `vipercard/vipercard`

- run `npm install`

- run `npm run start`

- webpack will do its thing, after ~30s of compiling, a browser and vipercard will open

### Running tests

- open the JavaScript console, usually in the brower's 'show development tools'

- click on any button in ViperCard, then press Option+Shift+T

- the test status should be shown, and finally a message like '261/261. all tests pass.'

### Build for production

- Production builds have minified js and fewer breakpoints

- cd to `vipercard/vipercard`

- run `npm run build`

- an output .js file will be written to `./dist`

- make a copy of `index.dev.html` with a new `<script>` at the bottom pointing to the js file

- run a server and open the new html file

