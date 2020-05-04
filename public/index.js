
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

function createTree(tree) {
  var root = {
          element: null,
          children: {}
        };
  for(var i = 0; i < tree.length; i++ ) {
    var segments = tree[i]._id.split('/');
    var level = root;
    for( var s = 0; s < segments.length; s++ ) {
      if( level.children[segments[s]] === undefined) {
        level.children[segments[s]] = {
          element: null,
          children: {}
        };
      }
      if( s+1 == segments.length) {
        level.children[segments[s]].element = tree[i];
        level.children[segments[s]].element.name = segments[s];
      }
      level = level.children[segments[s]];
    }
  }
  return root;
}

function drawTree(tree) {
  var html = "<ul>\n";
  for (var key in tree.children ) {
    if( ! tree.children.hasOwnProperty(key) )
      continue;
    var name = key;
    if( tree.children[key].element ) {
      html += '  <li><a href="javascript:show(\''+tree.children[key].element._id+'\')">'+name+" ("+tree.children[key].element.pics+")"+'</a>\n';
    }
    else {
      html += '  <li><span>'+name+'</span>\n';
    }
    if( Object.size(tree.children[key].children) > 0 ) {
      html += drawTree(tree.children[key]);
    }
    html += "</li>\n";
    }
    
      html += "</ul>\n";
      return html;
}

function render(width, pics, screenRatio) {
  var html = '';
  if (! pics ) {
    return html;
  }
  // this is to control the randomness...
  var possiblePicsPerRows = [ 2, 3, 3, 3, 4, 4, 5];
  if( screenRatio && screenRatio < 1 )
  	possiblePicsPerRows = [ 2, 2, 3, 3, 3, 4];
  var imageCounter = 0;
  var rowCounter = 0;
  while(true) {
    rowCounter++;
    // random number of pics per row
    var picsPerRow = possiblePicsPerRows[Math.round(possiblePicsPerRows.length * Math.random() - 0.5)];
    if( imageCounter + picsPerRow + 1 == pics.length ) {
      if( picsPerRow >= 4 ) {
        picsPerRow--;
      }else{
        picsPerRow++;
      }
    } else if(imageCounter + picsPerRow > pics.length ) {
      picsPerRow = pics.length - imageCounter;
    }
    var margin = 5 * (1+picsPerRow);
    var currentRowWidth = 0;
    for( var i = 0; i < picsPerRow; i++ ) {
      currentRowWidth += 200*pics[imageCounter+i].width/pics[imageCounter+i].height;
    }
    var scale = (width-margin) / currentRowWidth;
    var rowHeight = 200 * scale;
    var actualWidth = 0;
    for( i = 0; i < picsPerRow; i++ ) {
      var picwidth;
      // for the last picure we just take the delta to avoid errors due to rounding
      if( i+1 == picsPerRow )
        picwidth = width-margin-actualWidth;
      else
        picwidth = Math.round(rowHeight*pics[imageCounter+i].width/pics[imageCounter+i].height);
      actualWidth += picwidth;
      var resolution = 200;
      if(picwidth > 250 )
        resolution = 400;
      if( picwidth > 450)
        resolution = 600;
      isvideo = pics[imageCounter+i].video;
      var thumbName = "/thumb/"+resolution+"px/"+pics[imageCounter+i].myid+(isvideo?".jpg":"");
      html += '<div style="float: left; overflow: hidden; margin-left: 5; width: '+picwidth+'; height: '+Math.round(rowHeight)+';" >';
      html += '<a href="/pic/'+pics[imageCounter+i].myid+'" rel="gallery-1">';
      html += '<img src="'+(rowCounter<10?thumbName:"1x1.gif")+'" data-src="'+thumbName+'" data-type="'+(isvideo?"video":"image")+'" width="'+(picwidth+2)+'" class="slide"/>';
      html += '</a>';
      html += '</div>\n';
    }
    html += '<div style="clear: both; margin-bottom: 5; " />\n\n';
    imageCounter += picsPerRow;
    if( imageCounter === pics.length )
      break;
  }
  
  return html;
}
