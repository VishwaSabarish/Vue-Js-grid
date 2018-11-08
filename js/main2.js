"use strict";

// TODO: Grid
Vue.component('grid', {
  props: {
    "ajax-url": {
      type: String,
      required: true
    },
    "order-by-col": String
  },
  template: "\n      <div class=\"col-md-12\">\n        <div class=\"row filters\">\n          <div class=\"col-md-12\">\n            <div class=\"form-inline\">\n              <div class=\"form-group\">\n                <label for=\"exampleInputName2\">Records per page</label>\n                <select class=\"form-control\" v-model=\"pageSize\">\n                  <option value=\"10\">10</option>\n                  <option value=\"20\">20</option>\n                  <option value=\"50\">50</option>\n                  <option value=\"100\">100</option>\n                </select>\n              </div>\n              <div class=\"form-group pull-right\">\n                <label for=\"exampleInputEmail2\">Search</label>\n                <input type=\"search\" class=\"form-control\" placeholder=\"Search here\" v-model=\"searchKey\">\n              </div>\n            </div>\n          </div>\n        </div>\n        <div class=\"row tbl-box\">\n          <div class=\"col-md-12\">\n            <table class=\"table table-bordered table-condensed table-hover\">\n              <thead><tr><slot></slot></tr></thead>\n              <tbody>\n                  <tr v-for=\"row in gridUpdatedData\"><td v-for=\"column in columns\"> {{ row[column.name] }} </td></tr>\n              </tbody>\n            </table>\n          </div>\n        </div>\n        <div class=\"row\">\n          <div class=\"col-md-12\">\n            <nav aria-label=\"Page navigation\" class=\"pull-right\">\n              <ul class=\"pagination\">\n                <li :class=\"{ disabled:  previousBtn}\">\n                  <a href=\"#\" aria-label=\"Previous\">\n                    <span aria-hidden=\"true\">&laquo;</span>\n                    Prev\n                  </a>\n                </li>\n                <li v-for=\"n in pageCount\" :class=\"{ active: currentPage == n }\" @click=\"gotoPage(n)\"><a href=\"#\">{{n}}</a></li>\n                <!-- <li><a href=\"#\">...</a></li> -->\n                <li :class=\"{ disabled:  previousBtn}\">\n                  <a href=\"#\" aria-label=\"Next\">\n                    Next\n                    <span aria-hidden=\"true\">&raquo;</span>\n                  </a>\n                </li>\n              </ul>\n            </nav>\n          </div>\n        </div>\n      </div>\n    ",
  data: function () {
    return {
      columns: [],
      gridData: [],
      orderedBy: "",
      sortDir: "",
      pageSize: 10,
      searchKey: "",
      maxPagenation: 6,
      currentPage: 1
    };
  },

  computed: {
    pageCount: function () {
      var dataLength = this.gridData.length;
      var pagesize = this.pageSize;
      return Math.round(dataLength / pagesize, 1);
    },
    previousBtn: function () {
      return this.currentPage == 1;
    },
    nextBtn: function () {
      return this.currentPage == this.pageCount;
    },
    gridUpdatedData: function () {
      var gridUpdatedData = this.gridData;
      var filterKey = this.searchKey;
      //TODO: Searching
      if (filterKey) {
        gridUpdatedData = gridUpdatedData.filter(function (row) {
          return Object.keys(row).some(function (key) {
            return String(row[key]).toLowerCase().indexOf(filterKey) > -1;
          });
        });
      }

      // TODO : Sorting
      gridUpdatedData = _.orderBy(gridUpdatedData, [this.orderedBy], [this.sortDir]);

      // TODO: Row Length
      gridUpdatedData = _.slice(gridUpdatedData, 0, this.pageSize);

      return gridUpdatedData;
    }
  },
  created: function () {
    var _this = this;

    this.columns = this.$children;
    this.orderedBy = this.orderByCol;
    this.sortDir = "asc";
    this.$http.get(this.ajaxUrl).then(function (response) {
      _this.gridData = response.body;
    }, function (response) {
      // error callback
      console.log(response.body);
    });

    this.$on('column_ordered', function (column) {
      this.orderedBy = column.columnname;
      this.sortDir = column.sortdir;

      this.columns = _.map(this.columns, function (o) {
        if (column.columnname != o.name) {
          return _.set(o, 'ordered', false);
        } else {
          return o;
        }
      });
    });
  },

  methods: {
    gotoPage: function (page) {
      this.currentPage = page;
    }
  }
});

// TODO: Columns
Vue.component('grid-column', {
  props: {
    name: {
      type: String,
      required: true
    },
    "head-text": {
      type: String,
      default: this.name
    }
  },
  template: "<th @click=\"order\"> {{ headText }} <i :class=\"glyphiconClass\"></i></th>",
  data: function () {
    return {
      orderClass: "glyphicon-triangle-bottom",
      ordered: false,
      sortDirection: "asc"
    };
  },

  computed: {
    glyphiconClass: function () {
      if (this.ordered) return "glyphicon pull-right " + this.orderClass;else return "glyphicon pull-right glyphicon-triangle-bottom";
    }
  },
  methods: {
    order: function () {
      this.ordered = true;
      if (this.orderClass == "glyphicon-triangle-bottom") {
        this.orderClass = "glyphicon-triangle-top";
        this.sortDirection = "asc";
      } else {
        this.orderClass = "glyphicon-triangle-bottom";
        this.sortDirection = "desc";
      }
      this.$parent.$emit('column_ordered', { columnname: this.name, sortdir: this.sortDirection });
    }
  }
});

var app = new Vue({
  el: '#root',
  data: function () {
    return {
      namelst: ["karthi", "selva", "sathis", "sabari"]
    };
  }
});