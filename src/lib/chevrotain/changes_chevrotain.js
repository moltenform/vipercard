
// changes added by Ben Fisher, 2017
function buildInitDefFunc(childrenNames) {
    var oneOfTheseObjects = {}
    utils_1.map(childrenNames, function (currName) {
        oneOfTheseObjects[currName] = []
    })

    // ben fisher, 2017:
    // I don't want to use new Function() because it's basically eval
    // this workaround should provide the same behavior.
    // is it really true that it needs to create a new object every time?
    // if so, it's correct that I am creating an entirely new object.
    // I'm using JSON to make a clone. 
    var serialized = JSON.stringify(oneOfTheseObjects)
        
    return function() {
        return JSON.parse(serialized)
    }

    // var funcString = "return {\n";
    // funcString += utils_1.map(childrenNames, function (currName) { return "\"" + currName + "\" : []"; }).join(",\n");
    // funcString += "}";
    // major performance optimization, faster to create the children dictionary this way
    // versus iterating over the childrenNames each time.
    // return Function(funcString);
}
