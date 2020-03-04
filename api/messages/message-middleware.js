module.exports = {
    imapNestedFolders
}

// Structures Box Names with children
function imapNestedFolders(folders) {
    var FOLDERS = [];
    var folder = {};
  
    for (var key in folders) {
      if (folders[key].attribs.indexOf("\\HasChildren") > -1) {
        var children = imapNestedFolders(folders[key].children);
  
        folder = {
          name: key,
          children: children
        };
      } else {
        folder = {
          name: key,
          children: null
        };
      }
      FOLDERS.push(folder);
    }
    return FOLDERS;
  }