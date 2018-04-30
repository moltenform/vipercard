
### How to build ViperCard:

- if not already present, install node.js

- download vipercard source

- open a terminal

- cd to vipercard/src/src

- use npm install to download dependencies

- (there should now be a directory ./node_modules)

- run the typescript compiler, by running ./node_modules/.bin/tsc

- (there should now be a directory ./build)

- run node serve.js, which starts a simple web server

- in Safari or Chrome, go to http://127.0.0.1:8999/0.2/index.debug.html

- (as of 3/2018, for debug builds to be run in Firefox, one needs to manually enable script type=module)

### How to build ViperCard (ship):

- a ship build is minified, and bundles all code into a single js file for more browser compat.

- build ViperCard using the instructions above

- do the following:

    - select the release version of config.js, tsconfig.json, and index.html
    
    - tools/replace_module_level_this.py can be used to eliminate "module level this" in the typescript-emitted code
    
    - run rollup.js to go from js modules to one file, with the following line:
    
    - `node ..\node_modules/rollup/bin/rollup ../build/ui512/ui512root.js --output.format iife --name "vpcbundle" --output.file ..\lib\vpcbundle.js`
    
    - run uglify to minify the javascript, with the following line:
    
    - `node ..\node_modules\uglify-js\bin\uglifyjs ..\lib\vpcbundle.js -o ..\lib\vpcbundlemin.js --keep-fnames --mangle --compress --source-map "filename=vpcbundle.js.map"`
    
- cd to vipercard/src/src

- run node serve.js, which starts a simple web server

- in any browser, go to http://127.0.0.1:8999/0.2/index.release.html
    
## How to run tests

- build using the steps above

- run node serve.js, which starts a simple web server

- open http://127.0.0.1:8999/0.2/index.debug.html

- press Option-Shift-T

- test status should be shown. eventually expected to see a message like "261/261. all tests pass."

- in-application tests can be seen in vipercard/src/src/src/test/in-app-tests

