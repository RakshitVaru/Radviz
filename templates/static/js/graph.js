var dataset, disvariable, normalizationvar, points, tipvariable, colorVar,chrt, chrtbdr; // Global Variable Declaration 
var canvas = function(main, width, height){  //main area for plotting declared

        //Dimension Declaration
        var margins = {top:60, bottom:60, left: 60, right:60};
        var center = {x: (width - margins.left - margins.right)/2, y: (height - margins.top - margins.bottom)/2};
        var radius = Math.min(center.x, center.y);
        var color = d3.scale.category10(); //Color scale declared for points

        //main svg creation
        var svg = d3.select(main)
          .append("svg")
          .attr("width",width)
          .attr("height", height);
    
        //Area to draw the circle defined
        chrt = svg.append("g")
          .attr("transform", "translate("+margins.left + "," + margins.top + ")");
        
        //Area Borderto draw the circle defined
        chrtbdr = svg.append("g")
          .attr("transform", "translate("+margins.left + "," + margins.top + ")")
        
        //To set the angle for every point in respect to the features
        var pointangle = function(angle) {
          return {
            x: center.x + radius*Math.cos(angle),
            y: center.y + radius*Math.sin(angle)
          };
        };


        // visualaztion function for the plot
        var visualization = function(){
          
          // Create feature points and style for the circle 
          points = disvariable.map(function(d, i, arr){return pointangle((2*Math.PI/arr.length)*i);})

          var circleanc = chrtbdr.selectAll("circle").data(points);
          circleanc.exit().remove();
          circleanc.enter().append("circle");
          circleanc.attr({
            cx: function(d){return d.x},
            cy: function(d){return d.y},
            r: 3
          }).style("fill", "black");
          
          //to get the x and y values of the points with offset values
          var offsetDistance = 15;    
          var getX = function(d, i) {
            var xoff = points[i].x - center.x;
            var yoff = points[i].y - center.y;
            var angle = Math.atan2(yoff, xoff);
            return points[i].x + offsetDistance*Math.cos(angle);
          };
          var getY = function(d, i) {
            var xoff = points[i].x - center.x;
            var yoff = points[i].y - center.y;
            var angle = Math.atan2(yoff, xoff);
            return points[i].y + offsetDistance*Math.sin(angle);
          };

          //to get the anchor and its basline points
          var getAnchor = function(d, i) {
            var xoff = points[i].x - center.x;
            if (xoff >= -0.1) return "start";
            return "end";
          }
          var getbaseline = function(d, i) {
            var yoff = points[i].y - center.y;
            if (yoff > 0) return "hanging";
            return "alphabetic";
          }

          //defining label for anchors
          var labelsforanchor = chrtbdr.selectAll("text").data(disvariable);
          labelsforanchor.exit().remove();
          labelsforanchor.enter().append("text");
          labelsforanchor.attr({
            x: getX,
            y: getY,
            "font-size": 10,
            "text-anchor": getAnchor,
            "alignment-baseline": getbaseline,
            "pointer-events": "none"
          }).text(function(d){return d});

          //Circle Creation
          chrtbdr.append("circle")
          .attr({
            cx: center.x,
            cy: center.y,
            r: radius,
            })
            .style("stroke", "black")
            .style("fill", "none");

          //to normalize and get the data in the range of 0 and 1
          normalizationvar = disvariable.map(function(){return d3.scale.linear().range([0, 1]);});
          normalizationvar.forEach(function(element, i, array){
            element.domain(d3.extent(dataset, function(d){return +d[disvariable[i]];}));
          });

          //to provide different colors to different classes in the dataset
          if (colorVar) {color.domain(catergoryValues(dataset, colorVar))};

          //circle is fitted in the chart defined earlier and also added the data in it
          var c = chrt.selectAll("circle").data(dataset);
          c.exit().remove();
          c.enter().append("circle");

          //to get the normalized points for plotting and relative distance between points
          var getPoint = function(d) {
            var list = normalizationvar.map(function(element, i, array){
              return element(d[disvariable[i]]);
            });
            var sum = list.reduce(function(previous, current) {return previous + current;});
            var pnt = {x:0, y:0};
            for (var i = 0; i < points.length; i++) {
              pnt.x += (list[i]/sum)*points[i].x
              pnt.y += (list[i]/sum)*points[i].y
            }
            return pnt;
          }

          //to get the x and y position of the points
          var getX = function(d) {if (d!=null) return getPoint(d).x; };

          var getY = function(d) {if (d!=null)return getPoint(d).y; };

          //point position and transition when different attributes or features are selected
          c.transition()
          .duration(1000)
          .attr({
            cx: getX,
            cy: getY,
            r: 3
          }).style("fill", function(d){
            if (!colorVar) {return "black";}
            return color(d[colorVar]);});
          
          
            d3.select("#range1").on("input", function () {

              chrt.selectAll("circle")
                              .transition()
                              .duration(500)
                              .style("opacity", d3.select("#range1").property("value")/100);
              });
              
          //mouse out function for the points
          c.on("mouseout", function(data){
            d3.select(this)
              .classed("selected", false)
              .attr("r", 2);
              d3.select('.hidden').style("opacity",0);
              document.getElementById("image").style.opacity = "0"; //to hide the information on mouse out
          });

          //mouse hover function for the points
          c.on("mouseover", function(data){
            d3.select('.hidden').style("opacity",1); //to show the information on mousehover
            d3.select(this)
              .classed("selected", true)
              .attr("r", 8);
            var information = d3.select("#tip");
            var nonnum = information.select("#nonnum").selectAll("p").data(tipvariable);
            nonnum.exit().remove();
            nonnum.enter().append("p");
            nonnum.text(function(d){
              
              return d + ":  " + data[d]});

            //to check if the color by property selects the class label and then showing the labels for the data with class label as distinct colored
            if (colorVar) {
              var colcat = information.select("#colcat").selectAll("p").data([colorVar]);
              colcat.exit().remove();
              colcat.enter().append("p")

              colcat.text(function(d){
                console.log(data[d]);
                if (link=="http://localhost:5000/bonus"){
                  document.getElementById('image').style.opacity="0";
                }
                else{
                document.getElementById('image').style.opacity="1";
                document.getElementById('image').innerHTML = '<img width="400" height="400" src="http://localhost:5000/get_image/'+ d +'-'+data[d] +'"/>';}
                console.log(d+'-'+data[d]);
                return d + ":  " + data[d]})
                .style("color", function(d){return color(data[d]);});
            }

            // to get and show the values of each features of the point selected
            var num = information.select("#num").selectAll("p").data(disvariable);
            num.exit().remove();
            num.enter().append("p");
            num.text(function(d){ 
              console.log(data[d]);
              return d + ":  " + data[d]});
              
              information.classed("hidden", false);
          })
        };

        //setting the data along with the colors, attributes and tooltip for the circle
        visualization.loadcsv = function(data){
          dataset = data;
          console.log(dataset);
          return visualization;
        }

        visualization.setAttr = function(value){
          if (!arguments.length) return disvariable;
          disvariable = value;
          return visualization;
        }

        visualization.setTip = function(value) {
          if (!arguments.length) return tipvariable;
          tipvariable = value;
          return visualization;
        }
  
        visualization.setcolor = function(value) {
          if (!arguments.length) return colorVar;
          colorVar = value;
          return visualization;
        }

        return visualization;
      };

      //use the data to divide unique values into category which can be used for color differentiation and to display the different classes in a circle
      var catergoryValues = function(d, v) {
          var base_data = [];
          for (var i=0; i<d.length; i++){
            if (!base_data.includes(d[i][v])) {
              base_data.push(d[i][v]);
            }
          }
          return base_data;
        };
      
      //visualization call and the parameters given
      var visualization = canvas("#radviz", 800,600);
      
      //To reset to standard position when new dataset is provided
      var del = function(){
        var coldel= document.getElementById('black');
        coldel.checked= true;
        
        var numdel=document.getElementsByName("numatr");
        for(var i=0;i<numdel.length;i++)
        {
          if(numdel[i].type=='checkbox')
          {
            numdel[i].checked=false;
          }
        }
        
        var tipdel=document.getElementsByName("toolatr");
        for(var i=0;i<tipdel.length;i++)
        {
          if(tipdel[i].type=='checkbox')
          {
            tipdel[i].checked=false;
          }
        }
        
        document.getElementById('range1').value = "100";
      }
      var link;
      var start= function(){
        link="http://localhost:5000/download";
        loadcsv();
      }
      var cluster= function(){
        link="http://localhost:5000/clustering";
        loadcsv();
      }
      var param= function(){
        var number=document.getElementById("parameter").value
        if (number==''){
          alert("Field is blank");
        }
        else{
        link="http://localhost:5000/newcluster?parameter="+number+"&parameter_changed=Submit+Query";
        loadcsv();}
      }

      var bonus= function(){
        link="http://localhost:5000/bonus";
        loadcsv();
      }
      //function to load the csv file from user
      var loadcsv = function() {
        var x= d3.select("svg").selectAll("circle").attr("r",0); //to remove all the points when new dataset is loaded
        del();
         d3.json (link,
          function(dataset){
            console.log(dataset)
            var tab = function(prop, main, name, type) {
              var input = d3.select(main).selectAll("g").data(prop);
              input.exit().remove();

              var grp = input.enter().append("g");
              grp.append("input");
              grp.append("text");

              input.select("input")
              .attr({
                "type":type,
                "value":function(d){return d},
                "label":function(d){return d},
                "name":name
              });
              input.select("text").text(function(d){return d}).append("p");
            };

            // to get the feature values to be displayed on the circle
            var datasettouse = [];
            /*var type1=[];
            for (property in dataset[0]) {
              type1.push(typeof property);
              datasettouse.push(property);
            }
            var test=[];*/
            for (property in dataset[0]) {
              if (!(catergoryValues(dataset, property).length <= 10)) {
                if(property!="occupation" && property!="native-country"){
                datasettouse.push(property);}
              }
            }

            //console.log(test);            
            //datasettouse.pop(); //to remove the class attributes from the dataset

            //to show the feature name in the information area
            tab(datasettouse, "#num", "numatr", "checkbox");
            
            //adding all data features to tooltip table
            tab(Object.keys(dataset[0]), "#tools", "toolatr", "checkbox");
            console.log(Object.keys(dataset[0]));
            
            //find categorical vars
            var cat = [];
            for (property in dataset[0]) {
              if (catergoryValues(dataset, property).length <= 10) {
                cat.push(property);
              }
            }
            console.log(cat);

            //to show the feature values to color the points by
            tab(cat, "#color", "coloratr", "radio");

            //local call to every function to set the values
            visualization.loadcsv(dataset);
            visualization.setAttr([]);
            visualization.setTip([]);
            visualization();
        });

        // to change and set the values of attributes on change in dataset 
        d3.select("#setattr").on("change", function(d){
          var sel = document.querySelectorAll('input[name="numatr"]:checked');
          console.log(sel);
          var selectedelements = [];
          for (var i=0; i<sel.length; i++) {
            selectedelements.push(sel[i].value);
          }
          console.log(selectedelements);
          visualization.setAttr(selectedelements);
          visualization();
        });

        // to change and set the values of tooltip values on change in dataset
        d3.select("#settooltip")
        .on("change", function(d){
          var sel = document.querySelectorAll('input[name="toolatr"]:checked');
          var selectedelements = [];
          for (var i=0; i<sel.length; i++) {
            selectedelements.push(sel[i].value);
          }
          visualization.setTip(selectedelements);
          visualization();
          });

        // to change and set the values of differentiating class of the dataset
        d3.select("#setcolor")
        .on("change", function(d){
          var sel = document.querySelector('input[name="coloratr"]:checked');
          var val = sel.value;
          if (val == "-1") visualization.setcolor(null);
          else visualization.setcolor(val);
          visualization();
        })
      }
