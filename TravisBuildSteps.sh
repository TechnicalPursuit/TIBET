npm link .

tibet build

cd ..

tibet clone travis
cd travis
tibet init --link

#npm install phantomjs-prebuilt
#tibet test

npm install -g karma-cli
npm install --save-dev karma
npm install --save-dev karma-chrome-launcher
npm install --save-dev karma-tibet

export CHROME_BIN=/Users/yourusername/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome

tibet config karma.boot.profile="main#contributor"
tibet config karma.script=":test --context='all'"
tibet config sherpa.enabled=false

karma start


alternates:

Chrome in /Applications folder
export CHROME_BIN=/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome

Don't boot minified
tibet config karma.boot.minified=false

Don't boot inlined
tibet config karma.boot.inlined=false

A particular suite
tibet config karma.script=":test --context='all' --suite='bind: simple binds'"

Increase timeout
tibet config karma.timeout=1200000
