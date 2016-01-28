/* globals $:false, gettext:false, k:false */
(function() {

  'use strict';

  function init() {
    createRetentionChart($('#kpi-cohort-analysis'));

    makeKPIGraph($('#kpi-questions'), true, [
      {
        name: gettext('Questions'),
        slug: 'questions',
        func: k.Graph.identity('questions'),
        color: '#5d84b2',
        axisGroup: 'questions',
        area: true
      },
      {
        name: gettext('Solved'),
        slug: 'num_solved',
        func: k.Graph.identity('solved'),
        color: '#aa4643',
        axisGroup: 'questions',
        area: true
      },
      {
        name: gettext('% Solved'),
        slug: 'solved',
        func: k.Graph.fraction('solved', 'questions'),
        color: '#aa4643',
        axisGroup: 'percent',
        type: 'percent'
      },
      {
        name: gettext('Responded in 24 hours'),
        slug: 'num_responded_24',
        func: k.Graph.identity('responded_24'),
        color: '#89a54e',
        axisGroup: 'questions',
        area: true
      },
      {
        name: gettext('% Responded in 24 hours'),
        slug: 'responded_24',
        func: k.Graph.fraction('responded_24', 'questions'),
        color: '#89a54e',
        axisGroup: 'percent',
        type: 'percent'
      },
      {
        name: gettext('Responded in 72 hours'),
        slug: 'num_responded_72',
        func: k.Graph.identity('responded_72'),
        color: '#80699b',
        axisGroup: 'questions',
        area: true
      },
      {
        name: gettext('% Responded in 72 hours'),
        slug: 'responded_72',
        func: k.Graph.fraction('responded_72', 'questions'),
        color: '#80699b',
        axisGroup: 'percent',
        type: 'percent'
      },
      {
        name: gettext('Not responded in 24 hours'),
        slug: 'not_responded_24',
        color: '#C98531',
        func: k.Graph.difference('questions', 'responded_24'),
        area: true
      },
      {
        name: gettext('Not responded in 72 hours'),
        slug: 'not_responded_72',
        color: '#DB75C2',
        func: k.Graph.difference('questions', 'responded_72'),
        area: true
      }
    ]);

    makeKPIGraph($('#kpi-vote'), true, [
      {
        name: gettext('Article Votes: % Helpful'),
        slug: 'wiki_percent',
        func: k.Graph.fraction('kb_helpful', 'kb_votes'),
        type: 'percent'
      },
      {
        name: gettext('Answer Votes: % Helpful'),
        slug: 'ans_percent',
        func: k.Graph.fraction('ans_helpful', 'ans_votes'),
        type: 'percent'
      }
    ]);

    makeKPIGraph($('#kpi-active-contributors'), false, [
      {
        name: gettext('en-US KB'),
        slug: 'en_us',
        func: k.Graph.identity('en_us')
      },
      {
        name: gettext('non en-US KB'),
        slug: 'non_en_us',
        func: k.Graph.identity('non_en_us')
      },
      {
        name: gettext('Support Forum'),
        slug: 'support_forum',
        func: k.Graph.identity('support_forum')
      },
      {
        name: gettext('Army of Awesome'),
        slug: 'aoa',
        func: k.Graph.identity('aoa')
      }
    ]);

    makeKPIGraph($('#kpi-ctr'), true, [
      {
        name: gettext('Click Through Rate %'),
        slug: 'ctr',
        func: k.Graph.fraction('clicks', 'searches'),
        type: 'percent'
      }
    ]);

    makeKPIGraph($('#kpi-visitors'), true, [
      {
        name: gettext('Visitors'),
        slug: 'visitors',
        func: k.Graph.identity('visitors')
      }
    ]);

    makeKPIGraph($('#kpi-l10n'), true, [
      {
        name: gettext('L10n Coverage'),
        slug: 'l10n',
        // the api returns 0 to 100, we want 0.0 to 1.0.
        func: function(d) { return d.coverage / 100; },
        type: 'percent'
      }
    ]);

    makeKPIGraph($('#exit-survey'), true, [
      {
        name: gettext('Percent Yes'),
        slug: 'percent_yes',
        func: k.Graph.percentage('yes', 'no', 'dont_know'),
        axisGroup: 'percent',
        type: 'percent'
      },
      {
        name: gettext('Yes'),
        slug: 'yes',
        func: k.Graph.identity('yes'),
        axisGroup: 'response'
      },
      {
        name: gettext('No'),
        slug: 'no',
        func: k.Graph.identity('no'),
        axisGroup: 'response'
      },
      {
        name: gettext("I don't know"),
        slug: 'dont_know',
        func: k.Graph.identity('dont_know'),
        axisGroup: 'response'
      }
    ]);

  }

  var RetentionChart = function($container, options) {
    let defaults = {
      chartColors: ['#ef3b2c','#fc9272', '#fcbba1', '#fee0d2', '#fff5f0',"#E6F2E6","#CCE6CC","#80C080","#4DA64D","#198D19"],
      axes: {
        xAxis: {
          labels: []
        },
        yAxis: {
          labels: []
        },
        getPosition: function(position, axis, index, gridSize) {
          console.log("posArgs: ", axis, index, gridSize);
          if (position === "x" && axis === "xAxis" || position === "y" && axis === "yAxis") {
            return (index * gridSize - gridSize);
          }

          if (position === "y" && axis === "xAxis" || position === "x" && axis === "yAxis") {
            return (-gridSize/2);
          }
        }
      },
      margin: { top: 70, right: 0, bottom: 100, left: 75 },
      width: 860,
      height: 430,
      grid: { rows: 12, columns: 12 },
      gridSize: 71,
      buckets: 9,
      legendElementWidth: 860/9,
      data: [],
      dom: {
        graphContainer: $container.find('.graph').get()[0]
      }
    };

    // true means do a deep merge.
    $.extend(true, this, defaults, options);

    this.init();
  }

  // render whatever pieces of the chart we can
  // while we're waiting for all the data to arrive
  RetentionChart.prototype.preRender = function() {

    // draw the container svg for the chart
    this.dom.svg = d3.select(this.dom.graphContainer).append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom)
      .append("g")
      .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

      // set up x axis
      this.setupAxis('xAxis');
  }

  RetentionChart.prototype.setupAxis = function(axis) {
    var self = this;
    var axisGroup = self.dom.svg.selectAll("." + axis)
      .data(self.axes[axis].labels)
        .enter().append("g")
        .attr("class", axis);

    var axisRects = axisGroup.append("rect")
      .attr("x", function(d, i) {
        return self.axes.getPosition("x", axis, i, self.gridSize);
      })
      .attr("y", function(d, i) {
        return self.axes.getPosition("y", axis, i, self.gridSize);
      })
        .attr("width", self.gridSize)
        .attr("height", self.gridSize/2)
        .attr("class", axis + "Rect border")
        .attr("fill", "white")

    var axisLabels = axisGroup.append("text")
        .attr("class", "mono " + axis + "Text")
        .text(function(d,i) { return d; })
      .attr("x", function(d, i) {
        return self.axes.getPosition("x", axis, i, self.gridSize);
      })
      .attr("y", function(d, i) {
        return self.axes.getPosition("y", axis, i, self.gridSize);
      })
  }

  RetentionChart.prototype.init = function() {
    this.preRender();

  }

    RetentionChart.prototype.populateData = function(data, filter) {
      console.log("Populating data...: ", filter);
      var self = this;
      // self.data = _.where(self.data, { "kind": filter })

      var cohort = self.dom.svg.selectAll(".cohort") // DATA READY
              .data(data).enter().append("g").filter(function(d) {
                return d.kind === filter
              });

              cohort.each(function(cohort, i) {
                var cohortGroupNumber = i;
                var cohortOriginalSize = cohort.size;
                var boxes = d3.select(this)
                  .selectAll('rect')
                    .data(cohort.retention_metrics);

                    boxes.exit().remove();

                  boxes = d3.select(this).
                    selectAll('rect')
                    .data(cohort.retention_metrics)
                    .enter().append('rect')
                    .attr("x", function(d, i) {
                      return i * self.gridSize;
                    })
                    .attr("y", function(d, i) {
                      return cohortGroupNumber * self.gridSize/2; })
                    .attr("class", "retention-week")
                    .attr("width", self.gridSize)
                    .attr("height", self.gridSize/2)
                    .style("fill", function(d) {
                      return self.colorScale(Math.floor((d.size / cohortOriginalSize) * 100))
                    });

                var sizeText = d3.select(this)
                  .selectAll('text')
                    .data(cohort.retention_metrics)
                  .enter().append("text")
                      .attr("x", function(d, i ) {
                        return i * self.gridSize + 10;
                      })
                      .attr("y", function(d, i) {
                        return (cohortGroupNumber * self.gridSize/2) + 23;
                      }).text(function(d, i) {
                        let text = d.size;
                        if (i > 0) {
                          text = text + " (" + Math.floor((d.size / cohortOriginalSize) * 100) + "%)";
                        }
                        return text;
                        //return d.size + " (" + Math.floor((d.size / cohortOriginalSize) * 100) + "%)";
                      });

              });

          var legend = self.dom.svg.selectAll(".legend")
              .data([0].concat(self.colorScale.quantiles()), function(d) { return d; })
              .enter().append("g")
              .attr("class", "legend");

          legend.append("rect")
            .attr("x", function(d, i) { return self.legendElementWidth * i - self.gridSize; })
            .attr("y", (12 * self.gridSize/2) + self.gridSize )
            .attr("width", self.legendElementWidth)
            .attr("height", self.gridSize / 4)
            .style("fill", function(d, i) { return self.chartColors[i]; });

          legend.append("text")
            .attr("class", "mono legendText")
            .text(function(d) { return "≥ " + Math.round(d); })
            .attr("x", function(d, i) { return self.legendElementWidth * i - self.gridSize; })
            .attr("y", (12 * self.gridSize/2) + 1.5*self.gridSize );

    }


  function createRetentionChart($container) {
    let fetchDataset = getChartData($container.data('url'), 'results');

    var retentionChart = new RetentionChart($container, {
      axes: {
        xAxis: {
          labels: ["Cohort", "W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8", "W9", "W10", "W11", "W12"]
        }
      }
    });


    fetchDataset.done(function(data) {
      retentionChart.data = data;
      retentionChart.axes.yAxis.labels = _.uniq(_.pluck(data, 'start')); // .slice(-12) DATA READY
      retentionChart.colorScale = d3.scale.quantile() // DATA READY
              .domain([0, d3.max(data, function (d) {
                return d.size;
              })])
              .range(retentionChart.chartColors);

          retentionChart.setupAxis('yAxis');
          retentionChart.populateData(data, "contributor");

          $('#toggle-cohort-type').change(function() {
            var cohortType = $(this).val();
            console.log("Cohort Type Selected: ", cohortType);
            retentionChart.populateData(data, cohortType);
          });

    }).fail(function(error) {
      console.log("There was an error retrieving the data: ", error);
    });
  }


  function getChartData(url, propertyKey) {
    let dataReady = $.Deferred();
    let datumsToCollect = propertyKey;
    let fetchData = function(url, existingData) {
      $.getJSON(url, function(data) {
        existingData = existingData.concat(data[datumsToCollect] || data);
        if (data.next) {
          return fetchData(data.next, existingData);
        } else {
          dataReady.resolve(existingData);
        }
      }).fail(function(error) {
        dataReady.reject(error);
      });
    }

    fetchData(url, []);
    return dataReady;
  };


  function makeKPIGraph($container, bucket, descriptors) {
    let fetchDataset = getChartData($container.data('url'), 'objects');
    fetchDataset.done(function(data) {
      new k.Graph($container, {
        data: {
          datums: data,
          seriesSpec: descriptors
        },
        options: {
          legend: 'mini',
          slider: true,
          bucket: bucket
        },
        graph: {
          width: 880,
          height: 300
        },
      }).render();
    }).fail(function(error) {
      console.log("There was an error retrieving the data: ", error);
    });
  }

  $(init);

})();
