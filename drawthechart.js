function DrawingChart(svg, stepCount) {
  //initialization
  stepCount = stepCount || 10;
  var svgNS = "http://www.w3.org/2000/svg",
    pointsArray = [],
    chartWidth = svg.parentNode.clientWidth,
    chartHeight = svg.parentNode.clientHeight;
  while (svg.lastChild) svg.removeChild(svg.lastChild);
  var chartField = new ChartGrid();
  var step = chartField.width/(stepCount-1);
  if (stepCount == 1) step = chartField.width*0;


  CreatePoint(chartField.field, chartField.width/4*3, chartField.height/4);


  //functions

  function sortPoints (a, b) {
    if (a.x < b.x) return -1;
    else if (a.x > b.x) return 1;
    else return 0
  }

  function translate (x, y) {
    return "translate(" + String(x) + ',' + String(y) + ")"
  }

  function GetPercantage(all, part) {
    return Math.round((all - part)*100/all);
  }

  //grid
  function ChartGrid () {
    var gridPadding = 30,
      gridXStart = 50,
      gridYStart = chartHeight - 50,
      gridWidth = chartWidth - gridXStart - gridPadding,
      gridHeight = gridYStart - gridPadding;
    var grid = document.createElementNS(svgNS, "g");
    grid.setAttributeNS(null, "transform", translate(gridXStart, gridPadding));
    var lines = CreateGridLines(gridWidth, gridHeight, 8);
    grid.appendChild(lines);

    // helpline
    var helpLine = document.createElementNS(svgNS, "line");
    helpLine.setAttributeNS(null, "x1", 0);
    helpLine.setAttributeNS(null, "x2", gridWidth);
    helpLine.setAttributeNS(null, "class", "help_line");
    var helpText = document.createElementNS(svgNS, "text");
    helpText.setAttributeNS(null, "x", 0);
    helpText.setAttributeNS(null, "y", 0);
    helpText.setAttributeNS(null, "class", "help_text");
    grid.appendChild(helpLine);
    grid.appendChild(helpText);


    var fieldGroup = document.createElementNS(svgNS, 'g');
    var field = document.createElementNS(svgNS, 'rect');
    field.setAttributeNS(null, "class", "grid_field");
    field.setAttribute("width", gridWidth);
    field.setAttribute("height", gridHeight);
    fieldGroup.appendChild(field);
    grid.appendChild(fieldGroup);

    var chartLine = CreateChartLine(chartField);
    fieldGroup.appendChild(chartLine);

    svg.appendChild(grid);
    svg.oncontextmenu = function () {
      return false;
    };


    field.ondblclick = function (e) {
      if (e.target.tagName == 'circle') {
        // console.log('circle', e.target);
        return;
      }
      if (e.target.tagName == 'polyline') {
        // console.log('polyline', e.target);
        return;
      }
      if (pointsArray.length < stepCount) {
        CreatePoint(fieldGroup, e.offsetX, e.offsetY);
      }
    };
    fieldGroup.ondragstart = function () {
      return false;
    };
    fieldGroup.oncontextmenu = function (e) {
      if (e.target.tagName == 'circle') {
        var point = e.target;
        if (pointsArray.length > 1) {
          DeletePoint(point);
        }
      }
      return false;
    };
    //dragging
    fieldGroup.onmousedown = function (e) {
      e.preventDefault();
      var Point;
      if (e.target.tagName == 'circle' && e.which == 1) {
        Point = GetPoint(e.target);
        var clickX = e.clientX,
          clickY = e.clientY,
          newX,
          newY,
          oldX = Point.x,
          oldY = Point.y;
        ShowTooltip();
        MoveTooltip(oldX, oldY);
        document.onmousemove = function (e) {
          var movedX = e.clientX,
            movedY = e.clientY;
          newX = oldX + (movedX - clickX);
          newY = oldY + (movedY - clickY);
          if (newX > chartField.width) newX = chartField.width;
          else if (newX < 0) newX = 0;
          var onstep = Math.round(newX/step);
          if (step == 0) onstep = 0;
          newX = onstep*step;
          if (newY > chartField.height) newY = chartField.height;
          else if (newY < 0) newY = 0;
          Point.point.setAttributeNS(null, 'cx', newX);
          Point.point.setAttributeNS(null, 'cy', newY);
          Point.x = newX;
          Point.y = newY;
          Point.onstep = onstep;
          pointsArray.sort(sortPoints);
          MoveTooltip(newX, newY);
          RedrawChartLine();
        };
        document.onmouseleave =
          document.onmouseup = function () {
            HideTooltip();
            document.onmousemove = null;
            document.onmouseup = null;
          };
      }
    };


    function MoveTooltip (x, y) {
      if (!x) x = 3;
      helpLine.setAttributeNS(null, "y1", y);
      helpLine.setAttributeNS(null, "y2", y);
      helpText.setAttributeNS(null, "x", x + 3);
      helpText.setAttributeNS(null, "y", y - 12);
      helpText.textContent = GetPercantage(chartField.height, y) + '%';
    }
    
    function ShowTooltip() {
      helpLine.classList.remove('svg_hidden');
      helpText.classList.remove('svg_hidden');
    }

    function HideTooltip() {
      helpLine.classList.add('svg_hidden');
      helpText.classList.add('svg_hidden');

      helpLine.setAttributeNS(null, "y1", 0);
      helpLine.setAttributeNS(null, "y2", 0);
      helpText.setAttributeNS(null, "x", 0);
      helpText.setAttributeNS(null, "y", 0);
      helpText.textContent = '';
    }


    this.field = fieldGroup;
    this.width = gridWidth;
    this.height = gridHeight;
    this.startX = gridXStart;
    this.startY = gridYStart;
    this.chartLine = chartLine
  }

  //lines
  function CreateGridLines(w, h, offset, verticalGridCount) {
    if (!verticalGridCount) verticalGridCount = 8;
    var linesWithLabels = document.createElementNS(svgNS, "g");
    var lines = document.createElementNS(svgNS, "g");
    lines.setAttributeNS(null, "class", "drawing_grid");
    var l = Math.floor(h/50);
    for (i=1; i<verticalGridCount;i++) {
      var vLine = NewLine (w/verticalGridCount*i, w/verticalGridCount*i, 0, h, 'vertical_grid_line');
      lines.appendChild(vLine);
    }
    for (i=0; i<=l;i++) {
      var lineX = h*i/l;
      var gLine = NewLine (0, w, lineX, lineX);
      var glabel = document.createElementNS(svgNS, "text");
      glabel.setAttributeNS(null, "x", -40);
      glabel.setAttributeNS(null, "y", lineX);
      glabel.setAttributeNS(null, "class", "grid_text");
      glabel.textContent = Math.round(Math.round(1000/l)*(l-i)/10) + '%';
      lines.appendChild(gLine);
      linesWithLabels.appendChild(glabel);
    }
    for (i=0; i<stepCount;i++) {
      // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! ( из-за -1)
      var lineX;
      if (stepCount <= 1) lineX = 0;
      else lineX = w/(stepCount-1)*i;
      var vLine = NewLine (lineX, lineX, h, h+offset);
      lines.appendChild(vLine);
    }
    linesWithLabels.appendChild(lines);
    return linesWithLabels;
  }

  function NewLine(x1,x2,y1,y2, lineclass) {
    var line = document.createElementNS(svgNS, "line");
    line.setAttributeNS(null, "x1", x1);
    line.setAttributeNS(null, "y1", y1);
    line.setAttributeNS(null, "x2", x2);
    line.setAttributeNS(null, "y2", y2);
    line.setAttributeNS(null, "class", lineclass);
    return line;
  }

  function CreateChartLine () {
    var polyline = document.createElementNS(svgNS,"polyline");
    polyline.setAttributeNS(null, "class", "chart_line");
    return polyline;
  }

  function RedrawChartLine () {
    var points = '0,' + chartField.height + ' ';
    for (i=0; i<pointsArray.length; i++) {
      points += pointsArray[i].x + ',' + pointsArray[i].y + ' '
    }
    if (stepCount > 1) points += chartField.width + ',' + chartField.height;
    chartField.chartLine.setAttributeNS(null, "points", points);
  }

  //points
  function CreatePoint(container, x, y) {
    //round x
    var onstep = Math.round(x/step);
    x = onstep*step;
    if (!x) x = 0;
    var myCircle = document.createElementNS(svgNS,"circle"); //to create a circle, for rectangle use rectangle
    myCircle.setAttributeNS(null,"class","chart_point");
    myCircle.setAttributeNS(null,"cx",x);
    myCircle.setAttributeNS(null,"cy",y);
    myCircle.setAttributeNS(null,"r",5);
    myCircle.ondragstart = function () {
      return false;
    };

    container.appendChild(myCircle);
    pointsArray.push({point: myCircle, x: x, y: y, onstep: onstep});
    pointsArray.sort(sortPoints);
    RedrawChartLine();
    return myCircle;
  }

  function DeletePoint(point) {
    for (i = 0; i < pointsArray.length; i++) {
      if (pointsArray[i].point == point) {
        chartField.field.removeChild(point);
        pointsArray.splice(i, 1);
        RedrawChartLine();
        break;
      }
    }
  }

  function DeleteAllPoints() {
    var l = pointsArray.length;
    for (i = 0; i < l; i++) {
      chartField.field.removeChild(pointsArray.reverse()[0].point);
      pointsArray.pop();
    }
    RedrawChartLine();
  }

  function GetPoint(point) {
    for (i = 0; i < pointsArray.length; i++) {
      if (pointsArray[i].point == point) {
        return pointsArray[i];
      }
    }
    return false;
  }

  // work with data
  function CollectData() {
    var output =[],
      prev = 0,
      next;

    for (i=0; i<pointsArray.length; i++) {
      onstep = pointsArray[i].onstep;
      output[onstep] = GetPercantage(chartField.height, pointsArray[i].y);
    }
    if (!output[stepCount-1]) output[stepCount-1] = 0;
    if (!output[0]) output[0] = 0;
    for (var i=0; i<output.length; i++){
      if (typeof(output[i]) !== 'number') {
        prev = output[i-1] || 0;
        var j=i;
        while (typeof(output[j]) !== 'number' && j < stepCount) j++;
        next = output[j];
        output[i] = prev + Math.round((next - prev)/(j-i+1));
      }
    }
    return output;
  }

  //properties
  this.container = svg;
  this.points = pointsArray;
  this.getData = function () {return CollectData()};
}