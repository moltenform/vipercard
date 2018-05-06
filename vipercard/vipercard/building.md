
### How to build ViperCard:

- if not already present, install node.js

- download vipercard source

- open a terminal

- cd to vipercard/src/src

- use npm install to download dependencies

- (there should now be a directory ./node_modules)

- copy tsconfig.debug.json to tsconfig.json

- copy src/config.debug.ts to src/config.ts

- copy 0.2/index.debug.html to 0.2/index.html

- run the typescript compiler, by running ./node_modules/.bin/tsc

- (there should now be a directory ./build)

- run node serve.js, which starts a simple web server

- in Safari or Chrome, go to http://127.0.0.1:8999/0.2/

- (as of 3/2018, for debug builds to be run in Firefox, one needs to manually enable script type=module)

### How to make a bundled "ship" build of ViperCard:

- a "ship" build:

- 1) minifies the code for a smaller js download size.

- 2) separates test code from product code for a smaller js download size.

- 3) doesn't require script type=module, thus has more browser compatibility.

- build ViperCard using the instructions above

- run tools/make_release_bundle.py, which will *automatically*

    - select tsconfig.ship.json, config.ship.ts, etc
    
    - run rollup.js to go from js modules to one file
    
    - run uglify to minify the javascript
    
    - save output files to lib/vpcbundle*.js
    
- cd to vipercard/src/src

- run node serve.js, which starts a simple web server

- in any browser, go to http://127.0.0.1:8999/0.2/index.release.html

- index.release.html points to vpcbundlemin.js; you're now running a "ship" build
    
## How to run tests

- build ViperCard

- cd to vipercard/src/src

- run node serve.js, which starts a simple web server

- open http://127.0.0.1:8999/0.2/index_wtests.debug.html

- (or, if using a ship build, http://127.0.0.1:8999/0.2/index_wtests.ship.html)

- open the JavaScript console. you may have to 'show development tools' in browser settings.

- press Option+Shift+T

- test status should be shown. eventually expected to see a message like "261/261. all tests pass."

- in-application tests can be seen in vipercard/src/src/src/test/in-app-tests

