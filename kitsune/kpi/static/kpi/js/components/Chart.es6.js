/* globals d3:false, $:false */
/* jshint esnext: true */

export default class Chart {
  constructor($container, options) {
    let defaults = {
      chartColors: ['#ef3b2c','#fc9272', '#fcbba1', '#fee0d2', '#fff5f0','#E6F2E6','#CCE6CC','#80C080','#4DA64D','#198D19'],
      axes: {
        xAxis: {
          labels: []
        },
        yAxis: {
          labels: []
        },
        getPosition: function(position, axis, index, gridSize) {
          if (position === 'x' && axis === 'xAxis' || position === 'y' && axis === 'yAxis') {
            return (index * gridSize - gridSize);
          }

          if (position === 'y' && axis === 'xAxis' || position === 'x' && axis === 'yAxis') {
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

    this.colorScale = d3.scale.quantile()
        .domain([0, 100])
        .range(this.chartColors);

    this.init();
  }

  // render whatever pieces of the chart we can
  // while we're waiting for all the data to arrive
  preRender() {

    // draw the container svg for the chart
    this.dom.svg = d3.select(this.dom.graphContainer).append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');

    // set up x axis
    this.setupAxis('xAxis');
    this.setupLegend();
  }

  setupAxis(axis) {
    var self = this;
    var axisGroup = self.dom.svg.selectAll('.' + axis)
      .data(self.axes[axis].labels)
        .enter().append('g')
        .attr('class', axis);

    var axisRects = axisGroup.append('rect')
      .attr('x', function(d, i) {
        return self.axes.getPosition('x', axis, i, self.gridSize);
      })
      .attr('y', function(d, i) {
        return self.axes.getPosition('y', axis, i, self.gridSize);
      })
        .attr('width', self.gridSize)
        .attr('height', self.gridSize/2)
        .attr('class', axis + 'Rect border')
        .attr('fill', 'white')

    var axisLabels = axisGroup.append('text')
        .attr('class', 'mono ' + axis + 'Text')
        .text(function(d,i) { return d; })
      .attr('x', function(d, i) {
        return self.axes.getPosition('x', axis, i, self.gridSize);
      })
      .attr('y', function(d, i) {
        return self.axes.getPosition('y', axis, i, self.gridSize);
      })
  }

  setupLegend() {
    var self = this;

      var legend = self.dom.svg.selectAll('.legend')
          .data([0].concat(self.colorScale.quantiles()), function(d) { return d; })
          .enter().append('g')
          .attr('class', 'legend');

      legend.append('rect')
        .attr('x', function(d, i) { return self.legendElementWidth * i - self.gridSize; })
        .attr('y', (12 * self.gridSize/2) + self.gridSize )
        .attr('width', self.legendElementWidth)
        .attr('height', self.gridSize / 4)
        .style('fill', function(d, i) { return self.chartColors[i]; });

      legend.append('text')
        .attr('class', 'mono legendText')
        .text(function(d, i) { return '≥ ' + Math.round(i / (self.buckets + 1) * 100) + '%'; })
        .attr('x', function(d, i) { return self.legendElementWidth * i - self.gridSize; })
        .attr('y', (12 * self.gridSize/2) + 1.5*self.gridSize );
  }

  init() {
    this.preRender();

  }

  populateData(filter) {
      var self = this;
      // self.data = _.where(self.data, { "kind": filter })


      var cohort = self.dom.svg.selectAll('.cohort') // DATA READY
              .data(self.data).enter().append('g').filter(function(d) {
                return d.kind === filter
              });

      cohort.each(function(cohort, i) {
        var cohortGroupNumber = i;
        var cohortOriginalSize = cohort.size;
        var boxes = d3.select(this)
          .selectAll('rect')
            .data(cohort.retention_metrics);

        boxes.exit().remove();

        boxes = d3.select(this)
          .selectAll('rect')
          .data(cohort.retention_metrics)
          .enter().append('rect')
          .attr('x', function(d, i) {
            return i * self.gridSize;
          })
          .attr('y', function(d, i) {
            return cohortGroupNumber * self.gridSize/2;
          })
          .attr('class', 'retention-week')
          .attr('width', self.gridSize)
          .attr('height', self.gridSize/2)
          .style('fill', function(d) {
            console.log("Percentage: ", Math.floor((d.size / cohortOriginalSize) * 100) || 0);
            console.log("COLOR SCALE: ", self.colorScale(10));
            return self.colorScale(Math.floor((d.size / cohortOriginalSize) * 100) || 0)
          });

        var sizeText = d3.select(this)
          .selectAll('text')
            .data(cohort.retention_metrics)
          .enter().append('text')
              .attr('x', function(d, i ) {
                return i * self.gridSize + 10;
              })
              .attr('y', function(d, i) {
                return (cohortGroupNumber * self.gridSize/2) + 23;
              }).text(function(d, i) {
                let text = d.size;
                if (i > 0) {
                  text = text + ' (' + (Math.floor((d.size / cohortOriginalSize) * 100) || 0) + '%)';
                }
                return text;
              });

      });

    }
  }
