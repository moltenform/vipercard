
### How to build ViperCard:

- prereqs: node.js

- download vipercard source

- open a terminal / cmd.exe

- cd to vipercard/src/src

- use npm install to download dependencies

- (there should now be a directory ./node_modules)

- run typescript compiler (./node_modules/.bin/tsc)

- (there should now be a directory ./release)

- run node serve.js, which starts a simple web server

- in Safari or Chrome, go to http://127.0.0.1:8999/0.2/index.debug.html

- (as of 3/2018 Firefox doesn't yet support script type=module by default)

### How to build ViperCard (ship):

- a ship build is minified and also bundles all code into a single js file for more browser compat.

- first run previous build ViperCard instructions.

- do the following:

    - selects the release version of config.js, tsconfig.json, and index.html
    
    - replaces module level this in the typescript-emitted code
    
    - runs rollup.js to go from js modules to one file
    
    - node ..\node_modules/rollup/bin/rollup ../release/ui512/ui512root.js --output.format iife --name "vpcbundle" --output.file ..\lib\vpcbundle.js
    
    - uglify to minify the javascript
    
    - node ..\node_modules\uglify-js\bin\uglifyjs ..\lib\vpcbundle.js -o ..\lib\vpcbundlemin.js --keep-fnames --mangle --compress --source-map "filename=vpcbundle.js.map"
    
- cd to vipercard/src/src

- run node serve.js, which starts a simple web server

- in any browser, go to http://127.0.0.1:8999/0.2/index.release.html
    
## How to run unit tests

- in the browser, view JavaScript console

- start ViperCard

- press Option-Shift-T

- test status should be shown. eventually expected to see a message like "129/129. all tests pass."

- for in-application tests, see vipercard/src/src/src/test/in-app-tests/inapptest.json

